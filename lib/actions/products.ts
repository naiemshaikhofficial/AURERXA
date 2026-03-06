'use server'

import { revalidateTag, unstable_cache } from 'next/cache'
import { supabaseServer, getAuthClient, checkIsAdmin, getGlobalConfig, getGoldRates } from './utils'
import { ProductData, ActionResponse, PricingEntry } from './types'
import { getDiameterForSize, getCircumferenceForSize } from '@/lib/ring-sizes'
import { notifyNewProduct } from '@/app/push-actions' // Path needs adjustment later or keep as is for now
import { sanitizeObject } from '@/lib/sanitizer'

// Pricing Options Internal Interface
interface PricingOptions {
    pricingType: string
    purity: string
    materialType: string
    baseWeight: number
    productBasePrice: number
    weightPerUnit: number | null
    baseSize: number
    makingType: string
    availableSizes: string[]
    packagingCostOverride: number | null
    platformFeePctOverride: number | null
    dimensions?: { width?: string; height?: string; unit?: string }
    marginPercentOverride?: number | null
    minPriceThreshold?: number | null
    taxPctOverride?: number | null
}

/**
 * Internal: Dynamic Pricing Engine for All Jewelry Categories
 */
async function getDynamicPricingMap(opts: PricingOptions): Promise<Record<string, PricingEntry> | null> {
    const {
        pricingType, purity, materialType, baseWeight, productBasePrice,
        weightPerUnit, baseSize, makingType, availableSizes,
        packagingCostOverride, platformFeePctOverride, dimensions,
        marginPercentOverride, minPriceThreshold, taxPctOverride
    } = opts

    // 1. Fetch metal rate + global config in parallel
    const [rateData, config] = await Promise.all([
        getGoldRates(),
        getGlobalConfig(),
    ])
    if (!rateData) return null

    // 2. Determine silver/gold rate
    let metalRate = 0
    const purityLower = purity?.toLowerCase() || ''
    const materialLower = materialType?.toLowerCase() || ''

    if (materialLower.includes('silver') || purityLower.includes('925') || purityLower.includes('92.5') || purityLower.includes('99.99')) {
        metalRate = rateData.rates['Silver 99.99'] || rateData.rates['Silver 925'] || rateData.rates['Silver 999'] || 85
    } else if (materialLower.includes('gold') || materialLower === 'real_gold') {
        metalRate = rateData.rates[purity] || rateData.rates['22K'] || 6500
    } else {
        metalRate = rateData.rates['Silver 925'] || rateData.rates['Silver 999'] || 85
    }

    const purityFactor = (purityLower.includes('925') || purityLower.includes('92.5')) ? 0.925 : 1.0

    const packagingCost = packagingCostOverride ?? config.packaging_cost
    const platformFeePct = platformFeePctOverride ?? config.platform_fee_pct
    const marginPct = marginPercentOverride ?? config.margin_percent
    const taxPct = taxPctOverride ?? config.tax_percent ?? 3.0
    const shippingCost = config.shipping_cost || 0

    const makingPct = makingType === 'Handcrafted'
        ? config.making_handcrafted_pct
        : makingType === 'Designer'
            ? config.making_designer_pct
            : config.making_plain_pct

    const dUnit = dimensions?.unit || 'mm'
    const ringThicknessRaw = parseFloat(dimensions?.height || '1.1') || 1.1
    const ringWidthRaw = parseFloat(dimensions?.width || '0.5') || 0.5
    const ringThickness = dUnit === 'cm' ? ringThicknessRaw * 10 : ringThicknessRaw
    const ringWidth = dUnit === 'cm' ? ringWidthRaw * 10 : ringWidthRaw

    const calculateFormulaPriceRaw = (weight: number): number => {
        if (isNaN(weight) || weight <= 0) return (productBasePrice && productBasePrice > 10) ? productBasePrice : (config.ring_base_price_size16 || 1999)

        const metalCost = weight * metalRate * purityFactor
        const makingCost = metalCost * (makingPct / 100)
        const baseCost = metalCost + makingCost + packagingCost
        const withFee = baseCost * (1 + platformFeePct / 100)
        const withMargin = withFee * (1 + marginPct / 100)
        const withShipping = withMargin + shippingCost
        const withTax = withShipping * (1 + taxPct / 100)

        return isNaN(withTax) || !isFinite(withTax) ? (productBasePrice || 1999) : withTax
    }

    const rawBasePrice = calculateFormulaPriceRaw(baseWeight)
    const anchorPrice = (productBasePrice && productBasePrice > 10) ? productBasePrice : (config.ring_base_price_size16 || 1999)
    const designPremiumMultiplier = anchorPrice / rawBasePrice

    const pricingMap: Record<string, PricingEntry> = {}

    const computeEntry = (param: number, label: string, isSize: boolean): PricingEntry => {
        let adjWeight: number
        let displayDims: string
        let diameter: string | undefined
        let circumference: string | undefined

        if (pricingType === 'size_based') {
            const baseRefSize = 16
            const baseCirc = getCircumferenceForSize(baseRefSize)
            const currentCirc = getCircumferenceForSize(label)
            const currentInnerD = getDiameterForSize(label)

            const sizeNum = parseInt(label)
            const weightRefLabel = (!isNaN(sizeNum) && sizeNum % 2 === 0) ? String(sizeNum + 1) : label
            const weightCirc = getCircumferenceForSize(weightRefLabel)

            adjWeight = baseWeight * (weightCirc / baseCirc)

            const wOut = ringWidth
            const dOut = currentInnerD.toFixed(2)
            const cOut = currentCirc.toFixed(2)

            displayDims = `Width: ${wOut}mm, Diameter: ${dOut}mm, Circumference: ${cOut}mm`
            diameter = `${dOut} mm`
            circumference = `${cOut} mm`
        } else if (pricingType === 'length_based') {
            adjWeight = (weightPerUnit ?? baseWeight) * param
            const wOut = dimensions?.width || '0.5'
            displayDims = `${wOut} x ${wOut} x ${param} "${dUnit === 'mm' ? '(inch)' : dUnit}`
        } else {
            adjWeight = baseWeight
            displayDims = dimensions?.width && dimensions.height
                ? `${dimensions.width} x ${dimensions.height} x ${dimensions?.height || '0'} ${dUnit}`
                : 'Standard'
        }

        adjWeight = Math.round(adjWeight * 100) / 100
        const rawFormulaPrice = calculateFormulaPriceRaw(adjWeight)
        let finalPrice = rawFormulaPrice * designPremiumMultiplier

        if (minPriceThreshold && finalPrice < minPriceThreshold) finalPrice = minPriceThreshold
        finalPrice = Math.floor(finalPrice / 100) * 100 + 99

        if (pricingType === 'size_based' && param === baseSize) {
            finalPrice = Math.floor(anchorPrice / 100) * 100 + 99
            if (anchorPrice % 100 === 99) finalPrice = anchorPrice
        }

        const mCost = adjWeight * metalRate * purityFactor
        const makCost = mCost * (makingPct / 100)
        const bCost = mCost + makCost + packagingCost

        return {
            price: finalPrice,
            weight: adjWeight,
            dimensions: displayDims,
            width: pricingType === 'size_based' ? `${ringWidth} mm` : undefined,
            diameter,
            circumference,
            metalCost: Math.round(mCost),
            makingCost: Math.round(makCost),
            baseCost: Math.round(bCost),
        }
    }

    if (pricingType === 'size_based') {
        const sizeList = availableSizes.length > 0 ? availableSizes : Array.from({ length: 25 }, (_, i) => String(i + 6))
        sizeList.forEach(sizeStr => {
            const size = parseInt(sizeStr)
            if (!isNaN(size)) pricingMap[sizeStr] = computeEntry(size, sizeStr, true)
        })
    } else if (pricingType === 'length_based') {
        const lengths = [6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]
        lengths.forEach(len => {
            pricingMap[String(len)] = computeEntry(len, `${len}"`, false)
        })
    } else if (pricingType === 'fixed') {
        pricingMap['default'] = computeEntry(0, 'Standard', false)
    }

    return pricingMap
}

