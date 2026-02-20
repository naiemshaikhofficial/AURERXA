import React, { Suspense } from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Cormorant_Garamond } from 'next/font/google'
import { SmoothScroll } from '@/components/smooth-scroll'
import { Toaster } from "@/components/ui/sonner"
import dynamic from 'next/dynamic'

import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

// Defer non-critical interactive overlays (code-split via dynamic import)
const MobileInstallPrompt = dynamic(() => import('@/components/mobile-install-prompt').then(mod => mod.MobileInstallPrompt))
const NotificationManager = dynamic(() => import('@/components/notification-manager').then(mod => mod.NotificationManager))
const CartSheet = dynamic(() => import('@/components/cart-sheet').then(mod => mod.CartSheet))

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap'
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'AURERXA | Premium Luxury Jewelry & Bespoke Jewelry Design',
  description: 'AURERXA: Timeless luxury handcrafted to perfection. Explore our global collection of artisan gold, conflict-free diamond, and bespoke jewelry. A heritage of craftsmanship, redefined for the world.',
  applicationName: 'AURERXA',
  authors: [{ name: 'AURERXA Artisans', url: 'https://aurerxa.com' }],
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'Premium Luxury Jewelry', 'Bespoke Jewelry Design', 'Artisan Gold Jewelry',
    'Luxury Jewelry Brand', 'Handcrafted Fine Jewelry', 'Ethical Diamond Jewelry',
    'High-End Indian Jewelry', 'Custom Jewelry Maker', 'Fine Jewelry Collections',
    'Heirloom Quality Jewelry', 'Gold Mangalsutra', 'Diamond Bridal Sets',
    'Sangamner Best Jewelry', 'Luxury Indian Boutique'
  ],
  creator: 'AURERXA',
  publisher: 'AURERXA',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'AURERXA | World-Class Luxury & Bespoke Jewelry',
    description: 'Timeless luxury handcrafted to perfection. Discover AURERXA Heritage.',
    url: 'https://aurerxa.com',
    siteName: 'AURERXA',
    locale: 'en_US',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'AURERXA Luxury Jewelry Logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AURERXA | World-Class Luxury & Bespoke Jewelry',
    description: 'Timeless luxury handcrafted to perfection.',
    site: '@aurerxa',
    creator: '@aurerxa',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/favicon%2030x30.ico',
    shortcut: '/favicon%2030x30.ico',
    apple: '/favicon%2030x30.ico',
  },
  alternates: {
    canonical: './',
    languages: {
      'en-US': '/en-US',
      'x-default': '/',
    },
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
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
import { BottomNav } from '@/components/bottom-nav'
import { AdminRouteGuard, AdminOnlyWrapper } from '@/components/admin-route-guard'
import { ConsentProvider } from '@/context/consent-context'
import { CookieConsent } from '@/components/cookie-consent'
import { TrackingScripts } from '@/components/scripts/tracking'
import { BehaviorTracker } from '@/components/behavior-tracker'
import { getCurrentUserProfile } from '@/app/actions'
import { SearchModal } from '@/components/search-modal'


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const profile = await getCurrentUserProfile()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aurerxa.com'
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore', // Primary type for shop
    'additionalType': ['Organization', 'Brand'],
    'name': 'AURERXA',
    'alternateName': 'Aurerxa Luxury Jewelry',
    'url': baseUrl,
    'logo': `${baseUrl}/logo.png`,
    'description': 'Handcrafted premium luxury jewelry brand specializing in bespoke gold and conflict-free diamond pieces.',
    'sameAs': [
      'https://facebook.com/aurerxa',
      'https://instagram.com/aurerxa',
      'https://youtube.com/@aurerxa',
      'https://linkedin.com/company/aurerxa'
    ],
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Captain Lakshmi Chowk, Rangargalli',
      'addressLocality': 'Sangamner',
      'addressRegion': 'Maharashtra',
      'postalCode': '422605',
      'addressCountry': 'IN'
    },
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+91-9391032677',
      'contactType': 'global customer service',
      'areaServed': 'World',
      'availableLanguage': ['English', 'Hindi', 'Marathi']
    }
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    'name': 'AURERXA Flagship Boutique',
    'image': `${baseUrl}/logo.png`,
    '@id': `${baseUrl}/#boutique`,
    'url': baseUrl,
    'telephone': '+919391032677',
    'priceRange': '₹₹₹₹',
    'address': organizationSchema.address,
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 19.5761,
      'longitude': 74.2074
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      ],
      'opens': '10:00',
      'closes': '21:00'
    }
  }

  const searchboxLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'url': baseUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${baseUrl}/collections?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }

  const navigationLd = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    'hasPart': [
      { '@type': 'WebPage', 'name': 'Collections', 'url': `${baseUrl}/collections` },
      { '@type': 'WebPage', 'name': 'Necklaces', 'url': `${baseUrl}/collections?category=necklaces` },
      { '@type': 'WebPage', 'name': 'Earrings', 'url': `${baseUrl}/collections?category=earrings` },
      { '@type': 'WebPage', 'name': 'Rings', 'url': `${baseUrl}/collections?category=rings` },
      { '@type': 'WebPage', 'name': 'Mangalsutra', 'url': `${baseUrl}/collections?category=mangalsutra` },
      { '@type': 'WebPage', 'name': 'Our Story', 'url': `${baseUrl}/our-story` },
      { '@type': 'WebPage', 'name': 'About Us', 'url': `${baseUrl}/about` },
      { '@type': 'WebPage', 'name': 'Contact Us', 'url': `${baseUrl}/contact-us` }
    ]
  }

  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${cormorant.variable}`}>
      <head>
        <link rel="preconnect" href="https://xquczexikijzbzcuvmqh.supabase.co" crossOrigin="" />
        <link rel="dns-prefetch" href="https://xquczexikijzbzcuvmqh.supabase.co" />
        <link rel="preconnect" href="https://img.icons8.com" />
        {/* Preload critical fonts for smooth FCP/LCP */}
        <link
          rel="preload"
          href="/_next/static/media/c9a5bc6a7c948912-s.p.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(searchboxLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationLd) }}
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
              <ConsentProvider initialProfile={profile}>
                <SmoothScroll>
                  <AdminRouteGuard>
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
                  </AdminRouteGuard>

                  <AdminOnlyWrapper>
                    {children}
                  </AdminOnlyWrapper>

                  <Toaster />
                  <SpeedInsights />
                  <Analytics />
                </SmoothScroll>

                <CookieConsent />
                <TrackingScripts />
                <SearchModal />
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
