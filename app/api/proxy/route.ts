import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

// Generic proxy for external assets (like ImageShack) that face ISP blocking or CORS issues
export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 });
    }

    try {
        const decodedUrl = decodeURIComponent(url);

        // Security: Restrict to known necessary domains to prevent open proxying
        const targetUrl = new URL(decodedUrl);
        const allowedDomains = ['imageshack.com', 'imagizer.imageshack.com', 'img.icons8.com'];
        const isAllowed = allowedDomains.some(domain => targetUrl.hostname.endsWith(domain));

        if (!isAllowed) {
            return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
        }

        // Fetch the target
        let response = await fetch(decodedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            cache: 'force-cache',
            next: { revalidate: 3600 * 24 } // Cache for 24h
        });

        // If it's an HTML page (common with ImageShack viewer links), try to find the direct image URL
        let contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/html")) {
            const html = await response.text();
            // Look for og:image or similar meta tags
            const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

            if (ogImageMatch && ogImageMatch[1]) {
                const directImageUrl = ogImageMatch[1];
                // Fetch the actual image now
                response = await fetch(directImageUrl, {
                    headers: { 'User-Agent': 'Aurerxa-Proxy' },
                    cache: 'force-cache',
                    next: { revalidate: 3600 * 24 }
                });
                contentType = response.headers.get("content-type") || "image/jpeg";
            }
        }

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch remote asset" }, { status: response.status });
        }

        const data = await response.arrayBuffer();
        // Fallback for content-type if extraction failed but we have data
        const finalContentType = contentType.includes("text/html") ? "image/jpeg" : contentType;

        return new NextResponse(data, {
            status: 200,
            headers: {
                "Content-Type": finalContentType,
                "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error: any) {
        console.error("External Proxy Error:", error);
        return NextResponse.json(
            { error: "Proxy request failed", details: error.message },
            { status: 502 }
        );
    }
}
