'use server'

import { revalidateTag } from 'next/cache'
import { getAuthClient } from './utils'
import { ActionResponse } from './types'

export async function getWishlist() {
    try {
        const client = await getAuthClient()
        const { data: { user } } = await client.auth.getUser()
        if (!user) return []

        const { data, error } = await client
            .from('wishlist')
            .select('*, products(*)')
            .eq('user_id', user.id)

        if (error) throw error
        return data || []
    } catch (err) {
        console.error('getWishlist error:', err)
        return []
    }
}

export async function addToWishlist(productId: string): Promise<ActionResponse> {
    try {
        const client = await getAuthClient()
        const { data: { user } } = await client.auth.getUser()
        if (!user) return { success: false, error: 'Authentication required' }

        const { error } = await client
            .from('wishlist')
            .upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id, product_id' })

        if (error) throw error
        revalidateTag('wishlist')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function removeFromWishlist(productId: string): Promise<ActionResponse> {
    try {
        const client = await getAuthClient()
        const { data: { user } } = await client.auth.getUser()
        if (!user) return { success: false, error: 'Authentication required' }

        const { error } = await client
            .from('wishlist')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId)

        if (error) throw error
        revalidateTag('wishlist')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function isInWishlist(productId: string): Promise<boolean> {
    try {
        const client = await getAuthClient()
        const { data: { user } } = await client.auth.getUser()
        if (!user) return false

        const { data, error } = await client
            .from('wishlist')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .maybeSingle()

        if (error) return false
        return !!data
    } catch (err) {
        return false
    }
}

