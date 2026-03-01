import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Bot / scraper User-Agents to block
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

    // 0. BOT BLOCKING
    const ua = request.headers.get('user-agent') || ''
    if (BLOCKED_UA_PATTERNS.some(p => p.test(ua))) {
        return new NextResponse('Forbidden', { status: 403 })
    }

    // 1. SKIP STATIC ASSETS
    const isAsset = /\.(?:ico|png|jpg|jpeg|gif|svg|webp|js|css|woff2?|webmanifest|json|txt|map)$/.test(pathname)
    if (pathname.startsWith('/_next') || isAsset || pathname.startsWith('/api/supabase')) {
        const response = NextResponse.next()
        response.headers.set('x-pathname', pathname)
        return response
    }

    // 2. CREATE RESPONSE
    let response = NextResponse.next({
        request: {
            headers: new Headers(request.headers),
        },
    })
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
                        cookiesToSet.forEach(({ name, value, options }) => {
                            request.cookies.set(name, value)
                            response.cookies.set(name, value, {
                                ...options,
                                sameSite: 'lax',
                                secure: process.env.NODE_ENV === 'production'
                            })
                        })
                    },
                },
                cookieOptions: {
                    name: 'sb-xquczexikijzbzcuvmqh-auth-token',
                    path: '/',
                }
            }
        )

        // 3. AUTH CHECK WITH TIMEOUT
        const { data: { user } } = await Promise.race([
            supabase.auth.getUser(),
            new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Auth Timeout')), 3000))
        ]).catch(() => ({ data: { user: null } }))

        // 4. REDIRECTION LOGIC (LOOP PROTECTED)
        const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')
        const isAdminPage = pathname.startsWith('/admin')

        if (user) {
            if (isAuthPage) {
                // Prevent redirecting back to an auth page
                let redirectUrl = searchParams.get('redirect') || '/'
                if (redirectUrl.startsWith('/login') || redirectUrl.startsWith('/signup')) {
                    redirectUrl = '/'
                }
                const url = new URL(redirectUrl, request.url)
                return NextResponse.redirect(url)
            }
        } else {
            if (isAdminPage) {
                const loginUrl = new URL('/login', request.url)
                loginUrl.searchParams.set('redirect', pathname)
                return NextResponse.redirect(loginUrl)
            }
        }

        // 5. SECURITY HEADERS
        if (!pathname.startsWith('/api/payment/ccavenue/callback')) {
            response.headers.set('X-Frame-Options', 'DENY')
            response.headers.set('X-Content-Type-Options', 'nosniff')
            response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
        }

        return response
    } catch (error) {
        console.error('Middleware Critical Error:', error)
        return response
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
