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
            setUser(session?.user || null)

            const { data } = supabase.auth.onAuthStateChange((_event, session) => {
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
            try {
                const guestItems = JSON.parse(localCart)
                let allSuccess = true
                for (const item of guestItems) {
                    const result = await addToCartAction(item.product_id, item.size, item.quantity)
                    if (!result.success) allSuccess = false
                }
                // Only clear if we processed everything
                if (allSuccess) {
                    localStorage.removeItem('aurerxa_cart')
                }
            } catch (error) {
                console.error('Error syncing cart:', error)
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
                setItems(data as any)
            } else {
                // Load from localStorage for guests
                const localCart = localStorage.getItem('aurerxa_cart')
                if (localCart) {
                    setItems(JSON.parse(localCart))
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

        // Optimistic add if we have product data
        if (productData) {
            setItems(prev => {
                const existing = prev.find(item => item.product_id === productId && item.size === size)
                if (existing) {
                    return prev.map(item => item.id === existing.id ? { ...item, quantity: item.quantity + quantity } : item)
                }
                return [...prev, {
                    id: `temp_${Date.now()}`,
                    product_id: productId,
                    quantity,
                    size,
                    products: productData
                }]
            })
        }

        try {
            const result = await addToCartAction(productId, size, quantity)
            if (result.success) {
                await refreshCart(true)
                openCart()
            } else {
                console.error('Failed to add to cart:', result.error)
                // If it failed, refresh to get actual state
                await refreshCart(true)
            }
        } catch (error) {
            console.error('Error adding item:', error)
            await refreshCart(true)
        }
    }

    const updateQuantity = async (cartId: string, quantity: number) => {
        const newQuantity = Math.max(1, quantity)

        setItems(prev => prev.map(item =>
            item.id === cartId ? { ...item, quantity: newQuantity } : item
        ))

        if (user && !cartId.startsWith('guest_') && !cartId.startsWith('temp_')) {
            try {
                const result = await updateCartItemAction(cartId, newQuantity)
                if (!result.success) {
                    await refreshCart(true) // Revert by refreshing
                }
            } catch (error) {
                await refreshCart(true)
            }
        }
    }

    const removeItem = async (cartId: string) => {
        setItems(prev => prev.filter(item => item.id !== cartId))

        if (user && !cartId.startsWith('guest_') && !cartId.startsWith('temp_')) {
            try {
                const result = await removeFromCartAction(cartId)
                if (!result.success) {
                    await refreshCart(true)
                }
            } catch (error) {
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
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
