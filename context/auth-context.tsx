'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export interface AuthProfile {
    id: string
    full_name?: string
    email?: string
    phone?: string
    isBanned?: boolean
    isAdmin?: boolean
}

interface AuthContextType {
    user: User | null
    profile: AuthProfile | null
    isAdmin: boolean
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({
    children,
    initialProfile
}: {
    children: React.ReactNode
    initialProfile?: AuthProfile | null
}) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<AuthProfile | null>(initialProfile || null)
    const [isAdmin, setIsAdmin] = useState<boolean>(initialProfile?.isAdmin || false)
    const [loading, setLoading] = useState(initialProfile === undefined)

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                const currentUser = session?.user || null
                setUser(currentUser)

                if (currentUser) {
                    const [profileRes, adminRes] = await Promise.all([
                        supabase.from('profiles').select('id, full_name, email, phone_number, is_banned').eq('id', currentUser.id).maybeSingle(),
                        supabase.from('admin_users').select('role').eq('id', currentUser.id).maybeSingle()
                    ])

                    if (profileRes.data) {
                        setProfile({
                            id: currentUser.id,
                            full_name: profileRes.data.full_name,
                            email: profileRes.data.email,
                            phone: profileRes.data.phone_number,
                            isBanned: !!profileRes.data.is_banned,
                            isAdmin: !!adminRes.data
                        })
                    } else {
                        // Fallback if profile doesn't exist yet but user is logged in
                        setProfile({
                            id: currentUser.id,
                            email: currentUser.email,
                            full_name: currentUser.user_metadata?.full_name || currentUser.email,
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

        if (!initialProfile) {
            initAuth()
        } else {
            // Pre-fill user from session if available without full re-fetch
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
                    const [profileRes, adminRes] = await Promise.all([
                        supabase.from('profiles').select('id, full_name, email, phone_number, is_banned').eq('id', currentUser.id).maybeSingle(),
                        supabase.from('admin_users').select('role').eq('id', currentUser.id).maybeSingle()
                    ])
                    if (profileRes.data) {
                        setProfile({
                            id: currentUser.id,
                            full_name: profileRes.data.full_name,
                            email: profileRes.data.email,
                            phone: profileRes.data.phone_number,
                            isBanned: !!profileRes.data.is_banned,
                            isAdmin: !!adminRes.data
                        })
                    } else {
                        setProfile({
                            id: currentUser.id,
                            email: currentUser.email,
                            full_name: currentUser.user_metadata?.full_name || currentUser.email,
                            isAdmin: !!adminRes.data
                        })
                    }
                    setIsAdmin(!!adminRes.data)
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null)
                setProfile(null)
                setIsAdmin(false)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [initialProfile])

    const signOut = async () => {
        try {
            setUser(null)
            setProfile(null)
            setIsAdmin(false)

            await supabase.auth.signOut()
            const { signOutAction } = await import('@/app/actions')
            await signOutAction()

            window.location.href = '/'
        } catch (error) {
            console.error('Sign out error:', error)
            window.location.href = '/'
        }
    }

    return (
        <AuthContext.Provider value={{ user, profile, isAdmin, loading, signOut }}>
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
