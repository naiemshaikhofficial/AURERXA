'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import useSWR, { mutate } from 'swr'
import { getCart, addToCart as addToCartAction, updateCartItem as updateCartItemAction, removeFromCart as removeFromCartAction } from '@/app/actions'
import { supabase } from '@/lib/supabase'

export interface CartItem {
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
    const [user, setUser] = useState<any>(null)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [savedItems, setSavedItems] = useState<CartItem[]>([])
    const [guestItems, setGuestItems] = useState<CartItem[]>([])

    // SWR for Server-side Cart
    const { data: serverItems, error, isLoading, mutate: mutateCart } = useSWR(
        user ? ['cart', user.id] : null,
        async () => {
            const data = await getCart()
            return data as CartItem[]
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 5000,
        }
    )

    // Derived consistent state: Server items for logged in, state for guests
    const items = user ? (serverItems || []) : guestItems
    const loading = user ? isLoading : false

    const SAVED_ITEMS_KEY = `aurerxa_saved_${user?.id || 'guest'}`

    const openCart = () => setIsCartOpen(true)
    const closeCart = () => setIsCartOpen(false)

    // Auth Sync & User Context
    useEffect(() => {
        let authListener: any = null

        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user || null)

            const { data } = supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_OUT') {
                    setUser(null)
                    setGuestItems([])
                    // Explicitly clear SWR cache for the user's cart
                    mutate(['cart', session?.user?.id], [], false)
                } else {
                    setUser(session?.user || null)
                }
            })
            authListener = data
        }
        checkUser()

        return () => {
            if (authListener) authListener.subscription.unsubscribe()
        }
    }, [])

    // Guest Cart Persistence
    useEffect(() => {
        if (!user) {
            const localCart = localStorage.getItem('aurerxa_cart')
            if (localCart) {
                try {
                    setGuestItems(JSON.parse(localCart))
                } catch (e) {
                    localStorage.removeItem('aurerxa_cart')
                }
            }
        }
    }, [user])

    useEffect(() => {
        if (!user) {
            if (guestItems.length > 0) {
                localStorage.setItem('aurerxa_cart', JSON.stringify(guestItems))
            } else {
                localStorage.removeItem('aurerxa_cart')
            }
        }
    }, [guestItems, user])

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

    // Guest to User Cart Sync
    const syncCart = async () => {
        const localCart = localStorage.getItem('aurerxa_cart')
        if (localCart && user) {
            try {
                const guestItemsToSync = JSON.parse(localCart)
                if (Array.isArray(guestItemsToSync)) {
                    for (const item of guestItemsToSync) {
                        await addToCartAction(item.product_id, item.size, item.quantity)
                    }
                    localStorage.removeItem('aurerxa_cart')
                    await mutateCart()
                }
            } catch (error) {
                console.error('CartProvider: Error syncing cart:', error)
            }
        }
    }

    useEffect(() => {
        if (user) syncCart()
    }, [user?.id])

    const refreshCart = async (silent: boolean = true) => {
        if (user) await mutateCart()
    }

    // --- OPTIMISTIC UI ACTIONS ---

    const addItem = async (productId: string, size?: string, quantity: number = 1, productData?: any) => {
        if (!user) {
            setGuestItems(prev => {
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
            return
        }

        // Optimistic SWR Update for Logged-in User
        const optimisticData = [...items]
        const existingIdx = optimisticData.findIndex(i => i.product_id === productId && i.size === size)

        if (existingIdx > -1) {
            optimisticData[existingIdx] = {
                ...optimisticData[existingIdx],
                quantity: optimisticData[existingIdx].quantity + quantity
            }
        } else {
            optimisticData.push({
                id: `temp_${Date.now()}`,
                product_id: productId,
                quantity,
                size,
                products: productData
            })
        }

        mutateCart(
            addToCartAction(productId, size, quantity).then(() => getCart()),
            {
                optimisticData: optimisticData as any,
                rollbackOnError: true,
                revalidate: true,
            }
        )
        openCart()
    }

    const updateQuantity = async (cartId: string, quantity: number) => {
        const newQuantity = Math.max(1, quantity)

        if (!user || cartId.startsWith('guest_')) {
            setGuestItems(prev => prev.map(item =>
                item.id === cartId ? { ...item, quantity: newQuantity } : item
            ))
            return
        }

        // Optimistic SWR Update
        const optimisticData = items.map(item =>
            item.id === cartId ? { ...item, quantity: newQuantity } : item
        )

        mutateCart(
            updateCartItemAction(cartId, newQuantity).then(() => getCart()),
            {
                optimisticData,
                rollbackOnError: true,
                revalidate: true,
            }
        )
    }

    const removeItem = async (cartId: string) => {
        if (!user || cartId.startsWith('guest_')) {
            setGuestItems(prev => prev.filter(item => item.id !== cartId))
            return
        }

        // Optimistic SWR Update
        const optimisticData = items.filter(item => item.id !== cartId)

        mutateCart(
            removeFromCartAction(cartId).then(() => getCart()),
            {
                optimisticData,
                rollbackOnError: true,
                revalidate: true,
            }
        )
    }

    const saveForLater = async (cartId: string) => {
        const item = items.find(i => i.id === cartId)
        if (item) {
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
