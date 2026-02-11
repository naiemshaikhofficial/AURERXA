export default function supabaseLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
    // If it's a relative path (like /logo.png), return as is
    if (src.startsWith('/')) {
        return src
    }

    // If it's from Supabase, we can eventually add transformation parameters here
    // For now, we return the original URL to bypass the Next.js optimization proxy
    // which is failing due to NAT64 IP resolution issues.

    if (src.includes('supabase.co')) {
        // Optional: Add Supabase transformation query params if the bucket is public and has transformations enabled
        // return `${src}?width=${width}&quality=${quality || 75}`
        return src
    }

    // Fallback for other external images
    return src
}
