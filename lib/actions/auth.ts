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

        // 2. Fetch role from admin_users (if exists)
        const { data: adminData } = await client
            .from('admin_users')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = adminData?.role || 'user'

        return {
            ...profile,
            role,
            email: user.email,
            isAdmin: role === 'admin',
            isBanned: profile.is_banned === true
        }
    })
}

export async function updateProfile(profileData: {
    full_name?: string
    phone_number?: string
}) {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { success: false }

    const { error } = await client
        .from('profiles')
        .update({ ...profileData, updated_at: new Date().toISOString() })
        .eq('id', user.id)

    if (error) return { success: false, error: 'Failed to update profile' }
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
