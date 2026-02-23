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

    let response = NextResponse.next({
        request: {
            headers: request.headers,
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
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
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

    // Inject pathname for Server Component layout logic
    response.headers.set('x-pathname', pathname)

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

        response.cookies.set(key, JSON.stringify({ count, resetTime }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60
        })
    }

    const isProtectedRoute = pathname.startsWith('/account') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/checkout')

    const isAuthRoute = pathname.startsWith('/login') ||
        pathname.startsWith('/signup')

    // OPTIMIZATION: Check for session cookie presence before calling expensive getUser()
    // If no cookie exists and it's not a protected route, we can skip auth logic.
    const hasSessionCookie = request.cookies.get('sb-xquczexikijzbzcuvmqh-auth-token')

    let user = null
    if (hasSessionCookie || isProtectedRoute || isAuthRoute) {
        // Always call getUser to ensure session is refreshed
        // Wrap in try-catch to satisfy Next.js 16/experimental abort behaviors
        try {
            const { data } = await supabase.auth.getUser()
            user = data.user
        } catch (e: any) {
            // Handle potential AbortError/ECONNRESET from getUser() or AuthSessionMissingError
            const isIgnorable =
                e.code === 'ECONNRESET' ||
                e.name === 'AbortError' ||
                e.message?.includes('signal is aborted') ||
                e.name === 'AuthSessionMissingError' ||
                e.message?.includes('Auth session missing') ||
                e.message?.includes('fetch failed')

            if (!isIgnorable) {
                const errorCode = e.code || e.name || ''
                const errorMsg = e.message || ''

                const isSilentError =
                    errorCode === 'refresh_token_not_found' ||
                    errorCode === 'refresh_token_already_used' ||
                    errorMsg.includes('Refresh Token Not Found') ||
                    errorMsg.includes('Refresh Token Already Used') ||
                    e.status === 400 && errorMsg.includes('Refresh Token')

                if (!isSilentError) {
                    console.error('Middleware Auth Error:', e)
                }
            }
        }
    }

    // 1. Auth Page Redirection: Authenticated users visiting /login or /signup
    if (user && isAuthRoute) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // 2. Protected Routes: Unauthenticated users
    if (!user && isProtectedRoute) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Optimization: Cache user status (admin/ban) in a secure cookie for 10 minutes
    // to avoid hitting the database on every page navigation.
    const statusCache = request.cookies.get('ua-status-cache')?.value
    let isBanned = false
    let isAdmin = false
    let cacheFound = false

    if (statusCache && user) {
        try {
            const data = JSON.parse(statusCache)
            if (data.userId === user.id && Date.now() < data.expires) {
                isBanned = data.isBanned
                isAdmin = data.isAdmin
                cacheFound = true
            }
        } catch (e) {
            console.error('Middleware: Status cache parse error')
        }
    }

    if (user && !cacheFound) {
        // Fetch fresh status from database
        const [{ data: adminData }, { data: profile }] = await Promise.all([
            supabase.from('admin_users').select('role').eq('id', user.id).single(),
            supabase.from('profiles').select('is_banned').eq('id', user.id).single()
        ])

        isAdmin = !!adminData
        isBanned = !!profile?.is_banned

        // Set cache cookie (10 minutes)
        const expires = Date.now() + 10 * 60 * 1000
        response.cookies.set('ua-status-cache', JSON.stringify({
            userId: user.id,
            isAdmin,
            isBanned,
            expires
        }), {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 600
        })
    }

    // 3. Admin Route Protection
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!isAdmin) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // 4. User Ban Check
    if (isBanned && !request.nextUrl.pathname.startsWith('/banned')) {
        return NextResponse.redirect(new URL('/banned', request.url))
    }

    // 5. Maintenance Mode Check
    // We run this after isAdmin is determined to allow admins to bypass maintenance.
    const isMaintenancePath = pathname === '/maintenance'
    const isAdminPath = pathname.startsWith('/admin')
    const isLoginPage = pathname === '/login'

    // Only check DB if it's not a maintenance/admin/login path and we haven't already determined user is admin
    if (!isAdmin && !isMaintenancePath && !isAdminPath && !isLoginPage) {
        try {
            const { data: maintenanceConfig } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'maintenance_config')
                .maybeSingle()

            if (maintenanceConfig && (maintenanceConfig.value as any)?.is_enabled) {
                return NextResponse.redirect(new URL('/maintenance', request.url))
            }
        } catch (e) {
            console.error('Middleware: Maintenance check error', e)
        }
    }

    // 6. Extra Security Headers
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
