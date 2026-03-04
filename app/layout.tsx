import React, { Suspense } from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Cormorant_Garamond } from 'next/font/google'
import { SmoothScroll } from '@/components/smooth-scroll'
import { Toaster } from "@/components/ui/sonner"
import dynamic from 'next/dynamic'

import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import Script from 'next/script'
import { GoogleAnalytics } from '@next/third-parties/google'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.aurerxa.com'),
  title: {
    default: 'AURERXA | Authentic Luxury & Bespoke Jewelry Heritage',
    template: '%s | AURERXA',
  },
  description: 'AURERXA: Elevating Indian luxury. Explore our legacy of silver necklaces, earrings, and bespoke jewelry. Handcrafted perfection with worldwide insured shipping.',
  applicationName: 'AURERXA',
  authors: [{ name: 'AURERXA Artisans', url: 'https://aurerxa.com' }],
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'AURERXA', 'AURERXA Jewelry', 'Aurerxa Official',
    'AURERXA Heritage', 'AURERXA Boutique', 'AURERXA Sangamner',
    'Aurerxa India', 'Aurerxa Luxury', 'Aurerxa Fine Jewelry',
    'rexa', 'aurer', 'aure',
    // Jewelry Types
    'Silver Necklace', 'Silver Earrings', 'Silver Rings', 'Bridal Jewelry Sets',
    'Mangalsutra Online', 'Silver Bangles', 'Pendant Necklace', 'Stud Earrings',
    'Hoop Earrings', 'Chain Necklace', 'Choker Necklace', 'Statement Jewelry',
    'Cocktail Rings', 'Engagement Rings', 'Wedding Bands',
    // Fashion & Lifestyle
    'Fashion Jewelry', 'Trendy Jewelry', 'Designer Jewelry', 'Jewelry Fashion',
    'Fashion Accessories', 'Women Fashion Jewelry', 'Stylish Jewelry Online',
    'Luxury Fashion Brand', 'Indian Fashion Jewelry', 'Party Wear Jewelry',
    // Occasion Based
    'Bridal Jewelry', 'Wedding Jewelry', 'Anniversary Gifts', 'Birthday Gift Jewelry',
    'Valentine Gift', 'Diwali Jewelry', 'Raksha Bandhan Gift', 'Karva Chauth Jewelry',
    'Office Wear Jewelry', 'Daily Wear Jewelry', 'Casual Jewelry', 'Date Night Jewelry',
    // Material Based
    'Silver Jewelry', 'Artificial Jewelry', 'Imitation Jewelry',
    'American Diamond', 'CZ Jewelry', 'Kundan Jewelry', 'Polki Jewelry',
    // Premium & Luxury
    'Premium Luxury Jewelry', 'Bespoke Jewelry Design', 'Artisan Silver Jewelry',
    'Luxury Jewelry Brand', 'Handcrafted Fine Jewelry', 'Ethical Diamond Jewelry',
    'High-End Jewelry', 'Custom Jewelry Maker', 'Fine Jewelry Collections',
    'Heirloom Quality Jewelry', 'Luxury Indian Boutique',
    // Shopping Intent
    'Buy Jewelry Online', 'Jewelry Store Online', 'Best Jewelry Shop',
    'Jewelry Online Shopping', 'Best Jewelry Brand India', 'Cheap Luxury Jewelry',
    'Affordable Designer Jewelry', 'Free Shipping Jewelry India',
    // Regional
    'AURERXA Jewelry India', 'Buy Silver Jewelry Online India', 'Best Jewelry Shop Mumbai',
    'Certified Silver Jewelry Online India', 'Conflict Free Jewelry',
    'Luxury Gift for Her India', 'Custom Engagement Rings India',
    'Traditional Maharashtrian Jewelry', 'Bespoke Jewelry Designers India',
    'Free Insured Shipping Jewelry', 'Jewelry Store Sangamner',
    'Aurerxa Heritage', 'Fine Jewelry Collections 2026',
    'Handcrafted Masterpieces', 'Silver Jewelry Online India',
    'Bentex Jewelry Online', 'Real Silver Jewelry Online',
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
    url: 'https://www.aurerxa.com',
    siteName: 'AURERXA',
    locale: 'en_US',
    images: [
      {
        url: '/logo-new-v2.png',
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
    images: ['/logo-new-v2.png'],
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-IN': '/en-IN',
      'en-US': '/en-US',
      'x-default': '/',
    },
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  other: {
    'mobile-web-app-capable': 'yes',
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
import { AuthProvider } from '@/context/auth-context'
import { Navbar } from '@/components/navbar'
import { CategoryNav } from '@/components/category-nav'
import { BottomNav } from '@/components/bottom-nav'
import { AdminRouteGuard, AdminOnlyWrapper } from '@/components/admin-route-guard'
import { ConsentProvider } from '@/context/consent-context'
import { TrackingScripts } from '@/components/scripts/tracking'
import { getCurrentUserProfile, getSiteSetting } from '@/app/actions'
import { redirect } from 'next/navigation'
import { Footer } from '@/components/footer'
import { ErrorBoundary } from '@/components/error-boundary'
import { ConciergeHub } from '@/components/concierge-hub'
import { cn } from '@/lib/utils'
import { headers } from 'next/headers'

// Dynamically load heavy client components (Named Exports)
// Note: ssr: false is removed here because this is a Server Component.
// These components already handle hydration gracefully via useEffect or isOpen checks.
const SearchModal = dynamic(() => import('@/components/search-modal').then(mod => mod.SearchModal))
const CartSheet = dynamic(() => import('@/components/cart-sheet').then(mod => mod.CartSheet))
const MobileInstallPrompt = dynamic(() => import('@/components/mobile-install-prompt').then(mod => mod.MobileInstallPrompt))
const NotificationManager = dynamic(() => import('@/components/notification-manager').then(mod => mod.NotificationManager))
const CookieConsent = dynamic(() => import('@/components/cookie-consent').then(mod => mod.CookieConsent))
const DynamicTitle = dynamic(() => import('@/components/dynamic-title').then(mod => mod.DynamicTitle))
const BehaviorTracker = dynamic(() => import('@/components/behavior-tracker').then(mod => mod.BehaviorTracker))

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Fetch profile globally - this is safe for static generation if it doesn't depend on headers/cookies 
  // that vary per request in a way that breaks caching (currentUserProfile usually uses cookies, 
  // so this might STILL make it dynamic, but by removing Pathname dependence we at least decouple it from UI toggles).
  // Actually, to make it TRULY static, we should move profile fetch to a client component or use Suspense.
  const profile = await getCurrentUserProfile()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aurerxa.com'

  // SEO Schemas (Static)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    'additionalType': ['Brand', 'Organization'],
    'name': 'AURERXA',
    'alternateName': ['AURERXA Luxury', 'AURERXA Heritage', 'AURERXA Jewelry'],
    'url': baseUrl,
    'logo': `${baseUrl}/icon-512.png`,
    'description': 'AURERXA is a premium luxury jewelry brand specializing in bespoke silver jewelry and handcrafted masterpieces.',
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
      'contactType': 'customer service',
      'areaServed': 'IN',
      'availableLanguage': ['English', 'Hindi', 'Marathi']
    }
  }

  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${cormorant.variable}`}>
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL!} crossOrigin="" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL!} />
        <link
          rel="preload"
          href="/pexels-the-glorious-studio-3584518-29245554.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SearchProvider>
            <AuthProvider initialProfile={profile}>
              <ConsentProvider initialProfile={profile}>
                <CartProvider>
                  <SmoothScroll>
                    <ErrorBoundary componentName="Application Root">
                      {children}

                      <CartSheet />
                      <MobileInstallPrompt />
                      <NotificationManager />
                      <SearchModal />
                      <DynamicTitle />
                      <BottomNav />

                      <Toaster />
                      <Suspense fallback={null}>
                        <SpeedInsights />
                        <Analytics />
                        <GoogleAnalytics gaId="GT-WPLW7ZX3" />
                        <CookieConsent />
                        <TrackingScripts />
                        <BehaviorTracker />
                      </Suspense>
                    </ErrorBoundary>
                  </SmoothScroll>
                </CartProvider>
              </ConsentProvider>
            </AuthProvider>
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
