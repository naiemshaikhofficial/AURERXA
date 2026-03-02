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
        const allowedDomains = ['imageshack.com', 'imagizer.imageshack.com'];
        const isAllowed = allowedDomains.some(domain => targetUrl.hostname.endsWith(domain));

        if (!isAllowed) {
            return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
        }

        // Fetch the image
        const response = await fetch(decodedUrl, {
            headers: {
                'User-Agent': request.headers.get('User-Agent') || 'Aurerxa-Proxy',
            },
            cache: 'force-cache',
            next: { revalidate: 3600 * 24 } // Cache for 24h
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch remote asset" }, { status: response.status });
        }

        const data = await response.arrayBuffer();
        const contentType = response.headers.get("content-type") || "image/jpeg";

        return new NextResponse(data, {
            status: 200,
            headers: {
                "Content-Type": contentType,
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
