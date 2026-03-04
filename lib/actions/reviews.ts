'use server'

import { supabaseServer, getAuthClient, checkIsAdmin } from './utils'
import { ActionResponse } from './types'
import { ReviewSchema } from './schemas'
import { z } from 'zod'

export async function getProductReviews(productId: string) {
    const { data, error } = await supabaseServer
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

    if (error) return []
    return data
}

export async function getReviewStats(productId: string) {
    const { data, error } = await supabaseServer.rpc('get_review_stats', { p_id: productId })
    if (error) return { average: 0, total: 0 } // Changed count to total as per component usage
    return data
}

export async function submitReview(formData: FormData): Promise<ActionResponse> {
    try {
        const client = await getAuthClient()
        const { data: { user } } = await client.auth.getUser()
        if (!user) return { success: false, error: 'Auth required' }

        const firstName = formData.get('firstName') as string || ''
        const lastName = formData.get('lastName') as string || ''

        const { error } = await client.from('product_reviews').insert({
            user_id: user.id,
            product_id: formData.get('productId'),
            rating: Number(formData.get('rating')),
            comment: formData.get('comment'),
            images: JSON.parse(formData.get('images') as string || '[]'),
            guest_name: `${firstName} ${lastName}`.trim(),
            guest_email: formData.get('email'),
            status: 'approved',
            created_at: new Date().toISOString()
        })

        if (error) return { success: false, error: error.message }
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function uploadReviewImage(base64: string, productId: string) {
    try {
        if (!base64) return { success: false, error: 'No data' }

        const { put } = await import('@vercel/blob')
        // Convert base64 to Buffer
        const buffer = Buffer.from(base64.split(',')[1], 'base64')

        const blob = await put(`reviews/${productId}/${Date.now()}.webp`, buffer, {
            access: 'public',
            contentType: 'image/webp'
        })

        return { success: true, data: blob.url }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
