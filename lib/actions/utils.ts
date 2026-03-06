import { cache } from 'react'
import { headers } from 'next/headers'
import { unstable_cache, revalidateTag } from 'next/cache'
import { get } from '@vercel/edge-config'
import {
    createSupabaseServerClient,
    createSupabasePublicClient,
    createSupabaseAdminClient
} from '@/lib/supabase-server'

export {
    createSupabaseServerClient,
    createSupabasePublicClient,
    createSupabaseAdminClient
}

import { GlobalConfig, ActionResponse } from './types'

// Server-side Supabase client for static/public data (safe for unstable_cache)
export const supabaseServer = createSupabasePublicClient()

// Helper to get authenticated supabaseServer client
const _getAuthClient = cache(async () => {
    return createSupabaseServerClient()
})

export async function getAuthClient() {
    return _getAuthClient()
}

// Helper to get client ID for rate limiting
export async function getClientIdentifier() {
    const head = await headers()
    return head.get('x-forwarded-for')?.split(',')[0] || head.get('x-real-ip') || 'anonymous'
}

// =====================================================
// IN-MEMORY LOOKUP CACHE (eliminates N+1 DB patterns)
// =====================================================
interface CacheEntry<T> { value: T; expiresAt: number }
const _lookupCache = new Map<string, CacheEntry<any>>()
const LOOKUP_TTL_MS = 10 * 60 * 1000 // 10 minutes

export function _cacheGet<T>(key: string): T | null {
    const entry = _lookupCache.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
        _lookupCache.delete(key)
        return null
    }
    return entry.value as T
}

export function _cacheSet<T>(key: string, value: T): void {
    // Prevent unbounded growth — max 200 entries
    if (_lookupCache.size >= 200) {
        const firstKey = _lookupCache.keys().next().value
        if (firstKey) _lookupCache.delete(firstKey)
    }
    _lookupCache.set(key, { value, expiresAt: Date.now() + LOOKUP_TTL_MS })
}

/**
 * Generic TTL Cache for server actions (In-Memory)
 */
export async function getCached<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const now = Date.now()
    const cached = _lookupCache.get(key)
    if (cached && cached.expiresAt > now) return Promise.resolve(cached.value as T)
    return fetcher().then(data => {
        _lookupCache.set(key, { value: data, expiresAt: now + ttlSeconds * 1000 })
        return data
    })
}

// =====================================================
// SECURITY & CONFIG HELPERS
// =====================================================

const _checkAdminStatus = unstable_cache(
    async (userId: string) => {
        try {
            // Use admin client to bypass RLS for this specific system check
            const adminClient = await createSupabaseAdminClient()
            const { data, error } = await adminClient
                .from('admin_users')
                .select('id')
                .eq('id', userId)
                .maybeSingle()

            if (error) {
                console.error('[SECURITY] Admin check error:', error)
                return false
            }
            return !!data
        } catch (err) {
            console.error('[SECURITY] Admin check exception:', err)
            return false
        }
    },
    ['admin-status-check'],
    { revalidate: 1800, tags: ['admin-auth'] } // 30 minute cache
)

export async function checkIsAdmin() {
    try {
        const client = await getAuthClient()
        const { data: { user } } = await client.auth.getUser()
        if (!user) return false

        // Fetch from persistent server cache
        const isAdmin = await _checkAdminStatus(user.id)

        // SYNC Hint to Cookie so getProfile can stay "Lazy"
        try {
            const cookieStore = await headers() // Read-only but we can see context
            // Note: We can't set cookies in read-only headers() call easily in some Next.js versions
            // but for verify routes we usually have access to the full Response cookie setter.
            // For now, the next getProfile call will naturally pick it up and sync it.
        } catch (e) { }

        return isAdmin
    } catch (err: any) {
        // ... (rest of function unchanged)
        const errorMsg = err.message || ''
        if (
            errorMsg.includes('Refresh Token Not Found') ||
            errorMsg.includes('Refresh Token Already Used') ||
            errorMsg.includes('Auth session missing')
        ) {
            return false
        }
        console.error('Error in checkIsAdmin shell:', err)
        return false
    }
}

