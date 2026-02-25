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

    // --- 1. FAST EXIT FOR STATIC ASSETS ---
    // --- 1. OPTIMIZATION: SKIP AUTH FOR STATIC ASSETS ---
    // This prevents "Too Many Requests" for images, fonts, and manifests
    if (
        pathname.startsWith('/_next') ||
        pathname.includes('.') ||
        pathname.startsWith('/api/supabase') // Let the proxy handle its own auth
    ) {
        return NextResponse.next()
    }

    try {
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-pathname', pathname)

        // Standard Supabase Response Management
        let response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })

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
                        // Ensure the project-specific cookie name is used
                        // This matches lib/supabase.ts
                        response = NextResponse.next({
                            request: {
                                headers: requestHeaders,
                            },
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set({ name, value, ...options })
                        )
                    },
                },
                cookieOptions: {
                    name: 'sb-xquczexikijzbzcuvmqh-auth-token',
                },
            }
        )

        // --- SESSION REFRESH ---
        // Crucial: triggers setAll if token is expired
        await supabase.auth.getUser()

        // --- 2. LIGHTWEIGHT RATE LIMITING ---
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous'
        const safeIp = ip.replace(/[^a-zA-Z0-9._-]/g, '-')

        const rateLimitConfig = (() => {
            if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/contact')) {
                return { limit: 100, key: `rl_auth_${safeIp}` }
            }
            if (pathname.startsWith('/checkout') || pathname.startsWith('/api/payment') || pathname.startsWith('/api/order')) {
                return { limit: 200, key: `rl_payment_${safeIp}` }
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
                } catch (e) { /* ignore */ }
            }

            const isDev = process.env.NODE_ENV === 'development'

            // Log rate limit hits for debugging
            if (count > limit / 2) {
                console.log(`Middleware: Rate limit warning for ${pathname}`, { count, limit, key, isDev })
            }

            if (count > limit && !isDev) {
                console.warn(`Middleware: Rate limit exceeded for ${pathname}`, { count, limit, key })
                return new NextResponse('Too Many Requests', {
                    status: 429,
                    headers: {
                        'Retry-After': '60',
                        'Content-Type': 'text/plain',
                    }
                })
            }

            response.cookies.set(key, JSON.stringify({ count, resetTime }), {
                httpOnly: true,
                maxAge: 60,
                path: '/',
                sameSite: 'strict',
            })
        }

        // --- 3. SECURITY HEADERS ---
        response.headers.set('X-Frame-Options', 'DENY')
        response.headers.set('X-Content-Type-Options', 'nosniff')
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
        response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

        return response
    } catch (error) {
        console.error('Middleware Critical Failure:', error)
        const response = NextResponse.next()
        response.headers.set('x-pathname', pathname)
        return response
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
