import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { SmoothScroll } from '@/components/smooth-scroll'

import './globals.css'
import { BottomNav } from '@/components/bottom-nav'
import { MobileInstallPrompt } from '@/components/mobile-install-prompt'
import { NotificationManager } from '@/components/notification-manager'

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <SmoothScroll>
              {children}
              <BottomNav />
              <MobileInstallPrompt />
              <NotificationManager />
            </SmoothScroll>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
