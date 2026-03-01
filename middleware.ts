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

        // 3. REDIRECTION LOGIC
        const { data: { user } } = await supabase.auth.getUser()

        // Redirect if authenticated away from login/signup
        if (user && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
            // Check if admin to decide redirect path
            const { data: adminData } = await supabase
                .from('admin_users')
                .select('role')
                .eq('id', user.id)
                .maybeSingle()

            const redirectPath = request.nextUrl.searchParams.get('redirect') || (adminData ? '/admin' : '/')
            return NextResponse.redirect(new URL(redirectPath, request.url))
        }

        // Redirect away from admin if NOT authenticated
        if (!user && pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url))
        }

        // 4. Security Headers (Skip for payment callback to avoid framing/POST issues)
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
