'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
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
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [isCartOpen, setIsCartOpen] = useState(false)

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
                setUser(session?.user || null)
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

    useEffect(() => {
        refreshCart(false) // Initial load should show loader
    }, [user])

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

    // Single source of truth for Guest Persistence
    useEffect(() => {
        if (!user && items.length > 0) {
            localStorage.setItem('aurerxa_cart', JSON.stringify(items.filter(item => item.id.startsWith('guest_'))))
        } else if (!user && items.length === 0) {
            localStorage.removeItem('aurerxa_cart')
        }
    }, [items, user])

    const refreshCart = async (silent: boolean = true) => {
        if (!silent) setLoading(true)
        try {
            if (user) {
                // Sync guest items if any exist before loading from DB
                const localCart = localStorage.getItem('aurerxa_cart')
                if (localCart) {
                    await syncCart()
                }
                const data = await getCart()
                console.log('CartProvider: Loaded authenticated cart', { count: data?.length || 0 })
                setItems(data as any)
            } else {
                // Load from localStorage for guests
                const localCart = localStorage.getItem('aurerxa_cart')
                if (localCart) {
                    const parsed = JSON.parse(localCart)
                    console.log('CartProvider: Loaded guest cart', { count: parsed?.length || 0 })
                    setItems(parsed)
                } else {
                    setItems([])
                }
            }
        } catch (error) {
            console.error('Error refreshing cart:', error)
        } finally {
            setLoading(false)
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

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartContext.Provider value={{ items, loading, addItem, updateQuantity, removeItem, refreshCart, cartCount, isCartOpen, openCart, closeCart }}>
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
            closeCart: () => { }
        } as CartContextType
    }
    return context
}
