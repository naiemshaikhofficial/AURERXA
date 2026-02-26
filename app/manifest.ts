import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "AURERXA | Authentic Luxury & Bespoke Jewelry Heritage",
        short_name: "AURERXA",
        description: "AURERXA: Elevating Indian luxury. Explore our legacy of gold necklaces, diamond earrings, and bespoke jewelry.",
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#D4AF37",
        icons: [
            {
                src: "/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable"
            },
            {
                src: "/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any"
            }
        ],
        orientation: "portrait",
        scope: "/"
    }
}
