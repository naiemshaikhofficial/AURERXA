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

    const isProtectedRoute = request.nextUrl.pathname.startsWith('/account') ||
        request.nextUrl.pathname.startsWith('/admin') ||
        request.nextUrl.pathname.startsWith('/checkout')

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup')

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
        return NextResponse.redirect(new URL('/login', request.url))
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
