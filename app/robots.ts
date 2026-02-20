import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aurerxa.com'

    return {
        rules: [
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/admin/', '/api/', '/account/', '/checkout/', '/cart/', '/login/', '/signup/', '/forgot-password/', '/verify-email/', '/banned/'],
            },
            {
                userAgent: 'Googlebot-Image',
                allow: '/',
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/admin/', '/api/', '/account/', '/checkout/', '/cart/', '/login/', '/signup/'],
            },
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/account/', '/checkout/', '/cart/', '/login/', '/signup/', '/forgot-password/', '/verify-email/', '/banned/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    }
}
