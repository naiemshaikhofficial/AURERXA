import { SWRConfig } from 'swr'
import React, { ReactNode, useEffect } from 'react'
import { getCache, setCache } from '@/lib/utils/indexed-db'

/**
 * ELITE CACHE PROVIDER
 * Persists SWR cache to IndexedDB for high-volume, reliable client-side storage.
 */
function indexedDBProvider() {
    const map = new Map()

    if (typeof window !== 'undefined') {
        // Hydrate from IndexedDB on start
        getCache().then(cachedMap => {
            cachedMap.forEach((val, key) => {
                map.set(key, val)
            })
        })

        // Listen for changes to sync back (simple approach)
        // Note: For high frequency, consider batching
        const originalSet = map.set.bind(map)
        map.set = (key, value) => {
            setCache(key, value).catch(console.error)
            return originalSet(key, value)
        }
    }

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

                // Elite Efficiency: 5 minute deduping to drastically reduce redundant hits
                dedupingInterval: 300000,

                // Elite Efficiency: Disable focus & reconnect revalidation to prevent "chattiness"
                revalidateOnFocus: false,
                revalidateOnReconnect: false,

                // Use persistent IndexedDB provider
                provider: typeof window !== 'undefined' ? (indexedDBProvider as any) : undefined,

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
