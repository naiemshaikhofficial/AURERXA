export default function supabaseLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
    // If it's a relative path starting with /, return with query params to satisfy Next.js loader check
    if (src.startsWith('/')) {
        return `${src}${src.includes('?') ? '&' : '?'}width=${width}&quality=${quality || 75}`
    }

    // Check if it's already proxied to our internal endpoint
    if (src.startsWith('/api/supabase/storage/v1/object/')) {
        const transformedUrl = src.replace('/storage/v1/object/', '/storage/v1/render/image/')
        return `${transformedUrl}?width=${width}&quality=${quality || 75}&resize=contain&format=avif`
    }

    // If it's from Supabase, route it through our Proxy to bypass ISP blocking
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

    // Fallback for other external images
    return `${src}${src.includes('?') ? '&' : '?'}width=${width}&quality=${quality || 75}`;
}
