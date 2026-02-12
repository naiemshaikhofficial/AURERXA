import React from "react"
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
  maximumScale: 5,
  userScalable: true,
}

import { CartProvider } from '@/context/cart-context'
import { SearchProvider } from '@/context/search-context'
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from '@/components/navbar'
import { CategoryNav } from '@/components/category-nav'
import { AdminRouteGuard, AdminOnlyWrapper } from '@/components/admin-route-guard'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
          <CartProvider>
            <SearchProvider>
              <SmoothScroll>
                <AdminRouteGuard>
                  <Navbar />
                </AdminRouteGuard>
                {/* Cinematic Grain Overlay - Optimized for TBT */}
                <div
                  className="fixed inset-0 z-[100] pointer-events-none opacity-[0.015] bg-[url('/noise.svg')] repeat will-change-transform"
                  style={{ transform: 'translateZ(0)' }}
                />
                <AdminRouteGuard>
                  <div className="pt-20 md:pt-24">
                    <CategoryNav />
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
            </SearchProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

