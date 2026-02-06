'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import webpush from 'web-push'

// Initialize web-push with VAPID keys
// Note: In a real environment, these should be in .env
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:admin@aurerxa.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    )
}

async function getSupabase() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                },
            },
        }
    )
}

export async function saveSubscription(subscription: any) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
            user_id: user?.id || null,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
        }, { onConflict: 'endpoint' })

    if (error) {
        console.error('Save subscription error:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

export async function sendNotification(title: string, body: string, url: string = '/') {
    const supabase = await getSupabase()
    const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('*')

    if (error) {
        console.error('Fetch subscriptions error:', error)
        return { success: false, error: error.message }
    }

    const payload = JSON.stringify({
        title,
        body,
        url,
        icon: '/logo.png',
        badge: '/Favicon.ico',
        image: url.includes('/products/') ? '/logo.png' : undefined, // Placeholder for rich image if needed
    })

    const results = await Promise.allSettled(
        subscriptions.map((sub) => {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            }
            return webpush.sendNotification(pushConfig, payload)
        })
    )

    // Cleanup failed subscriptions (expired tokens)
    const failedIndices = results
        .map((res, i) => (res.status === 'rejected' ? i : -1))
        .filter((i) => i !== -1)

    if (failedIndices.length > 0) {
        const endpointsToDelete = failedIndices.map(i => subscriptions[i].endpoint)
        await supabase
            .from('push_subscriptions')
            .delete()
            .in('endpoint', endpointsToDelete)
    }

    return { success: true, count: results.length - failedIndices.length }
}

export async function notifyNewProduct(name: string, slug: string, imageUrl?: string) {
    return sendNotification(
        'New Masterpiece Added',
        `The ${name} has just arrived in our collection. Explore it now.`,
        `/products/${slug}`
    )
}

export async function notifyOrderStatusChange(userId: string, orderNumber: string, status: string) {
    const supabase = await getSupabase()
    const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId)

    if (!subscriptions || subscriptions.length === 0) return { success: false, error: 'No subscriptions found' }

    const statusMessages: Record<string, string> = {
        'shipped': `Great news! Your order ${orderNumber} has been shipped.`,
        'delivered': `Success! Your order ${orderNumber} has been delivered.`,
        'cancelled': `Your order ${orderNumber} has been cancelled.`,
    }

    const body = statusMessages[status.toLowerCase()] || `The status of your order ${orderNumber} has been updated to ${status}.`

    const payload = JSON.stringify({
        title: 'Order Update',
        body,
        url: `/account/orders`,
        icon: '/logo.png',
    })

    const results = await Promise.allSettled(
        subscriptions.map((sub) => {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            }
            return webpush.sendNotification(pushConfig, payload)
        })
    )

    return { success: true }
}

export async function broadcastOffer(title: string, body: string, url: string, imageUrl?: string) {
    return sendNotification(title, body, url)
}

export async function notifyAbandonedCart(userId: string, productName: string, productSlug: string, productImage: string) {
    const supabase = await getSupabase()
    const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId)

    if (!subscriptions || subscriptions.length === 0) return { success: false }

    const payload = JSON.stringify({
        title: 'Forgot something?',
        body: `The ${productName} is still waiting in your cart. Complete your purchase now.`,
        url: `/cart`,
        icon: '/logo.png',
        image: productImage || '/logo.png',
    })

    await Promise.allSettled(
        subscriptions.map((sub) => {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            }
            return webpush.sendNotification(pushConfig, payload)
        })
    )

    return { success: true }
}
