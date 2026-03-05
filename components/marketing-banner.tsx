'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useUserPreferences } from '@/context/user-preferences-context'
import { cn } from '@/lib/utils'

interface MarketingBannerProps {
    config: {
        banner_enabled: boolean
        banner_text: string
        banner_link: string
    }
}

export function MarketingBanner({ config }: MarketingBannerProps) {
    const { dismissedInterstitials, dismissInterstitial } = useUserPreferences()
    const [isVisible, setIsVisible] = useState(false)

    // Hash the banner text to uniquely identify this specific announcement
    const bannerId = `banner-${config.banner_text.replace(/\s+/g, '-').toLowerCase()}`
    const isDismissed = dismissedInterstitials.includes(bannerId)

    useEffect(() => {
        if (config.banner_enabled && !isDismissed) {
            setIsVisible(true)
        } else {
            setIsVisible(false)
        }
    }, [config.banner_enabled, isDismissed])

    if (!isVisible) return null

    return (
        <div className="fixed top-0 inset-x-0 h-8 bg-[#D4AF37] text-black flex items-center justify-center text-[10px] md:text-xs font-bold tracking-widest uppercase z-[45] w-full fixed-header-container transition-all duration-500 ease-in-out">
            <a href={config.banner_link} className="hover:underline flex items-center justify-center gap-2 px-10">
                {config.banner_text}
            </a>
            <button
                onClick={() => dismissInterstitial(bannerId)}
                className="absolute right-2 p-1 hover:bg-black/10 rounded-full transition-colors"
                aria-label="Close banner"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    )
}
