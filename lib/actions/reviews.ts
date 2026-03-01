'use server'

import { revalidateTag } from 'next/cache'
import { supabaseServer, getAuthClient, getClientIdentifier, checkActionRateLimit } from './utils'
import { ActionResponse } from './types'
import { z } from 'zod'
import { sanitize } from '@/lib/sanitizer'

const ReviewSchema = z.object({
    productId: z.string().uuid(),
    rating: z.number().min(1).max(5),
    comment: z.string().max(1000).optional(),
    images: z.array(z.string().url()).max(5).optional(),
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().max(50).optional(),
    email: z.string().email().optional(),
})

export async function getProductReviews(productId: string) {
    const { data: reviews, error: reviewError } = await supabaseServer
        .from('product_reviews')
        .select('id, rating, comment, images, is_verified, created_at, user_id, guest_name')
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

    if (reviewError) {
        console.error('❌ Error fetching reviews:', reviewError)
        return []
    }

    if (!reviews || reviews.length === 0) return []

    const userIds = Array.from(new Set(reviews.map(r => r.user_id).filter(Boolean)))
    let profilesMap: Record<string, { full_name: string }> = {}

    if (userIds.length > 0) {
        const { data: profiles, error: profileError } = await supabaseServer
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds)

        if (!profileError && profiles) {
            profiles.forEach(p => {
                profilesMap[p.id] = { full_name: p.full_name }
            })
        }
    }

    return reviews.map(r => ({
        ...r,
        profiles: r.user_id && profilesMap[r.user_id]
            ? profilesMap[r.user_id]
            : r.guest_name
                ? { full_name: r.guest_name }
                : null
    }))
}

export async function getReviewStats(productId: string) {
    const { data, error } = await supabaseServer
        .from('product_reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('status', 'approved')

    if (error || !data) {
        return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    }

    const total = data.length
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0)
    const average = total > 0 ? Number((sum / total).toFixed(1)) : 0

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    data.forEach(r => {
        distribution[r.rating as keyof typeof distribution]++
    })

    return { average, total, distribution }
}

export async function submitReview(formData: FormData): Promise<ActionResponse> {
    const clientId = await getClientIdentifier()
    const isAllowed = await checkActionRateLimit(clientId, 'submit_review', 3, 30)
    if (!isAllowed) return { success: false, error: 'Too many review attempts. Please try again later.' }

    try {
        const rawData = {
            productId: formData.get('productId') as string,
            rating: parseInt(formData.get('rating') as string),
            comment: formData.get('comment') as string,
            images: JSON.parse(formData.get('images') as string || '[]'),
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            email: formData.get('email') as string,
        }

        const validated = ReviewSchema.safeParse(rawData)
        if (!validated.success) {
            return { success: false, error: 'Invalid review: ' + validated.error.errors[0].message }
        }

        const { productId, rating, comment, images, firstName, lastName, email } = validated.data

        let userId: string | null = null
        try {
            const client = await getAuthClient()
            const { data: { user } } = await client.auth.getUser()
            if (user) userId = user.id
        } catch { }

        if (!userId && (!firstName || !email)) {
            return { success: false, error: 'Name and email are required for guest reviews' }
        }

        const guestName = lastName ? `${firstName} ${lastName.charAt(0)}.` : firstName

        const { error } = await supabaseServer
            .from('product_reviews')
            .insert({
                product_id: productId,
                user_id: userId,
                guest_name: userId ? null : guestName,
                guest_email: userId ? null : email,
                rating,
                comment: sanitize(comment || ''),
                images: images || [],
                status: 'approved',
                created_at: new Date().toISOString()
            })

        if (error) return { success: false, error: error.message }

        revalidateTag('reviews')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message || 'Internal server error' }
    }
}

export async function uploadReviewImage(base64: string, productId: string): Promise<ActionResponse<string>> {
    try {
        if (base64.length > 500_000) {
            return { success: false, error: 'Image too large. Please use a smaller image.' }
        }

        const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')
        const fileName = `${productId}/guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`

        const { error } = await supabaseServer.storage
            .from('review')
            .upload(fileName, buffer, {
                contentType: 'image/webp',
                upsert: true
            })

        if (error) return { success: false, error: error.message }

        const { data: { publicUrl } } = supabaseServer.storage
            .from('review')
            .getPublicUrl(fileName)

        return { success: true, data: publicUrl }
    } catch (err: any) {
        return { success: false, error: err.message || 'Internal server error' }
    }
}
