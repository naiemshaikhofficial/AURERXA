'use server'

import { cookies } from 'next/headers'
import { getAuthClient, getCached } from './utils'
import { ActionResponse } from './types'

export async function getProfile() {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return null

    return getCached(`user:profile:${user.id}`, 60, async () => {
        // 1. Fetch profile basics
        const { data: profile, error: profileErr } = await client
            .from('profiles')
            .select('id, full_name, phone_number, avatar_url, is_banned')
            .eq('id', user.id)
            .single()

        if (profileErr) {
            console.error('Error fetching profile:', profileErr)
            return null
        }

        // 2. Fetch role from admin_users ONLY if needed (Lazy Detection)
        // Check if we have an admin hint in the status cache
        let isAdmin = false
        try {
            const cookieStore = await cookies()
            const statusCache = cookieStore.get('ua-status-cache')?.value
            if (statusCache) {
                const parsed = JSON.parse(decodeURIComponent(statusCache))
                // If cache says they are NOT an admin, we skip the DB hit entirely
                if (parsed.isAdmin === false) {
                    isAdmin = false
                } else {
                    // If they are an admin or unknown, we do the real check
                    const { data: adminData } = await client
                        .from('admin_users')
                        .select('role')
                        .eq('id', user.id)
                        .single()
                    isAdmin = adminData?.role === 'admin'
                }
            } else {
                // No cache? Do the check
                const { data: adminData } = await client
                    .from('admin_users')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                isAdmin = adminData?.role === 'admin'
            }
        } catch (e) {
            // Fallback for cookie parsing issues
            const { data: adminData } = await client
                .from('admin_users')
                .select('role')
                .eq('id', user.id)
                .single()
            isAdmin = adminData?.role === 'admin'
        }

        const role = isAdmin ? 'admin' : 'user'

        const profileData = {
            id: user.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            role,
            email: user.email,
            isAdmin: role === 'admin',
            isBanned: profile.is_banned === true
        }

        // SET Status Cache Cookie for instant client-side hydration (expires in 7 days)
        try {
            const cookieStore = await cookies()
            const statusCache = JSON.stringify({
                id: profile.id,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                isAdmin: role === 'admin'
            })
            cookieStore.set('ua-status-cache', statusCache, {
                maxAge: 7 * 24 * 60 * 60,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            })
        } catch (e) { /* Headers already sent or not available in some contexts */ }

        return profileData
    })
}

export async function updateProfile(profileData: {
    full_name?: string
    phone_number?: string
    avatar_url?: string
}) {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { success: false }

    const { error } = await client
        .from('profiles')
        .update({ ...profileData, updated_at: new Date().toISOString() })
        .eq('id', user.id)

    if (error) return { success: false, error: 'Failed to update profile' }

    // Proactively refresh the status cache cookie to reflect changes immediately
    try {
        const { data: profile } = await client.from('profiles').select('full_name, avatar_url').eq('id', user.id).single()
        const { data: adminData } = await client.from('admin_users').select('role').eq('id', user.id).single()

        if (profile) {
            const cookieStore = await cookies()
            const statusCache = JSON.stringify({
                id: user.id,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                isAdmin: adminData?.role === 'admin'
            })
            cookieStore.set('ua-status-cache', statusCache, {
                maxAge: 7 * 24 * 60 * 60,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            })
        }
    } catch (e) {
        // Failing to update cookie is non-fatal
    }

    return { success: true }
}

export async function signOutAction() {
    try {
        const client = await getAuthClient()
        await client.auth.signOut()

        const cookieStore = await cookies()
        const allCookies = cookieStore.getAll()

        allCookies.forEach(cookie => {
            const name = cookie.name.toLowerCase()
            if (
                name.includes('auth') ||
                name.includes('supabase') ||
                name.startsWith('sb-') ||
                name === 'ua-status-cache' ||
                name.includes('session') ||
                name.includes('token')
            ) {
                cookieStore.set(cookie.name, '', { maxAge: 0, path: '/' })
                cookieStore.delete(cookie.name)
            }
        })

        cookieStore.delete('supabase-auth-token')
        cookieStore.set('ua-status-cache', '', { maxAge: 0, path: '/' })
        cookieStore.delete('ua-status-cache')

        return { success: true }
    } catch (err: any) {
        console.error('Crash in signOutAction:', err)
        return { success: false, error: err.message || 'Internal server error' }
    }
}
export async function getAddresses() {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return []

    const { data, error } = await client
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching addresses:', error)
        return []
    }
    return data
}

const sanitizeAddress = (address: any) => {
    // Remove fields that don't exist in Supabase and 'id' to prevent conflicts
    const { address_line1, address_line2, landmark, country, id, ...rest } = address
    return rest
}

export async function addAddress(address: any) {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    if (address.is_default) {
        await client.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    }

    const sanitized = sanitizeAddress(address)
    const { data, error } = await client
        .from('addresses')
        .insert({ ...sanitized, user_id: user.id })
        .select()
        .single()

    if (error) return { success: false, error: error.message }
    return { success: true, data }
}

export async function updateAddress(id: string, address: any) {
    // Prevent temp IDs from causing UUID syntax errors in Supabase
    if (!id || id.startsWith('temp_')) {
        return { success: false, error: 'Cannot update unsaved address. Please wait a moment.' }
    }

    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    if (address.is_default) {
        await client.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    }

    const sanitized = sanitizeAddress(address)
    const { error } = await client
        .from('addresses')
        .update(sanitized)
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function deleteAddress(id: string) {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await client
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function setDefaultAddress(id: string) {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    await client.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    const { error } = await client.from('addresses').update({ is_default: true }).eq('id', id).eq('user_id', user.id)

    if (error) return { success: false, error: error.message }
    return { success: true }
}
