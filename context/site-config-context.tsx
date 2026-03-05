'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getCategories, getGoldRates, getGlobalConfig } from '@/app/actions'

interface SiteConfigContextType {
    categories: any[]
    goldRates: any | null
    globalConfig: any | null
    loading: boolean
    refreshConfig: () => Promise<void>
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined)

const STORAGE_KEYS = {
    CATEGORIES: 'aurerxa-categories-cache',
    GOLD_RATES: 'aurerxa-gold-rates-cache',
    GLOBAL_CONFIG: 'aurerxa-global-config-cache'
}

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
    const [categories, setCategories] = useState<any[]>([])
    const [goldRates, setGoldRates] = useState<any | null>(null)
    const [globalConfig, setGlobalConfig] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    // 1. Instant Hydration from localStorage
    useEffect(() => {
        try {
            const cachedCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
            const cachedRates = localStorage.getItem(STORAGE_KEYS.GOLD_RATES)
            const cachedConfig = localStorage.getItem(STORAGE_KEYS.GLOBAL_CONFIG)

            if (cachedCats) setCategories(JSON.parse(cachedCats))
            if (cachedRates) setGoldRates(JSON.parse(cachedRates))
            if (cachedConfig) setGlobalConfig(JSON.parse(cachedConfig))
        } catch (e) {
            console.warn('Failed to hydrate site config from cache')
        }
    }, [])

    const refreshConfig = useCallback(async () => {
        try {
            const [cats, rates, config] = await Promise.all([
                getCategories(),
                getGoldRates(),
                getGlobalConfig()
            ])

            if (cats) {
                setCategories(cats)
                localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats))
            }
            if (rates) {
                setGoldRates(rates)
                localStorage.setItem(STORAGE_KEYS.GOLD_RATES, JSON.stringify(rates))
            }
            if (config) {
                setGlobalConfig(config)
                localStorage.setItem(STORAGE_KEYS.GLOBAL_CONFIG, JSON.stringify(config))
            }
        } catch (error) {
            console.error('Error refreshing site config:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshConfig()
    }, [refreshConfig])

    return (
        <SiteConfigContext.Provider value={{ categories, goldRates, globalConfig, loading, refreshConfig }}>
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
