'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { getCart, addToCart as addToCartAction, updateCartItem as updateCartItemAction, removeFromCart as removeFromCartAction } from '@/app/actions'
import { supabase } from '@/lib/supabase'

interface CartItem {
    id: string
    product_id: string
    quantity: number
    size?: string
    products?: {
        id: string
        name: string
        price: number
        image_url: string
        slug: string
        weight_grams?: number
        purity?: string
        gender?: string
    }
}

interface CartContextType {
    items: CartItem[]
    loading: boolean
    addItem: (productId: string, size?: string, quantity?: number, productData?: any) => Promise<void>
    updateQuantity: (cartId: string, quantity: number) => Promise<void>
    removeItem: (cartId: string) => Promise<void>
    refreshCart: (silent?: boolean) => Promise<void>
    cartCount: number
    isCartOpen: boolean
    openCart: () => void
    closeCart: () => void
    savedItems: CartItem[]
    saveForLater: (cartId: string) => Promise<void>
    moveToCart: (item: CartItem) => Promise<void>
    removeSavedItem: (productId: string, size?: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [savedItems, setSavedItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)

    const SAVED_ITEMS_KEY = `aurerxa_saved_${user?.id || 'guest'}`

    const openCart = () => setIsCartOpen(true)
    const closeCart = () => setIsCartOpen(false)

    useEffect(() => {
        let authListener: { subscription: { unsubscribe: () => void } } | null = null

        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            console.log('CartProvider: Initial session check', { hasSession: !!session, userId: session?.user?.id })
            setUser(session?.user || null)

            const { data } = supabase.auth.onAuthStateChange((event, session) => {
                console.log('CartProvider: Auth state changed', { event, userId: session?.user?.id })

                if (event === 'SIGNED_OUT') {
                    // Immediately clear all cart state on sign-out
                    setUser(null)
                    setItems([])
                    hasRefreshedRef.current = null // Reset so next login triggers a fresh fetch
                    try {
                        localStorage.removeItem('aurerxa_cart')
                    } catch (e) { /* ignore */ }
                } else {
                    setUser(session?.user || null)
                    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                        // Reset ref so the useEffect below triggers a fresh cart load
                        hasRefreshedRef.current = null
                    }
                }
            })
            authListener = data
        }
        checkUser()

        return () => {
            if (authListener) {
                authListener.subscription.unsubscribe()
            }
        }
    }, [])

    const hasRefreshedRef = useRef<string | null>(null)
    useEffect(() => {
        // Prevent redundant refreshes for the same user ID (includes null)
        const currentId = user?.id || 'guest'
        if (hasRefreshedRef.current === currentId) return
        hasRefreshedRef.current = currentId

        refreshCart(false) // Initial load should show loader
    }, [user?.id])

    const syncCart = async () => {
        const localCart = localStorage.getItem('aurerxa_cart')
        if (localCart && user) {
            console.log('CartProvider: Syncing guest cart to user account', { userId: user.id })
            try {
                const guestItems = JSON.parse(localCart)
                if (!Array.isArray(guestItems)) {
                    console.warn('CartProvider: Local cart data is not an array, clearing.')
                    localStorage.removeItem('aurerxa_cart')
                    return
                }

                let allSuccess = true
                for (const item of guestItems) {
                    const result = await addToCartAction(item.product_id, item.size, item.quantity)
                    if (!result.success) {
                        console.error('CartProvider: Failed to sync item', item.product_id, result.error)
                        allSuccess = false
                    }
                }

                if (allSuccess) {
                    console.log('CartProvider: Successfully synced all guest items')
                    localStorage.removeItem('aurerxa_cart')
                }
            } catch (error) {
                console.error('CartProvider: Error syncing cart:', error)
            }
        }
    }

    const handleGuestAdd = (productId: string, size?: string, quantity: number = 1, productData?: any) => {
        setItems(prev => {
            const currentCart = [...prev]
            const existingItemIndex = currentCart.findIndex(
                item => item.product_id === productId && item.size === size
            )

            if (existingItemIndex > -1) {
                const updatedItem = { ...currentCart[existingItemIndex] }
                updatedItem.quantity += quantity
                currentCart[existingItemIndex] = updatedItem
            } else {
                currentCart.push({
                    id: `guest_${Math.random().toString(36).substr(2, 9)}`,
                    product_id: productId,
                    quantity,
                    size,
                    products: productData
                })
            }
            return currentCart
        })
        openCart()
    }

    // Single source of truth for Persistence
    useEffect(() => {
        if (!user && items.length > 0) {
            localStorage.setItem('aurerxa_cart', JSON.stringify(items.filter(item => item.id.startsWith('guest_'))))
        } else if (!user && items.length === 0) {
            localStorage.removeItem('aurerxa_cart')
        }
    }, [items, user])

    // Save for Later Persistence
    useEffect(() => {
        try {
            const localSaved = localStorage.getItem(SAVED_ITEMS_KEY)
            if (localSaved) setSavedItems(JSON.parse(localSaved))
        } catch (e) { /* ignore */ }
    }, [SAVED_ITEMS_KEY])

    useEffect(() => {
        if (savedItems.length > 0) {
            localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(savedItems))
        } else {
            localStorage.removeItem(SAVED_ITEMS_KEY)
        }
    }, [savedItems, SAVED_ITEMS_KEY])

    const refreshCart = async (silent: boolean = true) => {
        if (isRefreshing) return
        if (!silent) setLoading(true)
        setIsRefreshing(true)

        const currentId = user?.id || 'guest'
        const STORAGE_KEY = `aurerxa_cart_${currentId}`

        try {
            // Instant Hydration from local storage for current user context
            const localCart = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('aurerxa_cart')
            if (localCart && items.length === 0) {
                const parsed = JSON.parse(localCart)
                setItems(parsed)
            }

            if (user) {
                // Sync guest items if any exist before loading from DB
                const guestCart = localStorage.getItem('aurerxa_cart')
                if (guestCart) {
                    await syncCart()
                }
                const data = await getCart()
                setItems(data as any)

                // Cache the fresh server data locally
                if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
            } else {
                // Load from localStorage for guests
                const localCart = localStorage.getItem('aurerxa_cart')
                if (localCart) {
                    const parsed = JSON.parse(localCart)
                    setItems(parsed)
                } else {
                    setItems([])
                }
            }
        } catch (error) {
            console.error('Error refreshing cart:', error)
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }

    const addItem = async (productId: string, size?: string, quantity: number = 1, productData?: any) => {
        if (!user) {
            handleGuestAdd(productId, size, quantity, productData)
            return
        }

        // Optimistic update state
        let tempId = `temp_${Date.now()}`
        setItems(prev => {
            const existing = prev.find(item => item.product_id === productId && item.size === size)
            if (existing) {
                return prev.map(item => item.id === existing.id ? { ...item, quantity: item.quantity + quantity } : item)
            }
            return [...prev, {
                id: tempId,
                product_id: productId,
                quantity,
                size,
                products: productData
            }]
        })
        openCart()

        try {
            const result = await addToCartAction(productId, size, quantity)
            console.log('CartProvider: addItem result', result)
            if (result.success) {
                // If we got the new item back, we could use it, but for now just refresh silently
                await refreshCart(true)
            } else {
                console.error('CartProvider: addItem failed', result.error)
                // Revert optimistic update on failure
                await refreshCart(true)
            }
        } catch (error) {
            console.error('CartProvider: addItem exception', error)
            await refreshCart(true)
        }
    }

    const updateQuantity = async (cartId: string, quantity: number) => {
        const newQuantity = Math.max(1, quantity)
        const previousItems = [...items]

        // Optimistic update
        setItems(prev => prev.map(item =>
            item.id === cartId ? { ...item, quantity: newQuantity } : item
        ))

        if (user && !cartId.startsWith('guest_') && !cartId.startsWith('temp_')) {
            try {
                const result = await updateCartItemAction(cartId, newQuantity)
                if (!result.success) {
                    setItems(previousItems)
                    await refreshCart(true)
                }
            } catch (error) {
                setItems(previousItems)
                await refreshCart(true)
            }
        }
    }

    const removeItem = async (cartId: string) => {
        const previousItems = [...items]

        // Optimistic update
        setItems(prev => prev.filter(item => item.id !== cartId))

        if (user && !cartId.startsWith('guest_') && !cartId.startsWith('temp_')) {
            try {
                const result = await removeFromCartAction(cartId)
                if (!result.success) {
                    setItems(previousItems)
                    await refreshCart(true)
                }
            } catch (error) {
                setItems(previousItems)
                await refreshCart(true)
            }
        }
    }

    const saveForLater = async (cartId: string) => {
        const item = items.find(i => i.id === cartId)
        if (item) {
            // Check if already in saved items to avoid duplicates
            setSavedItems(prev => {
                const exists = prev.find(i => i.product_id === item.product_id && i.size === item.size)
                if (exists) return prev
                return [...prev, item]
            })
            await removeItem(cartId)
        }
    }

    const moveToCart = async (item: CartItem) => {
        await addItem(item.product_id, item.size, item.quantity, item.products)
        setSavedItems(prev => prev.filter(i => !(i.product_id === item.product_id && i.size === item.size)))
    }

    const removeSavedItem = (productId: string, size?: string) => {
        setSavedItems(prev => prev.filter(i => !(i.product_id === productId && i.size === size)))
    }

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartContext.Provider value={{
            items,
            loading,
            addItem,
            updateQuantity,
            removeItem,
            refreshCart,
            cartCount,
            isCartOpen,
            openCart,
            closeCart,
            savedItems,
            saveForLater,
            moveToCart,
            removeSavedItem
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)

    // During SSR, some components might trigger this early. 
    // Return a dummy context object to prevent crashing, 
    // as it will re-render correctly on the client.
    if (context === undefined) {
        return {
            items: [],
            loading: true,
            addItem: async () => { },
            updateQuantity: async () => { },
            removeItem: async () => { },
            refreshCart: async () => { },
            cartCount: 0,
            isCartOpen: false,
            openCart: () => { },
            closeCart: () => { },
            savedItems: [],
            saveForLater: async () => { },
            moveToCart: async () => { },
            removeSavedItem: () => { }
        } as CartContextType
    }
    return context
}
