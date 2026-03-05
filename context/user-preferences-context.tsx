'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getWishlist } from '@/lib/actions/wishlist'
import { useAuth } from './auth-context'

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
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined)

const STORAGE_KEYS = {
    WISHLIST: 'aurerxa-wishlist-cache',
    METAL_PREF: 'aurerxa-metal-pref',
    RING_SIZE: 'aurerxa-ring-size',
    DISMISSED: 'aurerxa-dismissed-interstitials'
}

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [wishlistIds, setWishlistIds] = useState<string[]>([])
    const [metalPreference, setMetalPreferenceState] = useState<string | null>(null)
    const [ringSize, setRingSizeState] = useState<string | null>(null)
    const [dismissedInterstitials, setDismissedInterstitials] = useState<string[]>([])

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

        // Actual server call should be handled by the component using addToWishlist/removeFromWishlist
        // But we handle the local sync here
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
            isInWishlist
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
