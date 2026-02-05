import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'AURERXA - Premium Luxury Jewelry',
        short_name: 'AURERXA',
        description: 'Timeless Luxury Crafted to Perfection',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#D4AF37',
        icons: [
            {
                src: '/Favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/logo.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
