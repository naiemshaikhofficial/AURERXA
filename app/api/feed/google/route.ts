import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const supabaseServer = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        cookies: {
            getAll() { return [] },
            setAll() { },
        },
    }
)

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aurerxa.com'

    const { data: products, error } = await supabaseServer
        .from('products')
        .select(`
            id, name, description, price, image_url, images, stock, slug,
            purity, gender, weight_grams, material_type, tags,
            categories(slug, name)
        `)
        .order('created_at', { ascending: false })

    if (error || !products) {
        return new NextResponse('Error fetching products', { status: 500 })
    }

    const escapeXml = (str: string) => {
        if (!str) return ''
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
    }

    const items = products.map((p: any) => {
        const categoryName = Array.isArray(p.categories) ? p.categories[0]?.name : p.categories?.name
        const availability = p.stock && p.stock > 0 ? 'in_stock' : 'out_of_stock'
        const condition = 'new'
        const productUrl = `${baseUrl}/products/${p.slug}`
        const imageUrl = p.image_url || `${baseUrl}/logo-new.webp`

        // Google product category for jewelry
        const googleCategory = 'Apparel & Accessories > Jewelry'
        const productType = categoryName ? `Jewelry > ${categoryName}` : 'Jewelry'

        // Material/color mapping
        let color = 'Gold'
        if (p.material_type?.includes('Silver')) color = 'Silver'
        else if (p.material_type?.includes('Rose')) color = 'Rose Gold'
        else if (p.material_type?.includes('Diamond')) color = 'Gold'

        // Gender mapping for Google
        let gender = 'unisex'
        if (p.gender?.toLowerCase() === 'women' || p.gender?.toLowerCase() === 'female') gender = 'female'
        else if (p.gender?.toLowerCase() === 'men' || p.gender?.toLowerCase() === 'male') gender = 'male'

        // Additional images (up to 10)
        const additionalImages = (p.images || []).slice(0, 10).map((img: string) =>
            `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`
        ).join('\n            ')

        // Custom labels for Google Shopping campaigns
        const label0 = p.material_type || 'Jewelry'
        const label1 = categoryName || 'All'
        const label2 = p.purity || ''
        const label3 = p.price > 50000 ? 'Premium' : p.price > 10000 ? 'Mid-Range' : 'Affordable'

        const description = p.description
            ? escapeXml(p.description.substring(0, 5000))
            : escapeXml(`Buy ${p.name} online at AURERXA. Premium handcrafted ${p.material_type || ''} ${categoryName || 'jewelry'}. Free shipping across India.`)

        const purityLabel = p.purity ? `${p.purity} ` : ''
        const materialLabel = p.material_type || 'Jewelry'
        const fullTitle = `${purityLabel}${materialLabel} ${categoryName || 'Jewelry'} | ${p.name} | AURERXA`

        return `
        <item>
            <g:id>${escapeXml(p.id)}</g:id>
            <g:title>${escapeXml(fullTitle)}</g:title>
            <g:description>${description}</g:description>
            <g:link>${productUrl}</g:link>
            <g:image_link>${escapeXml(imageUrl)}</g:image_link>
            ${additionalImages}
            <g:availability>${availability}</g:availability>
            <g:price>${p.price} INR</g:price>
            <g:condition>${condition}</g:condition>
            <g:brand>AURERXA</g:brand>
            <g:mpn>${escapeXml(p.slug)}</g:mpn>
            <g:google_product_category>${googleCategory}</g:google_product_category>
            <g:product_type>${escapeXml(productType)}</g:product_type>
            <g:gender>${gender}</g:gender>
            <g:color>${color}</g:color>
            <g:material>${escapeXml(p.material_type || 'Jewelry')}</g:material>
            <g:age_group>adult</g:age_group>
            <g:item_group_id>${escapeXml(categoryName || 'jewelry')}</g:item_group_id>
            <g:shipping>
                <g:country>IN</g:country>
                <g:service>Standard</g:service>
                <g:price>0 INR</g:price>
            </g:shipping>
            <g:custom_label_0>${escapeXml(label0)}</g:custom_label_0>
            <g:custom_label_1>${escapeXml(label1)}</g:custom_label_1>
            <g:custom_label_2>${escapeXml(label2)}</g:custom_label_2>
            <g:custom_label_3>${escapeXml(label3)}</g:custom_label_3>
            ${p.weight_grams ? `<g:product_weight>${p.weight_grams} g</g:product_weight>` : ''}
            ${(p.tags || []).map((tag: string) => `<g:product_highlight>${escapeXml(tag)}</g:product_highlight>`).join('\n            ')}
        </item>`
    }).join('')

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
    <channel>
        <title>AURERXA - Premium Luxury Jewelry</title>
        <link>${baseUrl}</link>
        <description>AURERXA's complete product catalog for Google Shopping. Premium handcrafted luxury jewelry including gold, diamond, and fashion jewelry.</description>
        ${items}
    </channel>
</rss>`

    return new NextResponse(feed, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    })
}
