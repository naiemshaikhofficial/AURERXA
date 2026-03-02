'use server'

import { revalidateTag } from 'next/cache'
import { getAuthClient, supabaseServer } from './utils'
import { ActionResponse } from './types'

export async function getCart() {
    try {
        const client = await getAuthClient()
        const { data: { user } } = await client.auth.getUser()
        if (!user) return []

        const { data, error } = await client
            .from('cart')
            .select('*, products(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (err) {
        console.error('getCart error:', err)
        return []
    }
}

export async function addToCart(productId: string, size?: string, quantity: number = 1): Promise<ActionResponse> {
    try {
        const client = await getAuthClient()
        const { data: { user } } = await client.auth.getUser()
        if (!user) return { success: false, error: 'Authentication required' }

        // Check for existing item with same size
        const { data: existing } = await client
            .from('cart')
            .select('id, quantity')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .eq('size', size || '')
            .maybeSingle()

        if (existing) {
            const { error } = await client
                .from('cart')
                .update({ quantity: existing.quantity + quantity })
                .eq('id', existing.id)
            if (error) throw error
        } else {
            const { error } = await client
                .from('cart')
                .insert({
                    user_id: user.id,
                    product_id: productId,
                    size: size || '',
                    quantity
                })
            if (error) throw error
        }

        revalidateTag('cart', '')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function updateCartItem(id: string, quantity: number): Promise<ActionResponse> {
    try {
        const client = await getAuthClient()
        const { error } = await client
            .from('cart')
            .update({ quantity })
            .eq('id', id)

        if (error) throw error
        revalidateTag('cart', '')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function removeFromCart(id: string): Promise<ActionResponse> {
    try {
        const client = await getAuthClient()
        const { error } = await client
            .from('cart')
            .delete()
            .eq('id', id)

        if (error) throw error
        revalidateTag('cart', '')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
