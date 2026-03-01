import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Common malicious bot / scraper User-Agents to block at edge
const BLOCKED_UA_PATTERNS = [
    /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /zgrab/i,
    /python-requests\/(?!.*aurerxa)/i,
    /go-http-client\/(?!.*aurerxa)/i,
    /curl\/(?!.*aurerxa)/i,
    /wget/i,
    /scrapy/i,
    /petalbot/i,
]

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // --- 0. BOT & SCRAPER BLOCKING ---
    const ua = request.headers.get('user-agent') || ''
    if (BLOCKED_UA_PATTERNS.some(p => p.test(ua))) {
        return new NextResponse('Forbidden', { status: 403 })
    }

    // --- 1. OPTIMIZATION: SKIP AUTH FOR STATIC ASSETS ---
    const isAsset = /\.(?:ico|png|jpg|jpeg|gif|svg|webp|js|css|woff2?|webmanifest|json|txt|map)$/.test(pathname)
    if (
        pathname.startsWith('/_next') ||
        isAsset ||
        pathname.startsWith('/api/supabase')
    ) {
        const response = NextResponse.next()
        response.headers.set('x-pathname', pathname)
        return response
    }

    // --- 2. AUTHENTICATION (SUPABASE SSR) ---
    // We create an initial response that we can modify
    let response = NextResponse.next({
        request: {
            headers: new Headers(request.headers),
        },
    })

    // Set pathname header for RootLayout
    response.headers.set('x-pathname', pathname)

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        // Update request cookies for the next() handler downstream
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        )

                        // Re-create the response to ensure cookies are included in the downstream request
                        response = NextResponse.next({
                            request,
                        })

                        // Set response cookies for the browser
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, {
                                ...options,
                                sameSite: 'lax',
                                secure: process.env.NODE_ENV === 'production'
                            })
                        )

                        // Re-apply pathname header after re-creating response
                        response.headers.set('x-pathname', pathname)
                    },
                },
                cookieOptions: {
                    name: 'sb-xquczexikijzbzcuvmqh-auth-token',
                    path: '/',
                    sameSite: 'lax',
                    secure: process.env.NODE_ENV === 'production',
                }
            }
        )

        // Refresh session if expired - this is what ensures persistence
        // Wrap in timeout to prevent site from hanging if Supabase is slow
        try {
            await Promise.race([
                supabase.auth.getUser(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Auth timeout')), 3000)
                )
            ])
        } catch (authError: any) {
            // If auth times out or fails, still serve the page (guest experience)
            // The client-side auth will handle re-authentication
            if (authError?.message !== 'Auth timeout') {
                console.warn('Middleware auth check failed:', authError?.message)
            }
        }

        // 3. Security Headers (Skip for payment callback to avoid framing/POST issues)
        if (!pathname.startsWith('/api/payment/ccavenue/callback')) {
            response.headers.set('X-Frame-Options', 'DENY')
            response.headers.set('X-Content-Type-Options', 'nosniff')
            response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
        }

        return response
    } catch (error) {
        console.error('Middleware Auth Error:', error)
        return response
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
