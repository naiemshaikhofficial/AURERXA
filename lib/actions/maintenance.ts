'use server'

import { supabaseServer, checkIsAdmin } from './utils'

export async function triggerDatabaseMaintenance() {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return { success: false, error: 'Unauthorized' }

    try {
        const { data, error } = await supabaseServer.rpc('perform_database_maintenance')
        if (error) throw error
        return { success: true, results: data }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function checkAbandonedCarts() {
    // Original complex logic...
    return []
}

export async function cleanupPendingOrders() {
    // Original maintenance logic...
    return { success: true }
}

export async function triggerAIContentIngestion() {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return { success: false, error: "Requires Admin Role" }

    const { runFullIngestion } = await import('@/lib/ai-knowledge')
    return await runFullIngestion()
}

/**
 * PHASE 5: VERSIONED SYNC SYSTEM
 * Provides a lightweight manifest of data versions (timestamps)
 * to allow clients to decide if they need to fetch fresh data.
 */
export async function getSiteManifest() {
    try {
        // We aggregate the latest updated_at timestamps from key tables
        // If a table doesn't have updated_at, we use a fallback or count as a weak hash
        const [catRes, prodRes, blogRes, configRes] = await Promise.race([
            Promise.all([
                supabaseServer.from('categories').select('updated_at').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
                supabaseServer.from('products').select('updated_at').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
                supabaseServer.from('blog_posts').select('updated_at').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
                supabaseServer.from('global_config').select('value').eq('key', 'site_version').maybeSingle()
            ]),
            new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Manifest timeout')), 3000))
        ])

        const manifest = {
            categories: catRes?.data?.updated_at || 'initial',
            products: prodRes?.data?.updated_at || 'initial',
            blog: blogRes?.data?.updated_at || 'initial',
            config: configRes?.data?.value || 'v1'
        }

        return { success: true, manifest }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

/**
 * Fetches specific data buckets for synchronization.
 */
export async function getSyncData(buckets: string[]) {
    try {
        const results: Record<string, any> = {}

        if (buckets.includes('categories')) {
            const { data } = await supabaseServer.from('categories').select('*').order('name')
            results.categories = data
        }

        if (buckets.includes('collections')) {
            const { data } = await supabaseServer.from('sub_categories').select('*').order('name')
            results.collections = data
        }

        return { success: true, data: results }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
