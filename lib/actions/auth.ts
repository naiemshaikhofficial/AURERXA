'use server'

import { cookies } from 'next/headers'
import { getAuthClient, getCached } from './utils'
import { ActionResponse } from './types'

export async function getProfile() {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return null

    return getCached(`user:profile:${user.id}`, 60, async () => {
        const { data, error } = await client
            .from('profiles')
            .select('id, full_name, phone_number, avatar_url')
            .eq('id', user.id)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
            return null
        }
        return { ...data, email: user.email }
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
