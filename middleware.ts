import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
    const { pathname, searchParams } = request.nextUrl

    // 1. Bot Blocking
    const ua = request.headers.get('user-agent') || ''
    if (BLOCKED_UA_PATTERNS.some(p => p.test(ua))) {
        return new NextResponse('Forbidden', { status: 403 })
    }

    // 2. Static Assets Bypass
    const isAsset = /\.(?:ico|png|jpg|jpeg|gif|svg|webp|js|css|woff2?|webmanifest|json|txt|map)$/.test(pathname)
    if (pathname.startsWith('/_next') || isAsset || pathname.startsWith('/api/supabase')) {
        const res = NextResponse.next()
        res.headers.set('x-pathname', pathname)
        return res
    }

    // 3. Initialize Response & Supabase
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-pathname', pathname)

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
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

                    // Crucial: Keep headers in sync when recreating response
                    const syncHeaders = new Headers(request.headers)
                    syncHeaders.set('x-pathname', pathname)

                    response = NextResponse.next({
                        request: {
                            headers: syncHeaders,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, {
                            ...options,
                            sameSite: 'lax',
                            secure: process.env.NODE_ENV === 'production'
                        })
                    )
                },
            },
            cookieOptions: {
                name: 'sb-xquczexikijzbzcuvmqh-auth-token',
                path: '/',
            }
        }
    )

    try {
        // 4. Auth Check with tight timeout
        const { data: { user } } = await Promise.race([
            supabase.auth.getUser(),
            new Promise<any>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500))
        ]).catch(() => ({ data: { user: null } }))

        // 5. Redirection Logic (with loop prevention)
        const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')
        const isAdminPage = pathname.startsWith('/admin')

        if (user) {
            if (isAuthPage) {
                let redirectTo = searchParams.get('redirect') || '/'
                // Avoid infinite redirect if redirectTo is the same auth page
                if (redirectTo === pathname || redirectTo.includes('/login') || redirectTo.includes('/signup')) {
                    redirectTo = '/'
                }
                return NextResponse.redirect(new URL(redirectTo, request.url))
            }
        } else {
            if (isAdminPage) {
                const loginUrl = new URL('/login', request.url)
                loginUrl.searchParams.set('redirect', pathname)
                return NextResponse.redirect(loginUrl)
            }
        }

        // 6. Finalize Response
        response.headers.set('x-pathname', pathname)
        if (!pathname.startsWith('/api/payment/ccavenue/callback')) {
            response.headers.set('X-Frame-Options', 'DENY')
            response.headers.set('X-Content-Type-Options', 'nosniff')
            response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
        }

        return response
    } catch (e) {
        console.error('Middleware Error:', e)
        return response
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
