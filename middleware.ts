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

const PUBLIC_PATHS = [
    '/', '/login', '/signup', '/blogs', '/products', '/categories', '/search',
    '/our-story', '/about-us', '/contact', '/faq',
    '/privacy',
    '/terms',
    '/returns',
    '/refund-policy',
    '/stores',
    '/size-guide', '/shipping', '/help',
    '/collections', '/custom-jewelry', '/the-price-of-perfection'
];

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const host = request.headers.get('host') || ''
    const isProd = process.env.NODE_ENV === 'production'

    // 1. Canonical Domain Enforcement (www.aurerxa.com)
    if (isProd && host === 'aurerxa.com') {
        return NextResponse.redirect(`https://www.aurerxa.com${pathname}${request.nextUrl.search}`, 301)
    }

    // 2. Scalability: Basic Rate Limiting & Bot Blocking
    const ua = request.headers.get('user-agent') || ''
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'anonymous'

    // Security: Block high-intensity bursts from single IP
    if (BLOCKED_UA_PATTERNS.some(p => p.test(ua))) {
        return new NextResponse('Forbidden', { status: 403 })
    }

    // 2. Static Assets Bypass
    const isAsset = /\.(?:ico|png|jpg|jpeg|gif|svg|webp|js|css|woff2?|webmanifest|json|txt|map)$/.test(pathname)
    if (pathname.startsWith('/_next') || isAsset || pathname.startsWith('/api/supabase') || pathname.startsWith('/api/proxy')) {
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

    const isPublicPath = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
    const isDashboard = pathname.startsWith('/admin') || pathname.startsWith('/account');

    let user = null;

    try {
        if (!isPublicPath || isDashboard) {
            try {
                const { data: { user: authUser } } = await Promise.race([
                    supabase.auth.getUser(),
                    new Promise<any>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
                ])
                user = authUser;
            } catch (err) {
                console.warn('Middleware: Auth check non-fatal failure:', err instanceof Error ? err.message : 'Unknown');
            }
        }

        const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')
        const isAdminPage = pathname.startsWith('/admin')

        if (user) {
            if (isAuthPage) {
                let redirectTo = request.nextUrl.searchParams.get('redirect') || '/'
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

        response.headers.set('x-pathname', pathname)

        if (!pathname.startsWith('/api/payment/ccavenue/callback')) {
            response.headers.set('X-Content-Type-Options', 'nosniff')
            response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
            response.headers.set('X-DNS-Prefetch-Control', 'on')
            response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
            response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')

            const cspHeaderValue = `
                default-src 'self';
                script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google-analytics.com https://*.googletagmanager.com https://*.vercel-scripts.com https://va.vercel-scripts.com https://*.ccavenue.com https://ccavenue.com https://*.razorpay.com https://checkout.razorpay.com https://sdk.cashfree.com https://vercel.live https://www.youtube.com https://s.ytimg.com;
                style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
                img-src 'self' blob: data: https://*.supabase.co https://*.google-analytics.com https://*.googletagmanager.com https://imageshack.com https://*.imageshack.com https://imagizer.imageshack.com https://img.icons8.com https://*.ccavenue.com https://ccavenue.com https://*.razorpay.com https://vercel.com https://img.youtube.com https://*.ytimg.com https://i.ytimg.com;
                font-src 'self' data: https://fonts.gstatic.com https://vercel.live;
                connect-src 'self' https://*.supabase.co https://*.google-analytics.com https://vitals.vercel-insights.com https://imageshack.com https://*.imageshack.com https://*.ccavenue.com https://ccavenue.com https://*.razorpay.com https://razorpay.com https://vercel.live wss://*.pusher.com https://www.youtube.com https://*.youtube.com;
                frame-src 'self' https://*.ccavenue.com https://secure.ccavenue.com https://test.ccavenue.com https://ccavenue.com https://*.razorpay.com https://razorpay.com https://sdk.cashfree.com https://vercel.live https://www.youtube.com https://youtube.com https://youtu.be https://www.youtube-nocookie.com;
                frame-ancestors 'self';
                form-action 'self' https://*.ccavenue.com https://secure.ccavenue.com https://ccavenue.com;
                upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim();

            response.headers.set('Content-Security-Policy', cspHeaderValue)
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
