import React from 'react'
import { Navbar } from '@/components/navbar'
import { CategoryNav } from '@/components/category-nav'
import { Footer } from '@/components/footer'
import { AdminRouteGuard } from '@/components/admin-route-guard'
import { ErrorBoundary } from '@/components/error-boundary'
import { redirect } from 'next/navigation'
import { getSiteSetting } from '@/app/actions'
import { cn } from '@/lib/utils'

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

    // Parallel fetch: Profile, Maintenance, Marketing, Contact
    const profilePromise = import('@/app/actions').then(m => m.getCurrentUserProfile())
    const maintenancePromise = getSiteSetting('maintenance_config', { is_enabled: false })
    const marketingPromise = getSiteSetting('marketing_config', marketingDefault)
    const contactPromise = getSiteSetting('contact_config', contactDefault)

    const [profile, maintenanceConfig, marketingConfig, contactConfig] = await Promise.all([
        profilePromise,
        maintenancePromise,
        marketingPromise,
        contactPromise
    ])

    const isAdmin = profile?.isAdmin
    const isBanned = profile?.isBanned

    // Maintenance & Banned Checks (Safe for Route Groups)
    if (isBanned) {
        redirect('/banned')
    }

    if (maintenanceConfig?.is_enabled && !isAdmin) {
        redirect('/maintenance')
    }

    return (
        <AdminRouteGuard>
            {marketingConfig.banner_enabled && (
                <div className="fixed top-0 left-0 right-0 h-8 bg-[#D4AF37] text-black flex items-center justify-center text-[10px] md:text-xs font-bold tracking-widest uppercase z-[45]">
                    <a href={marketingConfig.banner_link} className="hover:underline flex items-center justify-center gap-2">
                        {marketingConfig.banner_text}
                    </a>
                </div>
            )}
            <div className={cn("fixed left-0 right-0 z-[40]", marketingConfig.banner_enabled ? "top-8" : "top-0")}>
                <Navbar marketingConfig={marketingConfig} />
                <CategoryNav />
            </div>
            <div className={cn(marketingConfig.banner_enabled ? "pt-[144px] md:pt-[160px]" : "pt-[112px] md:pt-[128px]")}>
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
