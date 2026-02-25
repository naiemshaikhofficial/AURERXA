import { NextRequest, NextResponse } from "next/server";

// This is a proxy route to bypass Indian ISP blocking of supabase.co domains
// It forwards requests from /api/supabase/* to https://<PROJECT_REF>.supabase.co/*
// ONLY for use by the Next.js client-side application. 

// Next.js 16: params is a Promise and must be awaited
type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
    const { path } = await context.params;
    return handleProxy(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
    const { path } = await context.params;
    return handleProxy(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
    const { path } = await context.params;
    return handleProxy(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    const { path } = await context.params;
    return handleProxy(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const { path } = await context.params;
    return handleProxy(request, path);
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
        },
    });
}

async function handleProxy(request: NextRequest, path: string[]) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
        return NextResponse.json({ error: "Missing Supabase URL config" }, { status: 500 });
    }

    // Construct the target URL
    const pathString = path ? path.join("/") : "";
    const targetUrl = new URL(`/${pathString}`, supabaseUrl);

    // Append any query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
        targetUrl.searchParams.append(key, value);
    });

    // Prepare headers to forward
    const headers = new Headers();
    request.headers.forEach((value, key) => {
        // Forward relevant headers, exclude host-specific and encoding ones
        if (
            !['host', 'connection', 'content-length', 'accept-encoding'].includes(key.toLowerCase())
        ) {
            headers.set(key, value);
        }
    });

    try {
        const rawBody = request.body ? await request.arrayBuffer() : undefined;

        // Abort after 10s to fail fast when Supabase is unreachable
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        // Fetch from the actual Supabase server
        const response = await fetch(targetUrl.toString(), {
            method: request.method,
            headers,
            body: rawBody,
            redirect: 'manual',
            cache: 'no-store',
            signal: controller.signal,
        });

        clearTimeout(timeout);

        // Create a new response to send back to the client
        const responseHeaders = new Headers();

        // Only forward specific allowed headers from Supabase
        // CRITICAL: We MUST strip 'content-encoding' because fetch() might have already decompressed it.
        // Forwarding it would cause ERR_CONTENT_DECODING_FAILED in the browser.
        response.headers.forEach((value, key) => {
            const lowKey = key.toLowerCase();
            if (!['content-encoding', 'transfer-encoding', 'content-length', 'connection'].includes(lowKey)) {
                responseHeaders.set(key, value);
            }
        });

        // Ensure CORS headers are present for the client
        responseHeaders.set("Access-Control-Allow-Origin", "*");

        // Read body as array buffer
        const data = await response.arrayBuffer();

        return new NextResponse(data, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error: any) {
        console.error("Supabase Proxy Error:", error);
        return NextResponse.json(
            { error: "Proxy request failed", details: error.message },
            { status: 502 }
        );
    }
}
