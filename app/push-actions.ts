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
        badge: '/Favicon.ico'
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

    // Optionally cleanup failed subscriptions (expired tokens)
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

export async function notifyNewProduct(name: string, slug: string) {
    return sendNotification(
        'New Masterpiece Added',
        `The ${name} has just arrived in our collection. Explore it now.`,
        `/products/${slug}`
    )
}
