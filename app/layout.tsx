import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { SmoothScroll } from '@/components/smooth-scroll'

import './globals.css'
import { BottomNav } from '@/components/bottom-nav'
import { MobileInstallPrompt } from '@/components/mobile-install-prompt'
import { NotificationManager } from '@/components/notification-manager'
import { CartSheet } from '@/components/cart-sheet'
import { SpeedInsights } from "@vercel/speed-insights/next"

const _geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AURERXA - Premium Luxury Jewelry',
  description: 'Timeless Luxury Crafted to Perfection. Explore our exquisite collection of premium jewelry.',
  openGraph: {
    title: 'AURERXA - Premium Luxury Jewelry',
    description: 'Timeless Luxury Crafted to Perfection',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/Favicon.ico',
    shortcut: '/Favicon.ico',
    apple: '/logo.png',
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
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from '@/components/navbar'
import { CategoryNav } from '@/components/category-nav'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <SmoothScroll>
              <Navbar />
              <div className="pt-20 md:pt-24">
                <CategoryNav />
                <main>
                  {children}
                </main>
              </div>
              <CartSheet />
              <BottomNav />
              <MobileInstallPrompt />
              <NotificationManager />
              <SpeedInsights />
            </SmoothScroll>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