const _getBestsellers = unstable_cache(
    async () => {
        const { data, error } = await supabaseServer
            .from('products')
            .select('id, name, price, image_url, slug, material_type, purity, categories(name)')
            .eq('bestseller', true)
            .limit(4)

        if (error) {
            console.error('Error fetching bestsellers:', error)
            return []
        }
        return data || []
    },
    ['bestsellers'],
    { revalidate: 86400, tags: ['products', 'bestsellers'] }
)

export async function getBestsellers() {
    return _getBestsellers()
}

export async function getNewReleases(limit: number = 8) {
    return unstable_cache(
        async () => {
            const { data, error } = await supabaseServer
                .from('products')
                .select('id, name, price, image_url, slug, material_type, purity, categories(name)')
                .order('created_at', { ascending: false })
                .limit(limit)

            if (error) {
                console.error('Error fetching new releases:', error)
                return []
            }
            return data || []
        },
        ['new-releases', limit.toString()],
        { revalidate: 86400, tags: ['products', 'new-releases'] }
    )()
}

export async function getProducts(categorySlug?: string, sortBy?: string) {
    return unstable_cache(
        async () => {
            let query = supabaseServer
                .from('products')
                .select('id, name, price, image_url, slug, material_type, purity, categories(id, name, slug)')
                .eq('material_type', 'silver')

            if (categorySlug) {
                const { data: cat } = await supabaseServer
                    .from('categories')
                    .select('id')
                    .eq('slug', categorySlug)
                    .single()

                if (cat) query = query.eq('category_id', cat.id)
            }

            if (sortBy === 'price-low') query = query.order('price', { ascending: true })
            else if (sortBy === 'price-high') query = query.order('price', { ascending: false })
            else query = query.order('created_at', { ascending: false })

            const { data, error } = await query
            if (error) {
                console.error('❌ Error fetching products:', error)
                return []
            }
            return data || []
        },
        ['products-list', categorySlug || 'all', sortBy || 'default'],
        { revalidate: 86400, tags: ['products'] }
    )()
}

