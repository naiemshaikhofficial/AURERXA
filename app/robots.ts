import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.aurerxa.com'

    return {
        rules: [
            {
                userAgent: 'Googlebot-Image',
                allow: ['/api/supabase/proxy/', '/products/'],
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: '*',
                allow: [
                    '/', '/products/', '/collections/', '/blogs/', '/our-story',
                    '/about', '/contact', '/faq', '/privacy', '/terms',
                    '/returns', '/stores', '/size-guide', '/shipping', '/help',
                    '/custom-jewelry', '/the-price-of-perfection'
                ],
                disallow: [
                    '/admin/', '/api/', '/account/', '/checkout/', '/cart/',
                    '/login/', '/signup/', '/forgot-password/', '/verify-email/',
                    '/banned/', '/maintenance/'
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    }
}
