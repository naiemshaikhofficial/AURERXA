export default function supabaseLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
    // If it's a relative path (like /logo.png), return as is
    if (src.startsWith('/')) {
        return src
    }

    // If it's from Supabase, use their Image Transformation API
    if (src.includes('supabase.co')) {
        // Standard URL: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
        // Transform URL: https://<project>.supabase.co/storage/v1/render/image/public/<bucket>/<path>?width=<w>&quality=<q>&resize=contain

        // Check if it's an object URL that can be transformed
        if (src.includes('/storage/v1/object/')) {
            const transformedUrl = src.replace('/storage/v1/object/', '/storage/v1/render/image/')

            // Add transformation parameters
            // We use resize=contain to preserve aspect ratio within the Next.js provided width
            return `${transformedUrl}?width=${width}&quality=${quality || 75}&resize=contain`
        }
    }

    // Fallback for other external images or non-transformable Supabase URLs
    return src
}
