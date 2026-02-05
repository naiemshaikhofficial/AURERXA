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
    }
}

interface CartContextType {
    items: CartItem[]
    loading: boolean
    addItem: (productId: string, size?: string, quantity?: number, productData?: any) => Promise<void>
    updateQuantity: (cartId: string, quantity: number) => Promise<void>
    removeItem: (cartId: string) => Promise<void>
    refreshCart: () => Promise<void>
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
        refreshCart()
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

    const refreshCart = async () => {
        setLoading(true)
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
                if (!result.success) {
                    console.error('Failed to add to cart:', result.error)
                }
                await refreshCart()
            } else {
                // Guest Cart Logic
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
                        products: productData // We pass product data for guest display
                    })
                }

                setItems(currentCart)
                localStorage.setItem('aurerxa_cart', JSON.stringify(currentCart))
                setLoading(false)
            }
        } catch (error) {
            console.error('Error adding item:', error)
            setLoading(false)
        }
    }

    const updateQuantity = async (cartId: string, quantity: number) => {
        if (user && !cartId.startsWith('guest_')) {
            await updateCartItemAction(cartId, quantity)
            await refreshCart()
        } else {
            const currentCart = items.map(item =>
                item.id === cartId ? { ...item, quantity: Math.max(1, quantity) } : item
            )
            setItems(currentCart)
            localStorage.setItem('aurerxa_cart', JSON.stringify(currentCart))
        }
    }

    const removeItem = async (cartId: string) => {
        if (user && !cartId.startsWith('guest_')) {
            await removeFromCartAction(cartId)
            await refreshCart()
        } else {
            const currentCart = items.filter(item => item.id !== cartId)
            setItems(currentCart)
            localStorage.setItem('aurerxa_cart', JSON.stringify(currentCart))
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
