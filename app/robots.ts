import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.aurerxa.com'

    return {
        rules: [
            {
                userAgent: 'Googlebot-Image',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/admin/', '/api/', '/account/', '/checkout/', '/cart/', '/login/', '/signup/', '/forgot-password/', '/verify-email/', '/banned/'],
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
