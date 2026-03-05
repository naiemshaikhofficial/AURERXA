'use client'

import { SWRConfig } from 'swr'
import React, { ReactNode, useEffect } from 'react'

/**
 * CUSTOM CACHE PROVIDER
 * Persists SWR cache to localStorage to enable instant loading on subsequent visits.
 * This complements our manual SiteConfig synchronization.
 */
function localStorageProvider() {
    if (typeof window === 'undefined') return new Map()

    // Initialize from localStorage
    const map = new Map(JSON.parse(localStorage.getItem('aurerxa-swr-cache') || '[]'))

    // Sync back to localStorage on window unload or visibility change
    const syncToStorage = () => {
        try {
            const appCache = JSON.stringify(Array.from(map.entries()))
            localStorage.setItem('aurerxa-swr-cache', appCache)
        } catch (e) {
            console.error('SWR Cache Persistence Error:', e)
        }
    }

    window.addEventListener('beforeunload', syncToStorage)

    // Also sync on visibility change (mobile friendly)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            syncToStorage()
        }
    })

    return map
}

export function SWRProvider({ children }: { children: ReactNode }) {
    return (
        <SWRConfig
            value={{
                // Global fetcher supporting both relative and absolute paths
                fetcher: async (url: string) => {
                    const res = await fetch(url)
                    if (!res.ok) throw new Error('API Error')
                    return res.json()
                },

                // Best Practice: 1 minute deduping to prevent double-fetching on same page
                dedupingInterval: 60000,

                // Best Practice: Disable focus revalidation for e-commerce to avoid layout shifts
                revalidateOnFocus: false,

                // Use persistent localStorage provider
                provider: typeof window !== 'undefined' ? (localStorageProvider as any) : undefined,

                // Global error handling for consistent UX
                onError: (error) => {
                    console.error('SWR Global Error:', error)
                }
            }}
        >
            {children}
        </SWRConfig>
    )
}
