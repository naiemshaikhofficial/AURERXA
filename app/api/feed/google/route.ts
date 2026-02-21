import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export async function GET() {
    const baseUrl = 'https://www.aurerxa.com'

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

    const escapeXml = (str: any) => {
        if (str === null || str === undefined) return ''
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove control characters
    }

    const items = products.map((p: any) => {
        if (!p.slug || !p.name) return ''

        const categoryName = Array.isArray(p.categories) ? p.categories[0]?.name : (p.categories?.name || 'Jewelry')
        const availability = (p.stock && p.stock > 0) ? 'in_stock' : 'out_of_stock'
        const productUrl = `${baseUrl}/products/${p.slug}`
        const imageUrl = p.image_url || `${baseUrl}/logo-new.webp`

        // Google requirements
        const googleCategory = 'Apparel &amp; Accessories &gt; Jewelry'
        const productType = `Jewelry &gt; ${escapeXml(categoryName)}`
        const description = (p.description || '').substring(0, 4500)
        const fullTitle = `${escapeXml(p.purity || '')} ${escapeXml(p.material_type || 'Jewelry')} ${escapeXml(categoryName)} | ${escapeXml(p.name)} | AURERXA`.trim().replace(/\s+/g, ' ')

        // Additional Images
        const additionalImages = (p.images || []).slice(0, 10)
            .filter((img: any) => !!img)
            .map((img: string) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
            .join('\n')

        // Tags / Highlights
        const highlights = (p.tags || []).slice(0, 10)
            .filter((t: any) => !!t)
            .map((tag: string) => `<g:product_highlight>${escapeXml(tag)}</g:product_highlight>`)
            .join('\n')

        return `<item>
<g:id>${escapeXml(p.id)}</g:id>
<g:title>${escapeXml(fullTitle)}</g:title>
<g:description><![CDATA[${description}]]></g:description>
<g:link>${escapeXml(productUrl)}</g:link>
<g:image_link>${escapeXml(imageUrl)}</g:image_link>
${additionalImages ? additionalImages + '\n' : ''}<g:availability>${availability}</g:availability>
<g:price>${p.price || 0} INR</g:price>
<g:condition>new</g:condition>
<g:brand>AURERXA</g:brand>
<g:mpn>${escapeXml(p.slug.toUpperCase())}</g:mpn>
<g:identifier_exists>no</g:identifier_exists>
<g:google_product_category>${googleCategory}</g:google_product_category>
<g:product_type>${productType}</g:product_type>
<g:gender>${escapeXml(p.gender?.toLowerCase() === 'men' ? 'male' : p.gender?.toLowerCase() === 'women' ? 'female' : 'unisex')}</g:gender>
<g:color>${escapeXml(p.material_type?.includes('Silver') ? 'Silver' : p.material_type?.includes('Rose') ? 'Rose Gold' : 'Gold')}</g:color>
<g:material>${escapeXml(p.material_type || 'Jewelry')}</g:material>
<g:age_group>adult</g:age_group>
<g:shipping>
<g:country>IN</g:country>
<g:service>Standard Insured Shipping</g:service>
<g:price>0 INR</g:price>
</g:shipping>
<g:tax>
<g:country>IN</g:country>
<g:rate>3</g:rate>
<g:tax_ship>yes</g:tax_ship>
</g:tax>
${highlights ? highlights + '\n' : ''}</item>`
    }).filter(Boolean).join('\n')

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>AURERXA - Premium Luxury Jewelry</title>
<link>${baseUrl}</link>
<description>AURERXA product catalog for Google Shopping.</description>
${items}
</channel>
</rss>`

    return new NextResponse(feed.trim(), {
        status: 200,
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
    })
}

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>AURERXA - Premium Luxury Jewelry</title>
<link>${baseUrl}</link>
<description>AURERXA catalog for Google Shopping. Premium handcrafted luxury jewelry.</description>
${items}
</channel>
</rss>`

return new NextResponse(feed.trim(), {
    status: 200,
    headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
    },
})
}
