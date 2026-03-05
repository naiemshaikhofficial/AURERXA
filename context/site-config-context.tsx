'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { getCategories, getGoldRates, getGlobalConfig, getSiteManifest, getSyncData } from '@/app/actions'

interface SiteConfigContextType {
    categories: any[]
    collections: any[]
    heroSlides: any[]
    discoveryTags: string[]
    reviewStats: Record<string, { average: number, total: number }>
    goldRates: any | null
    globalConfig: any | null
    loading: boolean
    refreshConfig: () => Promise<void>
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined)

const STORAGE_KEYS = {
    CATEGORIES: 'aurerxa-categories-cache',
    COLLECTIONS: 'aurerxa-collections-cache',
    HERO: 'aurerxa-hero-cache',
    TAGS: 'aurerxa-tags-cache',
    REVIEWS: 'aurerxa-reviews-cache',
    GOLD_RATES: 'aurerxa-gold-rates-cache',
    GLOBAL_CONFIG: 'aurerxa-global-config-cache',
    MANIFEST: 'aurerxa-site-manifest'
}

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
    const [categories, setCategories] = useState<any[]>([])
    const [collections, setCollections] = useState<any[]>([])
    const [heroSlides, setHeroSlides] = useState<any[]>([])
    const [discoveryTags, setDiscoveryTags] = useState<string[]>([])
    const [reviewStats, setReviewStats] = useState<Record<string, { average: number, total: number }>>({})
    const [goldRates, setGoldRates] = useState<any | null>(null)
    const [globalConfig, setGlobalConfig] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    // 1. Instant Hydration from localStorage
    useEffect(() => {
        try {
            const cachedCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
            const cachedCols = localStorage.getItem(STORAGE_KEYS.COLLECTIONS)
            const cachedHero = localStorage.getItem(STORAGE_KEYS.HERO)
            const cachedTags = localStorage.getItem(STORAGE_KEYS.TAGS)
            const cachedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS)
            const cachedRates = localStorage.getItem(STORAGE_KEYS.GOLD_RATES)
            const cachedConfig = localStorage.getItem(STORAGE_KEYS.GLOBAL_CONFIG)

            if (cachedCats) setCategories(JSON.parse(cachedCats))
            if (cachedCols) setCollections(JSON.parse(cachedCols))
            if (cachedHero) setHeroSlides(JSON.parse(cachedHero))
            if (cachedTags) setDiscoveryTags(JSON.parse(cachedTags))
            if (cachedReviews) setReviewStats(JSON.parse(cachedReviews))
            if (cachedRates) setGoldRates(JSON.parse(cachedRates))
            if (cachedConfig) setGlobalConfig(JSON.parse(cachedConfig))
        } catch (e) {
            console.warn('Failed to hydrate site config from cache')
        }
    }, [])

    const isSyncing = useRef(false)
    const [lastSync, setLastSync] = useState<number>(0)

    const syncWithManifest = useCallback(async (force = false) => {
        if (isSyncing.current) return
        isSyncing.current = true

        try {
            // 1. Get Manifest
            const manifestRes = await getSiteManifest()
            if (!manifestRes.success || !manifestRes.manifest) {
                setLoading(false)
                return
            }

            const serverManifest = manifestRes.manifest
            const localManifestStr = localStorage.getItem(STORAGE_KEYS.MANIFEST)
            const localManifest = localManifestStr ? JSON.parse(localManifestStr) : {}

            const bucketsToFetch: string[] = []

            // 2. Compare Categorical Data
            if (force || serverManifest.categories !== localManifest.categories) {
                bucketsToFetch.push('categories')
                bucketsToFetch.push('collections')
            }

            if (force || serverManifest.hero !== localManifest.hero) {
                bucketsToFetch.push('hero_slides')
                bucketsToFetch.push('discovery_tags')
            }

            if (force || serverManifest.reviews !== localManifest.reviews) {
                bucketsToFetch.push('review_stats')
            }

            // 3. Compare Config/Rates (Global Sync)
            let fetchRates = force || serverManifest.products !== localManifest.products // Use products as proxy for price changes
            let fetchConfig = force || serverManifest.config !== localManifest.config

            // 4. Batch Fetch needed buckets
            if (bucketsToFetch.length > 0) {
                console.log('[PHASE 6] Syncing stale buckets:', bucketsToFetch)
                const syncRes = await getSyncData(bucketsToFetch)
                if (syncRes.success && syncRes.data) {
                    if (syncRes.data.categories) {
                        setCategories(syncRes.data.categories)
                        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(syncRes.data.categories))
                    }
                    if (syncRes.data.collections) {
                        setCollections(syncRes.data.collections)
                        localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(syncRes.data.collections))
                    }
                    if (syncRes.data.hero_slides) {
                        setHeroSlides(syncRes.data.hero_slides)
                        localStorage.setItem(STORAGE_KEYS.HERO, JSON.stringify(syncRes.data.hero_slides))
                    }
                    if (syncRes.data.discovery_tags) {
                        setDiscoveryTags(syncRes.data.discovery_tags)
                        localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(syncRes.data.discovery_tags))
                    }
                    if (syncRes.data.review_stats) {
                        setReviewStats(syncRes.data.review_stats)
                        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(syncRes.data.review_stats))
                    }
                }
            }

            // 5. Individual fetches for config/rates if changed
            if (fetchRates) {
                const rates = await getGoldRates()
                if (rates) {
                    setGoldRates(rates)
                    localStorage.setItem(STORAGE_KEYS.GOLD_RATES, JSON.stringify(rates))
                }
            }

            if (fetchConfig) {
                const config = await getGlobalConfig()
                if (config) {
                    setGlobalConfig(config)
                    localStorage.setItem(STORAGE_KEYS.GLOBAL_CONFIG, JSON.stringify(config))
                }
            }

            // 6. Finalize Manifest
            localStorage.setItem(STORAGE_KEYS.MANIFEST, JSON.stringify(serverManifest))
            setLastSync(Date.now())

        } catch (error) {
            console.error('[PHASE 5] Sync Error:', error)
        } finally {
            setLoading(false)
            isSyncing.current = false
        }
    }, [])

    const refreshConfig = useCallback(async () => {
        await syncWithManifest(true)
    }, [syncWithManifest])

    useEffect(() => {
        syncWithManifest()
    }, [syncWithManifest])

    return (
        <SiteConfigContext.Provider value={{
            categories,
            collections,
            heroSlides,
            discoveryTags,
            reviewStats,
            goldRates,
            globalConfig,
            loading,
            refreshConfig
        }}>
            {children}
        </SiteConfigContext.Provider>
    )
}

export function useSiteConfig() {
    const context = useContext(SiteConfigContext)
    if (context === undefined) {
        throw new Error('useSiteConfig must be used within a SiteConfigProvider')
    }
    return context
}
