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

    if (!isProtectedRoute) {
        // Early return for public routes - keep headers for security
        response.headers.set('X-Frame-Options', 'DENY')
        response.headers.set('X-Content-Type-Options', 'nosniff')
        return response
    }

    const { data: { user } } = await supabase.auth.getUser()

    // 1. Auth Page Redirection: Authenticated users visiting /login or /signup
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup')

    if (user && isAuthRoute) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // 2. Protected Routes: Unauthenticated users
    if (!user && isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 3. Admin Route Protection: Check admin_users table
    if (user && request.nextUrl.pathname.startsWith('/admin')) {
        const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (adminError || !adminData) {
            console.error('Middleware: Admin check failed or not an admin', {
                userId: user.id,
                error: adminError?.message || 'No record found'
            })
            // Not an admin — redirect to homepage
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // 4. User Ban Check
    if (user && !request.nextUrl.pathname.startsWith('/banned')) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_banned')
            .eq('id', user.id)
            .single()

        if (profile?.is_banned) {
            return NextResponse.redirect(new URL('/banned', request.url))
        }
    }

    // 5. Extra Security Headers (Redundancy)
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
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