export async function getProductBySlug(slug: string) {
    return unstable_cache(
        async () => {
            const { data, error } = await supabaseServer
                .from('products')
                .select(`
          id, name, description, price, image_url, images, stock, 
          sizes, featured, bestseller, slug, purity, gender, 
          weight_grams, dimensions_width, dimensions_height, 
          dimensions_length, dimensions_unit, video_url, tags, created_at,
          material_type,
          making_type, pricing_type, base_size, base_weight,
          weight_per_unit, packaging_cost_override, platform_fee_pct_override,
          fixed_price_override, is_dynamic_pricing,
          margin_percent_override, min_price_threshold, tax_pct_override,
          categories(slug, name)
        `)
                .ilike('slug', slug)
                .single()
            if (error || !data) return null

            const sanitizeName = (name: string) => name.replace(/ by AURERXA/gi, '').replace(/AURERXA /gi, '').trim()
            const product: any = {
                ...(data as object),
                name: sanitizeName(data.name),
                categories: data.categories ? (
                    Array.isArray(data.categories)
                        ? data.categories.map((c: any) => ({ ...(c as any), name: sanitizeName(c.name) }))
                        : { ...(data.categories as any), name: sanitizeName((data.categories as any).name) }
                ) : null
            }

            if (product.fixed_price_override) {
                product.dynamicPricingMap = null
                return product
            }

            if (product.is_dynamic_pricing && product.pricing_type && product.pricing_type !== 'none') {
                const dynamicMap = await getDynamicPricingMap({
                    pricingType: product.pricing_type,
                    purity: product.purity || '99.99',
                    materialType: product.material_type || 'silver',
                    baseWeight: (product.base_weight || product.weight_grams || 3.5),
                    productBasePrice: product.price,
                    weightPerUnit: product.weight_per_unit ?? null,
                    baseSize: product.base_size ?? 16,
                    makingType: product.making_type || 'Plain',
                    availableSizes: Array.isArray(product.sizes) ? product.sizes : [],
                    packagingCostOverride: product.packaging_cost_override ?? null,
                    platformFeePctOverride: product.platform_fee_pct_override ?? null,
                    dimensions: {
                        width: product.dimensions_width,
                        height: product.dimensions_height,
                        unit: product.dimensions_unit
                    },
                    marginPercentOverride: product.margin_percent_override ?? null,
                    minPriceThreshold: product.min_price_threshold ?? null,
                    taxPctOverride: product.tax_pct_override ?? null
                })
                if (dynamicMap) product.dynamicPricingMap = dynamicMap
            } else {
                const nameLower = product.name?.toLowerCase() || ''
                const categories = product.categories
                const catSlug = (Array.isArray(categories) ? categories[0]?.slug : categories?.slug) || ''
                const isRing = catSlug.includes('ring') || nameLower.includes('ring')

                if (isRing) {
                    const dynamicMap = await getDynamicPricingMap({
                        pricingType: 'size_based',
                        purity: product.purity || '99.99',
                        materialType: product.material_type || 'silver',
                        baseWeight: (product.base_weight || product.weight_grams || 3.5),
                        productBasePrice: product.price,
                        weightPerUnit: null,
                        baseSize: product.base_size ?? 16,
                        makingType: product.making_type || 'Plain',
                        availableSizes: Array.isArray(product.sizes) ? product.sizes : [],
                        packagingCostOverride: product.packaging_cost_override ?? null,
                        platformFeePctOverride: product.platform_fee_pct_override ?? null,
                        dimensions: {
                            width: product.dimensions_width,
                            height: product.dimensions_height,
                            unit: product.dimensions_unit
                        },
                        marginPercentOverride: product.margin_percent_override ?? null,
                        minPriceThreshold: product.min_price_threshold ?? null,
                        taxPctOverride: product.tax_pct_override ?? null
                    })
                    if (dynamicMap) product.dynamicPricingMap = dynamicMap
                }
            }

            // FINAL SAFETY: Ensure product is serializable for Next.js Server Components
            // This prevents "NaN is not a valid JSON value" or similar 500 errors in production
            const serializedProduct = JSON.parse(JSON.stringify(product, (key, value) => {
                if (typeof value === 'number') {
                    if (isNaN(value)) return 0
                    if (!isFinite(value)) return 0
                }
                return value
            }))

            return serializedProduct
        },
        [`product-${slug}`],
        { revalidate: 86400, tags: [`product:${slug}`, 'products'] }
    )()
}

