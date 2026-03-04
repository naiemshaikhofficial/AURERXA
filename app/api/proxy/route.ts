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

        // Fetch the target with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        let response = await fetch(decodedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            cache: 'force-cache',
            next: { revalidate: 86400 }, // Cache for 24h
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        let contentType = response.headers.get("content-type") || "";
        let data: ArrayBuffer;

        // If it's an HTML page (ImageShack viewer), parse for direct link
        if (contentType.includes("text/html")) {
            const html = await response.text();
            const directImageUrl =
                html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] ||
                html.match(/https?:\/\/[^"']+\.imageshack\.com\/img\d+\/[^"']+\.(?:jpg|jpeg|png|webp)/i)?.[0];

            if (directImageUrl) {
                const imgRes = await fetch(directImageUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    cache: 'force-cache',
                    next: { revalidate: 86400 }
                });
                contentType = imgRes.headers.get("content-type") || "image/jpeg";
                data = await imgRes.arrayBuffer();
            } else {
                return NextResponse.json({ error: "Could not find direct image" }, { status: 404 });
            }
        } else {
            data = await response.arrayBuffer();
        }

        return new NextResponse(data, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400",
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
