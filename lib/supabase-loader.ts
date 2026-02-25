export default function supabaseLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
    // Check if it's already proxied to our internal endpoint
    if (src.startsWith('/api/supabase/storage/v1/object/')) {
        const transformedUrl = src.replace('/storage/v1/object/', '/storage/v1/render/image/')
        return `${transformedUrl}?width=${width}&quality=${quality || 75}&resize=contain&format=avif`
    }

    // If it's a relative path (not our proxy), return as is
    if (src.startsWith('/')) {
        return src
    }

    // If it's from Supabase, route it through our Proxy to bypass ISP blocking
    if (src.includes('supabase.co')) {
        // Find the beginning of the Supabase path (starting from /storage/v1/...)
        const storageMatch = src.match(/\/storage\/v1\/.*/);
        if (storageMatch) {
            const supabasePath = storageMatch[0];

            // Redirect to our local proxy
            let proxiedUrl = `/api/supabase${supabasePath}`;

            // If it's an object URL that can be transformed, use the render API
            if (supabasePath.includes('/storage/v1/object/')) {
                proxiedUrl = proxiedUrl.replace('/storage/v1/object/', '/storage/v1/render/image/');

                // Add transformation parameters for performance
                return `${proxiedUrl}?width=${width}&quality=${quality || 75}&resize=contain&format=avif`;
            }

            return proxiedUrl;
        }
    }

    // Fallback for other external images or non-transformable Supabase URLs
    return src;
}