export async function checkActionRateLimit(identifier: string, action: string, max: number, window: number) {
    try {
        const adminClient = await createSupabaseAdminClient()
        const { data, error } = await adminClient.rpc('check_rate_limit', {
            p_identifier: identifier,
            p_action: action,
            p_max_count: max,
            p_window_minutes: window
        })
        if (error) {
            console.error('[SECURITY] Rate limit RPC error:', error)
            return true // Fail open
        }
        return !!data
    } catch (e) {
        return true
    }
}

/**
 * Fetches a dynamic setting from the site_settings table with Next.js caching.
 */
export async function getSiteSetting<T>(key: string, defaultValue: T): Promise<T> {
    try {
        if (process.env.EDGE_CONFIG) {
            const edgeValue = await get(key)
            if (edgeValue !== undefined) return edgeValue as T
        }
    } catch (e) { /* Fallback */ }

    return unstable_cache(
        async () => {
            try {
                const queryPromise = supabaseServer
                    .from('site_settings')
                    .select('value')
                    .eq('key', key)
                    .maybeSingle()

                const result = await Promise.race([
                    queryPromise,
                    new Promise<any>((_, reject) =>
                        setTimeout(() => reject(new Error('Setting fetch timeout')), 3000)
                    )
                ])

                const { data, error } = result
                if (error || !data) return defaultValue
                return data.value as T
            } catch (err: any) {
                return defaultValue
            }
        },
        [`setting-${key}`],
        { revalidate: 3600, tags: [`setting:${key}`, 'settings'] }
    )()
}

const DEFAULT_CONFIG: GlobalConfig = {
    packaging_cost: 50,
    platform_fee_pct: 5,
    margin_percent: 30,
    making_plain_pct: 18,
    making_designer_pct: 28,
    making_handcrafted_pct: 38,
    ring_base_price_size16: 1699,
    tax_percent: 3.0,
    shipping_cost: 0,
}

export async function getGlobalConfig(): Promise<GlobalConfig> {
    try {
        if (process.env.EDGE_CONFIG) {
            const edgeConfig = await get('global_config')
            if (edgeConfig) return edgeConfig as unknown as GlobalConfig
        }
    } catch (e) { /* Fallback */ }

    return unstable_cache(
        async () => {
            try {
                const { data, error } = await supabaseServer
                    .from('global_config')
                    .select('key, value')

                if (error || !data) return DEFAULT_CONFIG

                const config = { ...DEFAULT_CONFIG }
                data.forEach((row: any) => {
                    if (row.key in config) {
                        (config as any)[row.key] = Number(row.value)
                    }
                })
                return config
            } catch {
                return DEFAULT_CONFIG
            }
        },
        ['global-config'],
        { revalidate: 86400, tags: ['settings', 'config'] }
    )()
}

