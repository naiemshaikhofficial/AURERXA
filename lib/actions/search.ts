'use server'

import { unstable_cache } from 'next/cache'
import { supabaseServer, _cacheGet, _cacheSet } from './utils'

export async function getFilteredProducts(options: any) {
    return unstable_cache(
        async () => {
            try {
                let query = supabaseServer
                    .from('products')
                    .select(`
                        id, name, price, image_url, slug, purity, material_type, 
                        bestseller, created_at, category_id, sub_category_id,
                        categories(id, name, slug)
                    `)

                // Apply Category filter
                const categorySlug = options.category
                if (categorySlug && categorySlug !== 'all') {
                    const ck = `cat:${categorySlug}`
                    let catId = _cacheGet<string>(ck)
                    if (!catId) {
                        const { data: cat } = await supabaseServer.from('categories').select('id').ilike('slug', categorySlug).maybeSingle()
                        if (cat) { _cacheSet(ck, cat.id); catId = cat.id }
                    }
                    if (catId) query = query.eq('category_id', catId)
                }

                // Apply Tag/Occasion/Sub-category filter
                const subCategorySlug = options.sub_category
                const tagOrOccasion = options.tag || (options.occasion && options.occasion !== 'all' ? options.occasion : null)

                if (subCategorySlug || tagOrOccasion) {
                    let conditions = []

                    if (subCategorySlug && subCategorySlug !== 'all') {
                        const sk = `subcat:${subCategorySlug.toLowerCase()}`
                        let subCatId = _cacheGet<string>(sk)
                        if (!subCatId) {
                            const { data: subCat } = await supabaseServer.from('sub_categories').select('id').ilike('slug', subCategorySlug).maybeSingle()
                            if (subCat) {
                                _cacheSet(sk, subCat.id);
                                subCatId = subCat.id
                            } else if (subCategorySlug.toLowerCase().includes('bracel')) {
                                // Try common alternate spellings
                                const alt = subCategorySlug.toLowerCase().includes('lates') ? 'bracelets' : 'bracelates'
                                const { data: subCatAlt } = await supabaseServer.from('sub_categories').select('id').ilike('slug', alt).maybeSingle()
                                if (subCatAlt) { _cacheSet(sk, subCatAlt.id); subCatId = subCatAlt.id }
                            }
                        }
                        if (subCatId) {
                            conditions.push(`sub_category_id.eq.${subCatId}`)
                        }
                    }

                    if (tagOrOccasion && tagOrOccasion !== 'all') {
                        // contains filter for array can't be easily put in .or() without specific syntax
                        // so we handle it by searching for the tag if sub-category wasn't found or as a separate check
                        if (conditions.length === 0) {
                            query = query.contains('tags', [tagOrOccasion])
                        } else {
                            // If we have both, we use .or with the sub_category_id and a name/description check as fallback for tag
                            conditions.push(`tags.cs.{"${tagOrOccasion}"}`)
                        }
                    }

                    if (conditions.length > 0) {
                        query = query.or(conditions.join(','))
                    }
                }

                // Apply Gender filters (Case-insensitive)
                if (options.gender && options.gender !== 'all') {
                    query = query.ilike('gender', options.gender)
                }

                // Apply Purity filter
                if (options.purity && options.purity !== 'all') {
                    // Supporting both "999" and "999 Silver" style strings
                    const purityVal = options.purity.toLowerCase().includes('silver')
                        ? options.purity.toLowerCase().replace(' silver', '').trim()
                        : options.purity.trim()
                    query = query.ilike('purity', `%${purityVal}%`)
                }

                // Apply Material filters
                const materialType = options.material_type || options.material
                if (materialType && materialType !== 'all') {
                    if (materialType === 'silver') {
                        // For silver, include items that are explicitly 'silver' OR null (default theme)
                        query = query.or(`material_type.eq.silver,material_type.is.null`)
                    } else {
                        query = query.eq('material_type', materialType)
                    }
                } else if (!tagOrOccasion && !options.search && !categorySlug && !subCategorySlug) {
                    // ONLY default to silver theme if NO other major filter is present at all
                    query = query.or(`material_type.eq.silver,material_type.is.null`)
                }

                // Apply Price filters
                if (options.minPrice !== undefined && options.minPrice !== null) query = query.gte('price', options.minPrice)
                if (options.maxPrice !== undefined && options.maxPrice !== null) query = query.lte('price', options.maxPrice)

                // Apply Sorting
                const sortBy = options.sortBy || 'newest'
                switch (sortBy) {
                    case 'price-low': query = query.order('price', { ascending: true }); break
                    case 'price-high': query = query.order('price', { ascending: false }); break
                    case 'newest': query = query.order('created_at', { ascending: false }); break
                    case 'popular': query = query.order('bestseller', { ascending: false }); break
                }

                // Apply Pagination
                const limit = options.limit || 20
                const offset = options.offset || 0
                query = query.range(offset, offset + limit - 1)

                const { data, error } = await query
                if (error) {
                    console.error('Error in getFilteredProducts:', error)
                    return []
                }
                return data || []
            } catch (err) {
                console.error('Crash in getFilteredProducts:', err)
                return []
            }
        },
        ['filtered-products', JSON.stringify(options)],
        { revalidate: 3600, tags: ['products'] }
    )()
}

export async function searchProducts(query: string) {
    if (!query) return []
    try {
        const { data, error } = await supabaseServer
            .from('products')
            .select(`
                id, name, price, image_url, slug, material_type,
                categories(name)
            `)
            .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
            .eq('material_type', 'silver') // Keep it theme-specific
            .limit(10)

        if (error) {
            console.error('Error in searchProducts:', error)
            return []
        }
        return data || []
    } catch (err) {
        console.error('Crash in searchProducts:', err)
        return []
    }
}

export async function getSearchSuggestions(query: string) {
    if (!query || query.length < 2) return { categories: [], tags: [], materials: [] }

    try {
        const [cats, products] = await Promise.all([
            supabaseServer.from('categories').select('name, slug').ilike('name', `%${query}%`).limit(3),
            supabaseServer.from('products').select('name, material_type').ilike('name', `%${query}%`).limit(5)
        ])

        const tags = Array.from(new Set(products.data?.map(p => p.name.split(' ')[0]) || []))
        const materials = Array.from(new Set(products.data?.map(p => p.material_type) || []))
            .map(m => ({ label: m.toUpperCase(), value: m }))

        return {
            categories: cats.data || [],
            tags: tags.slice(0, 5),
            materials: materials.slice(0, 2)
        }
    } catch (err) {
        return { categories: [], tags: [], materials: [] }
    }
}

export async function searchAIKnowledge(query: string, limit: number = 3) {
    try {
        if (!process.env.OPENAI_API_KEY) return []
        return []
    } catch (err) {
        return []
    }
}
