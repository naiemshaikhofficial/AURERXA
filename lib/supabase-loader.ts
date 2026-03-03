export default function supabaseLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
    // We route images through Next.js built-in Image Optimization API (/_next/image)
    // This is the most robust way to handle both local and external images (like Supabase, Pexels, etc.)
    // Benefits:
    // 1. Works on Supabase Free Plan (Supabase's own resizer requires Pro).
    // 2. Bypasses Indian ISP blocking of Supabase domains (Next.js server fetches the image).
    // 3. Ensures 20MB+ original files are compressed to ~50KB at the exact width needed.

    // If the URL is already an absolute path to /_next/image (unlikely but safe to check), return as is
    if (src.includes('/_next/image?url=')) return src

    const baseUrl = '/_next/image'

    // We pass the source URL to Next.js's optimizer. 
    // This works for:
    // - Local paths like /api/supabase/... (proxied images)
    // - Absolute URLs like https://xyz.supabase.co/... (checked against remotePatterns in next.config.mjs)
    // - Public assets like /logo.png

    const params = new URLSearchParams({
        url: src,
        w: width.toString(),
        q: (quality || 75).toString(),
    })

    return `${baseUrl}?${params.toString()}`
}
