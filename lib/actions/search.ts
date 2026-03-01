'use server'

import { unstable_cache } from 'next/cache'
import { supabaseServer, _cacheGet, _cacheSet } from './utils'

export async function getFilteredProducts(options: any) {
    return unstable_cache(
        async () => {
            let query = supabaseServer
                .from('products')
                .select('*, categories(id, name, slug)')
                .eq('material_type', 'silver')

            const categorySlug = options.category || options.material
            if (categorySlug && categorySlug !== 'all') {
                const ck = `cat:${categorySlug}`
                let catId = _cacheGet<string>(ck)
                if (!catId) {
                    const { data: cat } = await supabaseServer.from('categories').select('id').eq('slug', categorySlug).maybeSingle()
                    if (cat) { _cacheSet(ck, cat.id); catId = cat.id }
                }
                if (catId) query = query.eq('category_id', catId)
            }

            // ... other complex filtering logic (from original actions.ts)

            const { data, error } = await query
            if (error) return []
            return data || []
        },
        ['filtered-products', JSON.stringify(options)],
        { revalidate: 3600, tags: ['products'] }
    )()
}

export async function searchProducts(query: string) {
    const { data, error } = await supabaseServer
        .from('products')
        .select('*, categories(name)')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10)

    if (error) return []
    return data
}

export async function searchAIKnowledge(query: string, limit: number = 3) {
    try {
        if (!process.env.OPENAI_API_KEY) return []
        // Hybrid Search: Vector + Keyword...
        return [] // Mock for now, same as original
    } catch (err) {
        return []
    }
}
