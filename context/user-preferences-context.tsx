'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getWishlist, addToWishlist, removeFromWishlist } from '@/lib/actions/wishlist'
import { useAuth } from './auth-context'

interface BehavioralData {
    categories: Record<string, number>
    materials: Record<string, number>
    lastUpdate: string
}

interface UserPreferencesContextType {
    wishlistIds: string[]
    toggleWishlist: (productId: string) => Promise<void>
    metalPreference: string | null
    setMetalPreference: (metal: string) => void
    ringSize: string | null
    setRingSize: (size: string) => void
    dismissedInterstitials: string[]
    dismissInterstitial: (id: string) => void
    isInWishlist: (productId: string) => boolean
    viewMode: 'grid' | 'list'
    setViewMode: (mode: 'grid' | 'list') => void
    behavioralData: BehavioralData
    trackEngagement: (type: 'category' | 'material', id: string) => void
    syncNow: () => Promise<void>
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined)

const STORAGE_KEYS = {
    WISHLIST: 'aurerxa-wishlist-cache',
    METAL_PREF: 'aurerxa-metal-pref',
    RING_SIZE: 'aurerxa-ring-size',
    DISMISSED: 'aurerxa-dismissed-interstitials',
    VIEW_MODE: 'aurerxa-view-mode',
    BEHAVIOR: 'aurerxa-behavior-data',
    SYNC_QUEUE: 'aurerxa-sync-queue'
}

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [wishlistIds, setWishlistIds] = useState<string[]>([])
    const [metalPreference, setMetalPreferenceState] = useState<string | null>(null)
    const [ringSize, setRingSizeState] = useState<string | null>(null)
    const [dismissedInterstitials, setDismissedInterstitials] = useState<string[]>([])
    const [viewMode, setViewModeState] = useState<'grid' | 'list'>('grid')
    const [behavioralData, setBehavioralData] = useState<BehavioralData>({
        categories: {},
        materials: {},
        lastUpdate: new Date().toISOString()
    })
    const [syncQueue, setSyncQueue] = useState<any[]>([])

    const SYNC_RETRY_INTERVAL = 30000 // Retry every 30s if failed

    // 1. Instant Hydration
    useEffect(() => {
        try {
            const cachedWish = localStorage.getItem(STORAGE_KEYS.WISHLIST)
            if (cachedWish) setWishlistIds(JSON.parse(cachedWish))

            const cachedMetal = localStorage.getItem(STORAGE_KEYS.METAL_PREF)
            if (cachedMetal) setMetalPreferenceState(cachedMetal)

            const cachedSize = localStorage.getItem(STORAGE_KEYS.RING_SIZE)
            if (cachedSize) setRingSizeState(cachedSize)

            const cachedDismissed = localStorage.getItem(STORAGE_KEYS.DISMISSED)
            if (cachedDismissed) setDismissedInterstitials(JSON.parse(cachedDismissed))

            const cachedViewMode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as 'grid' | 'list'
            if (cachedViewMode) setViewModeState(cachedViewMode)

            const cachedBehavior = localStorage.getItem(STORAGE_KEYS.BEHAVIOR)
            if (cachedBehavior) {
                const parsed = JSON.parse(cachedBehavior)
                // Decay logic: If last update was > 7 days ago, reset scores partially or fully
                const lastDate = new Date(parsed.lastUpdate).getTime()
                const now = new Date().getTime()
                const daysDiff = (now - lastDate) / (1000 * 60 * 60 * 24)

                if (daysDiff > 7) {
                    // Reset but keep some memory (50% decay)
                    const decayed: BehavioralData = {
                        categories: Object.fromEntries(Object.entries(parsed.categories as Record<string, number>).map(([k, v]) => [k, Math.floor(v / 2)])),
                        materials: Object.fromEntries(Object.entries(parsed.materials as Record<string, number>).map(([k, v]) => [k, Math.floor(v / 2)])),
                        lastUpdate: new Date().toISOString()
                    }
                    setBehavioralData(decayed)
                    localStorage.setItem(STORAGE_KEYS.BEHAVIOR, JSON.stringify(decayed))
                } else {
                    setBehavioralData(parsed)
                }
            }
            const cachedSync = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE)
            if (cachedSync) setSyncQueue(JSON.parse(cachedSync))
        } catch (e) {
            console.warn('Preferences hydration failed')
        }
    }, [])

    // 2. Sync Wishlist if logged in
    useEffect(() => {
        if (user) {
            getWishlist().then(data => {
                const ids = data.map((item: any) => item.product_id)
                setWishlistIds(ids)
                localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(ids))
            })
        } else {
            // Clear wishlist cache if logged out
            setWishlistIds([])
            localStorage.removeItem(STORAGE_KEYS.WISHLIST)
        }
    }, [user])

    const toggleWishlist = useCallback(async (productId: string) => {
        const isCurrentlyIn = wishlistIds.includes(productId)
        const newIds = isCurrentlyIn
            ? wishlistIds.filter(id => id !== productId)
            : [...wishlistIds, productId]

        // Optimistic update
        setWishlistIds(newIds)
        localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(newIds))

        // Actual server call
        try {
            if (isCurrentlyIn) {
                await removeFromWishlist(productId)
            } else {
                await addToWishlist(productId)
            }
        } catch (e) {
            // Error handling: Queue for retry
            console.warn('Wishlist sync failed, queuing for retry:', productId)
            setSyncQueue(prev => [
                ...prev.filter(a => a.id !== productId || a.type !== 'wishlist'), // Avoid duplicates
                {
                    type: 'wishlist',
                    id: productId,
                    method: isCurrentlyIn ? 'remove' : 'add',
                    timestamp: Date.now()
                }
            ])
        }
    }, [wishlistIds])

    const setMetalPreference = useCallback((metal: string) => {
        setMetalPreferenceState(metal)
        localStorage.setItem(STORAGE_KEYS.METAL_PREF, metal)
    }, [])

    const setRingSize = useCallback((size: string) => {
        setRingSizeState(size)
        localStorage.setItem(STORAGE_KEYS.RING_SIZE, size)
    }, [])

    const dismissInterstitial = useCallback((id: string) => {
        const newDismissed = Array.from(new Set([...dismissedInterstitials, id]))
        setDismissedInterstitials(newDismissed)
        localStorage.setItem(STORAGE_KEYS.DISMISSED, JSON.stringify(newDismissed))
    }, [dismissedInterstitials])

    const isInWishlist = useCallback((productId: string) => {
        return wishlistIds.includes(productId)
    }, [wishlistIds])

    const setViewMode = useCallback((mode: 'grid' | 'list') => {
        setViewModeState(mode)
        localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode)
    }, [])

    const trackEngagement = useCallback((type: 'category' | 'material', id: string) => {
        setBehavioralData(prev => {
            const key = type === 'category' ? 'categories' : 'materials'
            const currentScore = prev[key][id] || 0
            const newData = {
                ...prev,
                [key]: {
                    ...prev[key],
                    [id]: Math.min(currentScore + 1, 100) // Cap at 100
                },
                lastUpdate: new Date().toISOString()
            }
            localStorage.setItem(STORAGE_KEYS.BEHAVIOR, JSON.stringify(newData))
            return newData
        })
    }, [])

    const syncNow = useCallback(async () => {
        if (syncQueue.length === 0) return

        console.log('Elite Sync: Attempting to sync queued actions...', syncQueue.length)
        const pending = [...syncQueue]
        setSyncQueue([]) // Clear local state during attempt

        for (const action of pending) {
            try {
                if (action.type === 'wishlist') {
                    const { addToWishlist, removeFromWishlist } = await import('@/lib/actions/wishlist')
                    if (action.method === 'add') await addToWishlist(action.id)
                    else await removeFromWishlist(action.id)
                }
            } catch (e) {
                // If failed, re-queue
                setSyncQueue(prev => [...prev, action])
            }
        }
    }, [syncQueue])

    // Auto-sync on connection return or navigation
    useEffect(() => {
        const handleSync = () => syncNow()
        window.addEventListener('online', handleSync)

        // Save queue to local storage
        if (syncQueue.length > 0) {
            localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(syncQueue))
        } else {
            localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE)
        }

        return () => window.removeEventListener('online', handleSync)
    }, [syncQueue, syncNow])

    return (
        <UserPreferencesContext.Provider value={{
            wishlistIds,
            toggleWishlist,
            metalPreference,
            setMetalPreference,
            ringSize,
            setRingSize,
            dismissedInterstitials,
            dismissInterstitial,
            isInWishlist,
            viewMode,
            setViewMode,
            behavioralData,
            trackEngagement,
            syncNow
        }}>
            {children}
        </UserPreferencesContext.Provider>
    )
}

export function useUserPreferences() {
    const context = useContext(UserPreferencesContext)
    if (context === undefined) {
        throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
    }
    return context
}
