'use client'

import React from 'react'
import { Navbar } from './navbar'
import { CategoryNav } from './category-nav'
import { MarketingBanner } from './marketing-banner'
import { useUserPreferences } from '@/context/user-preferences-context'
import { cn } from '@/lib/utils'

export function HeaderSection({ marketingConfig }: { marketingConfig: any }) {
    const { dismissedInterstitials } = useUserPreferences()

    // Hash the banner text to uniquely identify this specific announcement
    const bannerId = `banner-${marketingConfig.banner_text.replace(/\s+/g, '-').toLowerCase()}`
    const isDismissed = dismissedInterstitials.includes(bannerId)
    const showBanner = marketingConfig.banner_enabled && !isDismissed

    return (
        <>
            {marketingConfig.banner_enabled && (
                <MarketingBanner config={marketingConfig} />
            )}
            <div className={cn(
                "fixed inset-x-0 z-[40] w-full fixed-header-container transition-all duration-500 ease-in-out",
                showBanner ? "top-8" : "top-0"
            )}>
                <Navbar marketingConfig={marketingConfig} />
                <CategoryNav />
            </div>
            <style jsx global>{`
                :root {
                    --header-offset: ${showBanner ? '32px' : '0px'};
                    --main-pt: ${showBanner ? '144px' : '112px'};
                    --main-pt-md: ${showBanner ? '160px' : '128px'};
                }
                .main-content-wrapper {
                    padding-top: var(--main-pt);
                    transition: padding-top 0.5s ease-in-out;
                }
                @media (min-width: 768px) {
                    .main-content-wrapper {
                        padding-top: var(--main-pt-md);
                    }
                }
            `}</style>
        </>
    )
}