export async function updateGlobalConfig(key: string, value: number): Promise<ActionResponse> {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return { success: false, error: 'Unauthorized' }

    try {
        const { error } = await supabaseServer
            .from('global_config')
            .upsert({ key, value }, { onConflict: 'key' })

        if (error) throw error
        revalidateTag('config', 'max')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

// =====================================================
// PRICING & METALS SYNCHRONIZATION
// =====================================================

// Semaphore to prevent multiple background syncs in a single instance
let _isSyncingGold = false
let _lastSyncAttempt = 0
const SYNC_RETRY_DELAY = 300000 // 5 minutes

export async function getGoldRates() {
    return unstable_cache(
        async () => {
            try {
                const { data, error } = await supabaseServer
                    .from('gold_rates')
                    .select('purity, rate, updated_at')

                if (error) throw error;

                const ratesObj: Record<string, number> = {}
                let lastUpdatedValue: number = 0

                if (data) {
                    data.forEach((item: any) => {
                        ratesObj[item.purity] = item.rate
                        if (item.updated_at) {
                            const updatedTime = new Date(item.updated_at).getTime()
                            if (updatedTime > lastUpdatedValue) {
                                lastUpdatedValue = updatedTime
                            }
                        }
                    })
                }

                const lastUpdated = lastUpdatedValue > 0 ? new Date(lastUpdatedValue).toISOString() : null

                return { rates: ratesObj, lastUpdated }
            } catch (err) {
                console.error('Error in getGoldRates:', err)
                return null
            }
        },
        ['gold-rates'],
        {
            revalidate: 86400, // 24 hours - Rely on background sync for freshness
            tags: ['rates']
        }
    )()
}

export async function forceSyncGoldRates() {
    const result = await syncLiveGoldRates();
    revalidateTag('gold-rates', 'max')
    return result;
}

async function _upsertGoldRate(purity: string, rate: number) {
    const { createClient } = await import('@supabase/supabase-js')
    const serviceClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await serviceClient
        .from('gold_rates')
        .upsert({ purity, rate, updated_at: new Date().toISOString() }, { onConflict: 'purity' })

    if (error) {
        console.error(`[DB ERROR] Error updating gold rate for ${purity}:`, error)
        return { success: false, error: error.message }
    }
    return { success: true }
}

export async function syncLiveGoldRates() {
    const apiKey = process.env.GOLD_API_KEY
    if (!apiKey || apiKey === 'YOUR_GOLD_API_KEY') {
        return { success: false, error: 'Gold API Key not configured' }
    }

    const goldMult = parseFloat(process.env.GOLD_PRICE_MULTIPLIER || '1.0')
    const silverMult = parseFloat(process.env.SILVER_PRICE_MULTIPLIER || '1.0')
    const goldMarkup = parseFloat(process.env.GOLD_LOCAL_MARKUP_PERCENT || '5.0')
    const silverMarkup = parseFloat(process.env.SILVER_LOCAL_MARKUP_PERCENT || '3.0')

    const goldFactor = (1 + (goldMarkup / 100)) * goldMult
    const silverFactor = (1 + (silverMarkup / 100)) * silverMult

    try {
        const results: Record<string, number> = {}

        // 1. Fetch Gold (XAU)
        const goldRes = await fetch('https://www.goldapi.io/api/XAU/INR', {
            headers: { 'x-access-token': apiKey, 'Content-Type': 'application/json' },
            next: { revalidate: 3600 }
        })

        if (goldRes.ok) {
            const data = await goldRes.json()
            if (data.price_gram_24k) {
                const calibratedPrice = data.price_gram_24k * goldFactor
                const goldCarats: Record<string, number> = {
                    '24K': 1.0, '22K': 22 / 24, '21K': 21 / 24, '20K': 20 / 24,
                    '18K': 18 / 24, '14K': 14 / 24, '10K': 10 / 24, '9K': 9 / 24,
                }
                for (const [carat, factor] of Object.entries(goldCarats)) {
                    const rate = Math.round(calibratedPrice * factor)
                    await _upsertGoldRate(carat, rate)
                    results[carat] = rate
                }
            }
        }

        // 2. Fetch Silver (XAG)
        const silverRes = await fetch('https://www.goldapi.io/api/XAG/INR', {
            headers: { 'x-access-token': apiKey, 'Content-Type': 'application/json' },
            next: { revalidate: 3600 }
        })
        if (silverRes.ok) {
            const data = await silverRes.json()
            if (data && data.price_gram_24k) {
                const calibratedPrice = data.price_gram_24k * silverFactor
                const silverPurities: Record<string, number> = {
                    'Silver 999': 1.0, 'Silver 99.99': 0.9999, 'Silver 925': 0.925,
                }
                for (const [label, factor] of Object.entries(silverPurities)) {
                    const rate = Math.round(calibratedPrice * factor)
                    await _upsertGoldRate(label, rate)
                    results[label] = rate
                }
            }
        }

        // revalidateTag is a dynamic action and can't be called inside certain contexts (like unstable_cache sync)
        // Since this is a background sync and results are written to DB, 
        // they will naturally be picked up on the next cache revalidation.
        // revalidateTag('gold-rates')

        return { success: true, rates: results }
    } catch (err: any) {
        console.error('Multi-Metal Sync Error:', err)
        return { success: false, error: err.message }
    }
}

export async function subscribeNewsletter(email: string): Promise<ActionResponse> {
    if (!email || !email.includes('@')) return { success: false, error: 'Invalid email' }
    try {
        const adminClient = createSupabaseAdminClient()
        const { error } = await adminClient
            .from('newsletter_subscribers')
            .upsert({ email }, { onConflict: 'email' })
        if (error) throw error
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

