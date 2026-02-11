import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'AURERXA - Premium Luxury Jewelry',
        short_name: 'AURERXA',
        description: 'Timeless Luxury Crafted to Perfection',
        start_url: '/',
        id: '/?source=pwa',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#D4AF37',
        orientation: 'portrait',
        categories: ['jewelry', 'fashion', 'luxury'],
        icons: [
            {
                src: '/favicon%2030x30.ico',
                sizes: 'any',
                type: 'image/x-icon',
                purpose: 'any'
            },
            {
                src: '/favicon%2030x30.ico',
                sizes: '192x192',
                type: 'image/x-icon',
                purpose: 'maskable'
            },
            {
                src: '/favicon%2030x30.ico',
                sizes: '512x512',
                type: 'image/x-icon',
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
