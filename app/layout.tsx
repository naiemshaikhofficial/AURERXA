import React, { Suspense } from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Playfair_Display } from 'next/font/google'
import { SmoothScroll } from '@/components/smooth-scroll'
import { Toaster } from "@/components/ui/sonner"
import dynamic from 'next/dynamic'

import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

// Defer non-critical interactive overlays (code-split via dynamic import)
const BottomNav = dynamic(() => import('@/components/bottom-nav').then(mod => mod.BottomNav))
const MobileInstallPrompt = dynamic(() => import('@/components/mobile-install-prompt').then(mod => mod.MobileInstallPrompt))
const NotificationManager = dynamic(() => import('@/components/notification-manager').then(mod => mod.NotificationManager))
const CartSheet = dynamic(() => import('@/components/cart-sheet').then(mod => mod.CartSheet))

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'AURERXA - Premium Luxury Jewelry',
  description: 'Timeless Luxury Crafted to Perfection. Explore our exquisite collection of premium jewelry.',
  openGraph: {
    title: 'AURERXA - Premium Luxury Jewelry',
    description: 'Timeless Luxury Crafted to Perfection',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/favicon%2030x30.ico',
    shortcut: '/favicon%2030x30.ico',
    apple: '/favicon%2030x30.ico',
  },
}

export const viewport: Viewport = {
  themeColor: '#D4AF37',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

import { CartProvider } from '@/context/cart-context'
import { SearchProvider } from '@/context/search-context'
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from '@/components/navbar'
import { CategoryNav } from '@/components/category-nav'
import { AdminRouteGuard, AdminOnlyWrapper } from '@/components/admin-route-guard'
import { ConsentProvider } from '@/context/consent-context'
import { CookieConsent } from '@/components/cookie-consent'
import { TrackingScripts } from '@/components/scripts/tracking'
import { BehaviorTracker } from '@/components/behavior-tracker'
import { getCurrentUserProfile } from '@/app/actions'
import { ScrollProgress } from '@/components/scroll-progress'
import { FloatingElements } from '@/components/floating-elements'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const profile = await getCurrentUserProfile()
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${playfair.variable}`}>
      <head>
        <link rel="preconnect" href="https://xquczexikijzbzcuvmqh.supabase.co" crossOrigin="" />
        <link rel="dns-prefetch" href="https://xquczexikijzbzcuvmqh.supabase.co" />
        {/* Preload critical fonts for smooth FCP/LCP */}
        <link
          rel="preload"
          href="/_next/static/media/c9a5bc6a7c948912-s.p.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Premium scroll progress indicator */}
          <ScrollProgress />

          <CartProvider>
            <SearchProvider>
              <ConsentProvider initialProfile={profile}>
                {/* Navbar outside smooth scroll for proper fixed positioning */}
                {/* Navbar outside smooth scroll for proper fixed positioning */}
                <SmoothScroll>
                  <AdminRouteGuard>
                    <div className="pt-20 md:pt-24">
                      <main>
                        {children}
                      </main>
                    </div>
                  </AdminRouteGuard>
                  <AdminOnlyWrapper>
                    {children}
                  </AdminOnlyWrapper>
                  <Toaster />
                  <AdminRouteGuard>
                    <CartSheet />
                    <BottomNav />
                    <MobileInstallPrompt />
                    <NotificationManager />
                  </AdminRouteGuard>
                  <SpeedInsights />
                  <Analytics />
                </SmoothScroll>

                {/* Navbar moved to bottom for Z-Index Dominance */}
                <Navbar />
                <CategoryNav />

                <CookieConsent />
                <TrackingScripts />
                <Suspense fallback={null}>
                  <BehaviorTracker />
                </Suspense>
              </ConsentProvider>
            </SearchProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

