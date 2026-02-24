'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { checkAdminRole } from '../actions'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

async function getAuthClient() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

export async function clearCache(type: 'path' | 'tag' | 'all', value?: string) {
    const admin = await checkAdminRole()
    if (!admin) return { success: false, error: 'Unauthorized' }

    try {
        if (type === 'all') {
            revalidatePath('/', 'layout')
            return { success: true, message: 'Entire site cache cleared' }
        }
        if (type === 'path' && value) {
            revalidatePath(value)
            return { success: true, message: `Path ${value} revalidated` }
        }
        if (type === 'tag' && value) {
            revalidateTag(value)
            return { success: true, message: `Tag ${value} revalidated` }
        }
        return { success: false, error: 'Invalid parameters' }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function getSystemHealth() {
    const admin = await checkAdminRole()
    if (!admin) return null

    const startTime = performance.now()
    const client = await getAuthClient()

    // Check DB connection and latency
    const { error } = await client.from('profiles').select('id').limit(1)
    const endTime = performance.now()
    const latency = Math.round(endTime - startTime)

    return {
        status: error ? 'issues' : 'healthy',
        latency,
        error: error?.message,
        timestamp: new Date().toISOString()
    }
}

export async function getDatabaseStats() {
    const admin = await checkAdminRole()
    if (!admin) return null

    const client = await getAuthClient()

    // Parallel fetch counts
    const [orders, users, products, reviews, contacts] = await Promise.all([
        client.from('orders').select('id', { count: 'exact', head: true }),
        client.from('profiles').select('id', { count: 'exact', head: true }),
        client.from('products').select('id', { count: 'exact', head: true }),
        client.from('reviews').select('id', { count: 'exact', head: true }).then(res => res.error ? { count: 0 } : res),
        client.from('contact_messages').select('id', { count: 'exact', head: true }).then(res => res.error ? { count: 0 } : res),
    ])

    return {
        orders: orders.count || 0,
        users: users.count || 0,
        products: products.count || 0,
        reviews: reviews.count || 0,
        contacts: contacts.count || 0
    }
}
