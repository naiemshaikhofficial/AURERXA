export default function supabaseLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
    // 1. Handle already proxied Supabase URLs (Internal Endpoint)
    if (src.startsWith('/api/supabase/storage/v1/object/')) {
        const transformedUrl = src.replace('/storage/v1/object/', '/storage/v1/render/image/')
        return `${transformedUrl}?width=${width}&quality=${quality || 75}&resize=contain&format=avif`
    }

    // 2. Handle Direct Supabase URLs (External)
    if (src.includes('supabase.co')) {
        const storageMatch = src.match(/\/storage\/v1\/.*/);
        if (storageMatch) {
            const supabasePath = storageMatch[0];
            let proxiedUrl = `/api/supabase${supabasePath}`;

            if (supabasePath.includes('/storage/v1/object/')) {
                proxiedUrl = proxiedUrl.replace('/storage/v1/object/', '/storage/v1/render/image/');
                return `${proxiedUrl}?width=${width}&quality=${quality || 75}&resize=contain&format=avif`;
            }
            return `${proxiedUrl}${proxiedUrl.includes('?') ? '&' : '?'}width=${width}&quality=${quality || 75}`;
        }
    }

    // 3. Handle Other Images (Local Assets & External URLs like Pexels/Unsplash)
    // We route these through Next.js built-in Image Optimization API
    // This ensures that local 20MB files are compressed and resized to exactly the width needed.
    const baseUrl = '/_next/image'
    const params = new URLSearchParams({
        url: src,
        w: width.toString(),
        q: (quality || 75).toString(),
    })

    return `${baseUrl}?${params.toString()}`
}
