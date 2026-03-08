import React, { Suspense } from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Cormorant_Garamond } from 'next/font/google'
import { SmoothScroll } from '@/components/smooth-scroll'
import { Toaster } from "@/components/ui/sonner"
import dynamic from 'next/dynamic'
import { LazyMotion, domMax } from 'framer-motion'

import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import Script from 'next/script'
import { GoogleAnalytics } from '@next/third-parties/google'
import { UserPreferencesProvider } from "@/context/user-preferences-context"

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
    'Aurexa', 'Aurexa Jewelry', 'Aurexa Official',
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
    canonical: 'https://www.aurerxa.com',
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

import { ServiceWorkerRegistration } from '@/components/service-worker-registration'

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
import { SiteConfigProvider } from '@/context/site-config-context'
import { SWRProvider } from '@/components/swr-provider'
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
  // Fetch profile - This is now done without blocking the layout shell stream
  // We remove the top-level await to allow the HTML shell to reach the browser faster.
  const profilePromise = (() => {
    try {
      return getCurrentUserProfile()
    } catch (err: any) {
      if (err.digest === 'DYNAMIC_SERVER_USAGE' || err.message?.includes('dynamic server usage')) {
        return Promise.resolve(null)
      }
      console.error('Root Layout Profile Fetch Error:', err)
      return Promise.resolve(null)
    }
  })()

  const baseUrl = 'https://www.aurerxa.com'

  // SEO Schemas (Static)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    'additionalType': ['Brand', 'Organization'],
    'name': 'AURERXA',
    'alternateName': ['AURERXA Luxury', 'AURERXA Heritage', 'AURERXA Jewelry', 'AURERXA Official', 'Aurexa', 'Aurexa Jewelry', 'Aurexa Official'],
    'url': baseUrl,
    'logo': `${baseUrl}/icon-512.png`,
    'image': [`${baseUrl}/luxury-boutique-cover.jpg`, `${baseUrl}/icon-512.png`],
    'description': 'AURERXA is a premium luxury jewelry brand specializing in BIS Hallmarked gold, certified silver jewelry, and handcrafted masterpieces with a 50-year heritage.',
    'priceRange': '₹₹₹',
    'telephone': '+91-9075250260',
    'email': 'support@aurerxa.com',
    'sameAs': [
      'https://facebook.com/aurerxa',
      'https://instagram.com/aurerxa',
      'https://youtube.com/@aurerxa',
      'https://linkedin.com/company/aurerxa',
      'https://twitter.com/aurerxa',
      'https://pinterest.com/aurerxa'
    ],
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Captain Lakshmi Chowk, Rangargalli',
      'addressLocality': 'Sangamner',
      'addressRegion': 'Maharashtra',
      'postalCode': '422605',
      'addressCountry': 'IN'
    },
    'areaServed': ['IN', 'AE', 'US', 'GB'],
    'knowsAbout': ['Fine Jewelry', 'Silver Jewelry', 'BIS Hallmarked Gold', 'Gemology', 'Bespoke Design'],
    'contactPoint': [
      {
        '@type': 'ContactPoint',
        'telephone': '+91-9075250260',
        'contactType': 'customer service',
        'areaServed': 'IN',
        'availableLanguage': ['English', 'Hindi', 'Marathi']
      },
      {
        '@type': 'ContactPoint',
        'telephone': '+91-9075250260',
        'contactType': 'sales',
        'areaServed': 'IN',
        'availableLanguage': ['English', 'Hindi', 'Marathi']
      }
    ],
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      ],
      'opens': '11:00',
      'closes': '20:00'
    },
    'founder': {
      '@type': 'Person',
      'name': 'Naiem Shaikh',
      'jobTitle': 'Founder & Creative Director',
      'knowsLanguage': ['English', 'Hindi', 'Marathi'],
      'knowsAbout': ['Jewelry Design', 'Gemology', 'Luxury Retail', 'Artisan Craftsmanship'],
      'sameAs': [
        'https://www.linkedin.com/in/naiemshaikhofficial',
        'https://www.instagram.com/naiemshaikhofficial'
      ]
    }
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'AURERXA',
    'alternateName': ['Aurexa', 'AURERXA Luxury'],
    'url': baseUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${baseUrl}/collections?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
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

        {/* Elite Resource Hinting */}
        <link rel="preconnect" href="https://imageshack.com" />
        <link rel="dns-prefetch" href="https://imageshack.com" />
        <link rel="preconnect" href="https://v5.airtable.com" />
        <link rel="dns-prefetch" href="https://v5.airtable.com" />

        {/* Google Site Verification - Add your code here */}
        {/* <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" /> */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ServiceWorkerRegistration />
          <SearchProvider>
            <AuthProvider initialProfilePromise={profilePromise}>
              <ConsentProvider initialProfilePromise={profilePromise}>
                <SiteConfigProvider>
                  <SWRProvider>
                    <UserPreferencesProvider>
                      <CartProvider>
                        <SmoothScroll>
                          <ErrorBoundary componentName="Application Root">
                            <LazyMotion features={domMax}>
                              {children}
                            </LazyMotion>

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
                    </UserPreferencesProvider>
                  </SWRProvider>
                </SiteConfigProvider>
              </ConsentProvider>
            </AuthProvider>
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
