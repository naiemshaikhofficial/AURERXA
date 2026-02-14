'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useConsent } from '@/context/consent-context'
import { logVisitorEvent, upsertVisitorIntelligence } from '@/app/actions'

// High-value luxury topics from Google Taxonomy
const TOPIC_MAP: Record<number, string> = {
    196: 'Jewelry & Watches',
    191: 'Luxury Goods',
    194: 'Clothing Accessories',
    18: 'Apparel',
    17: 'Lifestyle'
}

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
    const hasSyncedExternalRef = useRef<boolean>(false)

    // 1. Cross-Browser Intelligence (Topics API & Referrer Analysis)
    useEffect(() => {
        if (consentStatus !== 'granted' || !sessionId || hasSyncedExternalRef.current) return

        const captureExternalIntelligence = async () => {
            const externalData: any = {
                referrer_host: document.referrer ? new URL(document.referrer).hostname : 'direct',
                external_topics: [],
                inferred_intent: []
            }

            // Google Topics API (Overall Browser Interests - Chrome Only)
            if ('browsingTopics' in document) {
                try {
                    // @ts-ignore - Modern Privacy Sandbox API
                    const topics = await document.browsingTopics()
                    if (topics && Array.isArray(topics)) {
                        externalData.external_topics = topics.map((t: any) => ({
                            id: t.topic,
                            name: TOPIC_MAP[t.topic] || `Segment (${t.topic})`,
                            version: t.modelVersion
                        }))
                    }
                } catch (e) {
                    console.warn('Topics API not available or blocked')
                }
            }

            // Advanced Referral Intelligence
            const ref = document.referrer.toLowerCase()
            if (ref.includes('google') || ref.includes('bing')) externalData.inferred_intent.push('search_discovery')
            if (ref.includes('instagram') || ref.includes('facebook')) externalData.inferred_intent.push('social_referral')
            if (ref.includes('pinterest')) externalData.inferred_intent.push('visual_discovery')

            // Sync External Intelligence to marketing_info
            await upsertVisitorIntelligence({
                sessionId,
                marketingInfo: externalData
            })

            hasSyncedExternalRef.current = true
        }

        captureExternalIntelligence()
    }, [consentStatus, sessionId])

    // 2. Continuous Behavioral Tracking (On-Site)
    useEffect(() => {
        // Only track if consent is granted and session is established
        if (consentStatus !== 'granted' || !sessionId) return

        const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')

        // Prevent duplicate logs for the same path
        if (lastPathRef.current === currentPath) return
        lastPathRef.current = currentPath

        // Detect Interest (Segmentation)
        let interest: 'jewelry' | 'watches' | null = null
        const lowercasePath = pathname.toLowerCase()

        if (lowercasePath.includes('watch') || searchParams.get('category') === 'watches' || searchParams.get('type') === 'watches') {
            interest = 'watches'
        }
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
