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
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user || null)

            const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user || null)
            })

            return () => {
                authListener?.subscription.unsubscribe()
            }
        }
        checkUser()
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

    const handleGuestAdd = async (productId: string, size?: string, quantity: number = 1, productData?: any) => {
        const currentCart = [...items]
        const existingItemIndex = currentCart.findIndex(
            item => item.product_id === productId && item.size === size
        )

        if (existingItemIndex > -1) {
            currentCart[existingItemIndex].quantity += quantity
        } else {
            currentCart.push({
                id: `guest_${Math.random().toString(36).substr(2, 9)}`,
                product_id: productId,
                quantity,
                size,
                products: productData
            })
        }

        setItems(currentCart)
        localStorage.setItem('aurerxa_cart', JSON.stringify(currentCart))
        setLoading(false)
    }

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
        setLoading(true)
        try {
            if (user) {
                const result = await addToCartAction(productId, size, quantity)
                if (result.success) {
                    await refreshCart()
                } else if (result.error?.includes('Please login')) {
                    // Fallback to guest logic if server session is missing/expired
                    await handleGuestAdd(productId, size, quantity, productData)
                } else {
                    console.error('Failed to add to cart:', result.error)
                }
            } else {
                await handleGuestAdd(productId, size, quantity, productData)
            }
        } catch (error) {
            console.error('Error adding item:', error)
            setLoading(false)
        }
    }

    const updateQuantity = async (cartId: string, quantity: number) => {
        const newQuantity = Math.max(1, quantity)

        // Optimistic update
        const previousItems = [...items]
        setItems(items.map(item =>
            item.id === cartId ? { ...item, quantity: newQuantity } : item
        ))

        if (user && !cartId.startsWith('guest_')) {
            try {
                const result = await updateCartItemAction(cartId, newQuantity)
                if (!result.success) {
                    setItems(previousItems) // Rollback
                } else {
                    await refreshCart(true) // Silent refresh
                }
            } catch (error) {
                setItems(previousItems) // Rollback
            }
        } else {
            localStorage.setItem('aurerxa_cart', JSON.stringify(
                items.map(item => item.id === cartId ? { ...item, quantity: newQuantity } : item)
            ))
        }
    }

    const removeItem = async (cartId: string) => {
        // Optimistic update
        const previousItems = [...items]
        setItems(items.filter(item => item.id !== cartId))

        if (user && !cartId.startsWith('guest_')) {
            try {
                const result = await removeFromCartAction(cartId)
                if (!result.success) {
                    setItems(previousItems) // Rollback
                } else {
                    await refreshCart(true) // Silent refresh
                }
            } catch (error) {
                setItems(previousItems) // Rollback
            }
        } else {
            localStorage.setItem('aurerxa_cart', JSON.stringify(
                items.filter(item => item.id !== cartId)
            ))
        }
    }

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartContext.Provider value={{ items, loading, addItem, updateQuantity, removeItem, refreshCart, cartCount }}>
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
