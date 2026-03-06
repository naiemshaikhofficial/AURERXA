'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export interface AuthProfile {
    id: string
    full_name?: string
    email?: string
    phone?: string
    avatar_url?: string
    isBanned?: boolean
    isAdmin?: boolean
}

interface AuthContextType {
    user: User | null
    profile: AuthProfile | null
    isAdmin: boolean
    loading: boolean
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({
    children,
    initialProfile,
    initialProfilePromise
}: {
    children: React.ReactNode
    initialProfile?: AuthProfile | null
    initialProfilePromise?: Promise<AuthProfile | null>
}) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<AuthProfile | null>(initialProfile || null)
    const [isAdmin, setIsAdmin] = useState<boolean>(initialProfile?.isAdmin || false)
    const [loading, setLoading] = useState(initialProfile === undefined && !initialProfilePromise)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const initAuth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const currentUser = session?.user || null
            setUser(currentUser)

            if (currentUser) {
                const [profileRes, adminRes] = await Promise.all([
                    supabase.from('profiles').select('id, full_name, email, phone_number, avatar_url, is_banned').eq('id', currentUser.id).maybeSingle(),
                    supabase.from('admin_users').select('role').eq('id', currentUser.id).maybeSingle()
                ])

                if (profileRes.data) {
                    const profileData = profileRes.data as any
                    setProfile({
                        id: currentUser.id,
                        full_name: profileData.full_name,
                        email: profileData.email,
                        phone: profileData.phone_number,
                        avatar_url: profileData.avatar_url,
                        isBanned: !!profileData.is_banned,
                        isAdmin: !!adminRes.data
                    })
                } else {
                    setProfile({
                        id: currentUser.id,
                        email: currentUser.email,
                        full_name: currentUser.user_metadata?.full_name || currentUser.email,
                        avatar_url: currentUser.user_metadata?.avatar_url,
                        isAdmin: !!adminRes.data
                    })
                }
                setIsAdmin(!!adminRes.data)
            }
        } catch (error) {
            console.error('Error initializing auth:', error)
        } finally {
            setLoading(false)
        }
    }

    const refreshProfile = async () => {
        try {
            const { getProfile } = await import('@/app/actions')
            const freshProfile: any = await getProfile()
            if (freshProfile) {
                setProfile({
                    id: freshProfile.id,
                    full_name: freshProfile.full_name,
                    email: freshProfile.email,
                    phone: freshProfile.phone,
                    avatar_url: freshProfile.avatar_url,
                    isBanned: freshProfile.isBanned,
                    isAdmin: freshProfile.isAdmin
                })
                setIsAdmin(freshProfile.isAdmin)
            }
        } catch (err) {
            console.error('Error refreshing profile:', err)
        }
    }

    // 1. Instant Hydration from Local Status Cache (Eliminates the 'blank' blink)
    useEffect(() => {
        if (profile || !isMounted) return
        try {
            const cookiesStr = document.cookie.split('; ')
            const statusCookie = cookiesStr.find(row => row.startsWith('ua-status-cache='))
            let cached = null

            if (statusCookie) {
                cached = JSON.parse(decodeURIComponent(statusCookie.split('=')[1]))
            } else {
                const ls = localStorage.getItem('aurerxa-status-cache')
                if (ls) cached = JSON.parse(ls)
            }

            if (cached && cached.id) {
                setProfile(prev => prev || cached)
                setIsAdmin(prev => prev || !!cached.isAdmin)
            }
        } catch (e) { /* Silent fail */ }
    }, [profile, isMounted])

    // Sync profile to localStorage
    useEffect(() => {
        if (profile) {
            localStorage.setItem('aurerxa-status-cache', JSON.stringify({
                id: profile.id,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                isAdmin: !!profile.isAdmin
            }))
        }
    }, [profile])

    useEffect(() => {
        const resolveInitialProfile = async () => {
            try {
                const p = await initialProfilePromise
                if (p) {
                    setProfile(p)
                    setIsAdmin(p.isAdmin || false)
                }
            } catch (err) {
                console.error('Error resolving initial profile promise:', err)
            } finally {
                setLoading(false)
            }
        }

        if (initialProfilePromise) {
            resolveInitialProfile()
        }

        if (!initialProfile && !initialProfilePromise) {
            initAuth()
        } else if (initialProfile) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session?.user) setUser(session.user)
                setLoading(false)
            })
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                const currentUser = session?.user || null
                setUser(currentUser)
                if (currentUser) {
                    await initAuth() // Re-fetch full profile on sign-in or update
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null)
                setProfile(null)
                setIsAdmin(false)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [initialProfile, initialProfilePromise])

    const signOut = async () => {
        try {
            setUser(null)
            setProfile(null)
            setIsAdmin(false)
            try {
                const keysToRemove: string[] = []
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i)
                    if (key && (key.startsWith('aurerxa') || key.startsWith('ua-') || key.startsWith('sb-'))) {
                        keysToRemove.push(key)
                    }
                }
                keysToRemove.forEach(k => localStorage.removeItem(k))
                document.cookie = 'ua-status-cache=; path=/; max-age=0'
            } catch (e) { }

            await supabase.auth.signOut()
            try {
                const { signOutAction } = await import('@/app/actions')
                await signOutAction()
            } catch (e) { }
            window.location.href = '/'
        } catch (error) {
            console.error('Sign out error:', error)
            window.location.href = '/'
        }
    }

    return (
        <AuthContext.Provider value={{ user, profile, isAdmin, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
