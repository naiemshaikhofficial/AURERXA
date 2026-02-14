'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useConsent } from '@/context/consent-context'
import { logVisitorEvent } from '@/app/actions'

/**
 * BehaviorTracker (Extreme Intelligence)
 * Silently logs user journeys and interaction patterns.
 * ONLY executes if the user has granted consent.
 */
export function BehaviorTracker() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { consentStatus, sessionId } = useConsent()
    const lastPathRef = useRef<string>('')

    useEffect(() => {
        // Only track if consent is granted and session is established
        if (consentStatus !== 'granted' || !sessionId) return

        const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')

        // Prevent duplicate logs for the same path (e.g., query param changes that don't change intent)
        if (lastPathRef.current === currentPath) return
        lastPathRef.current = currentPath

        // Detect Interest (Segmentation)
        let interest: 'jewelry' | 'watches' | null = null
        const lowercasePath = pathname.toLowerCase()

        // Watch detection: URL contains 'watch' or is in a watch collection
        if (lowercasePath.includes('watch') || searchParams.get('category') === 'watches' || searchParams.get('type') === 'watches') {
            interest = 'watches'
        }
        // Jewelry detection: Standard products (not watches) or explicitly 'jewelry'
        else if (lowercasePath.includes('necklace') || lowercasePath.includes('ring') ||
            lowercasePath.includes('earring') || lowercasePath.includes('bangle') ||
            lowercasePath.includes('jewelry') || lowercasePath.startsWith('/products/')) {
            interest = 'jewelry'
        }

        // Log page view event with segment
        logVisitorEvent(sessionId, 'page_view', {
            path: pathname,
            query: searchParams.toString(),
            referrer: document.referrer,
            interest: interest // Automated segmentation
        })

    }, [pathname, searchParams, consentStatus, sessionId])

    return null // Invisible component
}