export async function getAdminProducts() {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return []

    const { data, error } = await supabaseServer
        .from('products')
        .select('id, name, price, slug, created_at')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching admin products:', error)
        return []
    }
    return data || []
}

export async function addNewProduct(productData: ProductData): Promise<ActionResponse> {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return { success: false, error: 'Unauthorized' }

    const sanitizedData = sanitizeObject(productData)
    const client = await getAuthClient()

    const { data, error } = await client
        .from('products')
        .insert({
            ...sanitizedData,
            tags: sanitizedData.tags || [],
            created_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) {
        console.error('Add product error:', error)
        return { success: false, error: error.message }
    }

    // Trigger push notification (ignore errors here)
    try {
        await notifyNewProduct(data.name, data.slug, data.image_url || '/icon-192.png')
    } catch (e) { }

    revalidateTag('products', 'max')
    return { success: true, data }
}

export async function updateProductDetails(id: string, updates: Partial<ProductData>): Promise<ActionResponse> {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return { success: false, error: 'Unauthorized' }

    const client = await getAuthClient()
    const { error } = await client
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidateTag('products', 'max')
    return { success: true }
}

export async function deleteProduct(id: string): Promise<ActionResponse> {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return { success: false, error: 'Unauthorized' }

    const client = await getAuthClient()
    const { error } = await client
        .from('products')
        .delete()
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidateTag('products', 'max')
    return { success: true }
}

export async function getProductById(id: string) {
    return unstable_cache(
        async () => {
            const { data, error } = await supabaseServer
                .from('products')
                .select('id, name, description, price, image_url, images, stock, sizes, slug, purity, material_type, weight_grams, categories(id, name, slug)')
                .eq('id', id)
                .single()
            if (error) return null
            return data
        },
        [`product-id-${id}`],
        { revalidate: 3600, tags: ['products'] }
    )()
}

export async function getRelatedProducts(categoryId: string, currentProductId: string) {
    return unstable_cache(
        async () => {
            const { data, error } = await supabaseServer
                .from('products')
                .select('id, name, price, image_url, images, slug, weight_grams, categories(id, name, slug)')
                .eq('category_id', categoryId)
                .neq('id', currentProductId)
                .limit(4)

            if (error) return []
            return data || []
        },
        [`related-${categoryId}-${currentProductId}`],
        { revalidate: 3600, tags: ['products'] }
    )()
}

export async function getHeroSlides() {
    return unstable_cache(
        async () => {
            const { data, error } = await supabaseServer
                .from('hero_slides')
                .select('id, title, subtitle, image_url, mobile_image_url, link_url, button_text')
                .eq('is_active', true)
                .order('sort_order', { ascending: true })

            if (error) return []
            return data || []
        },
        ['hero-slides'],
        { revalidate: 86400, tags: ['hero-slides'] }
    )()
}

const _getUsedTags = unstable_cache(
    async () => {
        try {
            const { data, error } = await supabaseServer
                .from('products')
                .select('tags')
                .not('tags', 'is', null)

            if (error || !data) return []

            const allTags = data.flatMap(p => p.tags || [])
            const uniqueTags = Array.from(new Set(allTags.map(t => t.toLowerCase())))
                .map(t => {
                    if (t === 'genz') return 'GENZ'
                    if (t === 'modern') return 'Modern'
                    return t.charAt(0).toUpperCase() + t.slice(1)
                })
                .sort()

            return uniqueTags
        } catch (err) {
            console.error('Error fetching used tags:', err)
            return []
        }
    },
    ['used-tags'],
    { revalidate: 3600, tags: ['products'] }
)

export async function getUsedTags() {
    return _getUsedTags()
}

const _getGenderStats = unstable_cache(
    async () => {
        try {
            const g = ['men', 'women', 'unisex', 'kids']
            const counts: Record<string, number> = {}

            for (const gender of g) {
                const { count, error } = await supabaseServer
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .ilike('gender', gender)

                if (!error) counts[gender] = count || 0
            }

            return counts
        } catch (err) {
            return {}
        }
    },
    ['gender-stats'],
    { revalidate: 3600, tags: ['products'] }
)

export async function getGenderStats() {
    return _getGenderStats()
}

export async function getRecommendedProducts(productId: string, limit: number = 4) {
    return unstable_cache(
        async () => {
            // 1. Get current product info
            const { data: current } = await supabaseServer.from('products').select('category_id, tags').eq('id', productId).single()
            if (!current) return []

            // 2. Fetch similar products by category or tags
            const { data: matches, error } = await supabaseServer
                .from('products')
                .select('id, name, price, image_url, images, slug, weight_grams, categories(id, name, slug)')
                .neq('id', productId)
                .eq('material_type', 'silver')
                .or(`category_id.eq.${current.category_id},tags.cs.{${current.tags?.join(',') || ''}}`)
                .limit(limit)

            if (error) return []
            return matches || []
        },
        [`recommendations-${productId}`],
        { revalidate: 86400, tags: ['products', 'recommendations'] }
    )()
}
export async function getAllProductSlugs() {
    const { data, error } = await supabaseServer
        .from('products')
        .select('slug, updated_at')
        .order('created_at', { ascending: false })

    if (error) return []
    return data || []
}

