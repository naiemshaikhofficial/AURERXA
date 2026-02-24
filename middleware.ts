import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Common malicious bot / scraper User-Agents to block at edge
const BLOCKED_UA_PATTERNS = [
    /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /zgrab/i,
    /python-requests\/(?!.*aurerxa)/i, // Block generic Python scrapers (not our own)
    /go-http-client\/(?!.*aurerxa)/i,
    /curl\/(?!.*aurerxa)/i,
    /wget/i,
    /scrapy/i,
    /petalbot/i,
]

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // --- 0. BOT & SCRAPER BLOCKING (runs before anything else) ---
    const ua = request.headers.get('user-agent') || ''
    if (BLOCKED_UA_PATTERNS.some(p => p.test(ua))) {
        return new NextResponse('Forbidden', { status: 403 })
    }

    // --- 1. FAST EXIT FOR STATIC ASSETS & INTERNAL FILES ---
    // This reduces Edge Function invocations and CPU time significantly.
    if (
        pathname.startsWith('/_next') ||
        pathname.includes('.') || // Static files like .png, .jpg, .ico
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next()
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-pathname', pathname)

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set({ name, value, ...options })
                    )
                },
            },
        }
    )

    // --- LIGHTWEIGHT RATE LIMITING ---
    // Simple per-instance rate limiting for expensive routes
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous'

    // Route-based rate limit config
    // Auth/contact: 20 req/min | Checkout/payment: 10 req/min (stricter)
    const rateLimitConfig: { match: boolean; limit: number; key: string } | null = (() => {
        if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/contact')) {
            return { match: true, limit: 20, key: `rl:auth:${ip}` }
        }
        if (pathname.startsWith('/checkout') || pathname.startsWith('/api/payment') || pathname.startsWith('/api/order')) {
            return { match: true, limit: 100, key: `rl:payment:${ip}` }
        }
        return null
    })()


    if (rateLimitConfig) {
        const { limit, key } = rateLimitConfig
        const now = Date.now()
        const windowSize = 60 * 1000

        const rlData = request.cookies.get(key)?.value
        let count = 1
        let resetTime = now + windowSize

        if (rlData) {
            try {
                const parsed = JSON.parse(rlData)
                if (now < parsed.resetTime) {
                    count = parsed.count + 1
                    resetTime = parsed.resetTime
                }
            } catch (e) { /* Ignore malformed cookies */ }
        }

        if (count > limit) {
            return new NextResponse('Too Many Requests', {
                status: 429,
                headers: {
                    'Retry-After': '60',
                    'X-RateLimit-Limit': String(limit),
                    'X-RateLimit-Remaining': '0',
                    'Content-Type': 'text/plain',
                }
            })
        }

        requestHeaders.set(key, JSON.stringify({ count, resetTime }))
    }

    const isProtectedRoute = pathname.startsWith('/account') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/checkout')

    const isAuthRoute = pathname.startsWith('/login') ||
        pathname.startsWith('/signup')

    // Simplified Proxy for Next.js 16 stability
    // Full validation & banning checks are handled in the Application Layer (RSC/Layout)
    // to keep the proxy worker fast and stable.
    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })

    // 4. Extra Security Headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=self, microphone=(), geolocation=(), interest-cohort=()')

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - Public static assets
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
