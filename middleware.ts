import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
    const pathname = request.nextUrl.pathname

    // Expensive routes that need protection
    const isExpensiveRoute = pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/api/search') ||
        pathname.startsWith('/contact')

    if (isExpensiveRoute) {
        // Rate limit: 20 requests per minute per IP for sensitive routes (slack for genuine burst)
        const rateLimitKey = `rl:${ip}:${pathname}`
        const now = Date.now()
        const windowSize = 60 * 1000 // 1 minute

        const rlData = request.cookies.get(rateLimitKey)?.value
        let count = 1
        let resetTime = now + windowSize

        if (rlData) {
            try {
                const parsed = JSON.parse(rlData)
                if (now < parsed.resetTime) {
                    count = parsed.count + 1
                    resetTime = parsed.resetTime
                }
            } catch (e) {
                // Ignore parse errors from malformed cookies
            }
        }

        if (count > 20) {
            // Secondary blunt check: Overall IP limit to prevent distributed/malicious spikes
            return new NextResponse('Too Many Requests', {
                status: 429,
                headers: {
                    'Retry-After': '60',
                    'X-RateLimit-Limit': '20',
                    'X-RateLimit-Remaining': '0',
                }
            })
        }

        // Set/Update rate limit cookie
        response.cookies.set(rateLimitKey, JSON.stringify({ count, resetTime }), {
            httpOnly: true,
            secure: true,
            sameSite: 'strict', // Harder security for expensive routes
            maxAge: 60
        })
    }

    const isProtectedRoute = pathname.startsWith('/account') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/checkout')

    const isAuthRoute = pathname.startsWith('/login') ||
        pathname.startsWith('/signup')

    if (!isProtectedRoute && !isAuthRoute) {
        // Early return for public routes - keep headers for security
        response.headers.set('X-Frame-Options', 'DENY')
        response.headers.set('X-Content-Type-Options', 'nosniff')
        return response
    }

    const { data: { user } } = await supabase.auth.getUser()

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

    // 5. Extra Security Headers
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
