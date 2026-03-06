import React from 'react'
import { Footer } from '@/components/footer'
import { AdminRouteGuard } from '@/components/admin-route-guard'
import { ErrorBoundary } from '@/components/error-boundary'
import { redirect } from 'next/navigation'
import { getSiteSetting } from '@/app/actions'
import { cn } from '@/lib/utils'
import { HeaderSection } from '@/components/header-section'

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const marketingDefault = {
        banner_enabled: false,
        banner_text: "Special Edition Heritage Collection - Now Live",
        banner_link: "/collections"
    }
    const contactDefault = {
        phone: "+91 9391032677",
        email: "support@aurerxa.com",
        whatsapp: "+91 9391032677",
        address: "Captain Lakshmi Chowk, Rangargalli, Sangamner, Maharashtra 422605"
    }

    // Parallel fetch: Profile, Maintenance, Marketing, Contact with safety catch
    const profilePromise = import('@/app/actions').then(m => m.getCurrentUserProfile()).catch(err => {
        // Suppress "crash" logs for dynamic server usage errors during static generation
        if (err.digest === 'DYNAMIC_SERVER_USAGE' || err.message?.includes('dynamic server usage')) {
            return null
        }
        console.error('Layout Profile Fetch Crash:', err)
        return null
    })
    const maintenancePromise = getSiteSetting('maintenance_config', { is_enabled: false }).catch(() => ({ is_enabled: false }))
    const marketingPromise = getSiteSetting('marketing_config', marketingDefault).catch(() => marketingDefault)
    const contactPromise = getSiteSetting('contact_config', contactDefault).catch(() => contactDefault)

    const [profile, maintenanceConfig, marketingConfig, contactConfig] = await Promise.all([
        profilePromise,
        maintenancePromise,
        marketingPromise,
        contactPromise
    ])

    const isAdmin = profile?.isAdmin
    const isBanned = profile?.isBanned

    const baseUrl = 'https://www.aurerxa.com'
    const organizationLd = {
        '@context': 'https://schema.org',
        '@type': 'JewelryStore',
        '@id': `${baseUrl}/#organization`,
        name: 'AURERXA',
        url: baseUrl,
        logo: `${baseUrl}/icon-512.png`,
        image: [`${baseUrl}/photo_6066572646712807057_y.jpg`],
        description: 'Premium BIS Hallmarked Gold & 925 Silver Jewellery Boutique. Handcrafted elegance forged on 50 years of heritage.',
        address: {
            '@type': 'PostalAddress',
            streetAddress: contactConfig.address,
            addressLocality: 'Sangamner',
            addressRegion: 'Maharashtra',
            postalCode: '422605',
            addressCountry: 'IN',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: contactConfig.phone,
            contactType: 'customer service',
            areaServed: 'IN',
            availableLanguage: ['en', 'hi'],
        },
        sameAs: [
            'https://www.instagram.com/aurerxa',
            'https://www.facebook.com/aurerxa',
            'https://twitter.com/aurerxa',
        ],
        priceRange: '₹-₹₹₹',
    }

    // Maintenance & Banned Checks (Safe for Route Groups)
    if (isBanned) {
        redirect('/banned')
    }

    if (maintenanceConfig?.is_enabled && !isAdmin) {
        redirect('/maintenance')
    }

    return (
        <AdminRouteGuard>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
            />

            <HeaderSection marketingConfig={marketingConfig} />

            <div className="main-content-wrapper">
                <ErrorBoundary componentName="Main Content">
                    <main>
                        {children}
                    </main>
                </ErrorBoundary>
                <Footer contactConfig={contactConfig} />
            </div>
        </AdminRouteGuard>
    )
}
