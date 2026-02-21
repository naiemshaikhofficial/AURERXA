import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'AURERXA | World-Class Luxury & Bespoke Jewelry India',
        short_name: 'AURERXA',
        description: 'Bespoke high-end jewelry handcrafted to perfection in India. Discover the timeless heritage and certified luxury of AURERXA.',
        start_url: '/',
        id: '/?source=pwa',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#D4AF37',
        orientation: 'portrait',
        categories: ['jewelry', 'fashion', 'luxury', 'lifestyle'],
        icons: [
            {
                src: '/favicon.ico',
                sizes: '48x48',
                type: 'image/x-icon',
                purpose: 'any'
            },
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            },
        ],
        screenshots: [
            {
                src: '/photo_6066572646712807057_y.jpg',
                sizes: '1080x1920',
                type: 'image/jpeg',
                form_factor: 'narrow',
                label: 'AURERXA Heritage'
            },
            {
                src: '/photo_6066572646712807064_y.jpg',
                sizes: '1080x1920',
                type: 'image/jpeg',
                form_factor: 'wide',
                label: 'Our Craftsmen'
            }
        ]
    }
}
