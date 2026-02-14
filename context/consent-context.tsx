'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { upsertVisitorIntelligence } from '@/app/actions'

type ConsentStatus = 'undecided' | 'granted' | 'denied'

interface UserDetails {
    name?: string
    email?: string
    phone?: string
}

interface ConsentContextType {
    consentStatus: ConsentStatus
    userDetails: UserDetails
    sessionId: string | null
    setConsent: (status: ConsentStatus) => void
    updateUserDetails: (details: UserDetails) => void
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined)

export function ConsentProvider({
    children,
    initialProfile
}: {
    children: React.ReactNode,
    initialProfile?: UserDetails | null
}) {
    const [consentStatus, setConsentStatus] = useState<ConsentStatus>('undecided')
    const [userDetails, setUserDetails] = useState<UserDetails>({})
    const [sessionId, setSessionId] = useState<string | null>(null)

    // Helper to sync to DB
    const syncToDB = useCallback(async (status: ConsentStatus, details: UserDetails, sid: string) => {
        if (status !== 'granted') return;

        // Capture device context (Legal extreme)
        const deviceInfo = {
            ua: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            platform: (navigator as any).platform || 'unknown'
        }

        await upsertVisitorIntelligence({
            sessionId: sid,
            identityData: details,
            deviceInfo,
            marketingInfo: {
                referral: document.referrer,
                landing_page: window.location.pathname
            },
            consentData: {
                status,
                timestamp: new Date().toISOString()
            }
        })
    }, [])

    // Initialize from cookies
    useEffect(() => {
        const cookiesStr = document.cookie.split('; ')
        const consentCookie = cookiesStr.find(row => row.startsWith('ua-consent='))
        const detailsCookie = cookiesStr.find(row => row.startsWith('ua-personalization='))
        const sessionCookie = cookiesStr.find(row => row.startsWith('ua-sid='))

        let status: ConsentStatus = 'undecided'
        if (consentCookie) {
            status = consentCookie.split('=')[1] as ConsentStatus
            setConsentStatus(status)
        }

        let currentDetails: UserDetails = {}
        if (detailsCookie) {
            try {
                currentDetails = JSON.parse(decodeURIComponent(detailsCookie.split('=')[1]))
                setUserDetails(currentDetails)
            } catch (e) {
                console.error('Failed to parse personalization cookie')
            }
        }

        let sid = ''
        if (sessionCookie) {
            sid = sessionCookie.split('=')[1]
        } else {
            sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
            document.cookie = `ua-sid=${sid}; path=/; max-age=${2 * 365 * 24 * 60 * 60}; SameSite=Lax`
        }
        setSessionId(sid)

        // Overwrite/Sync with initialProfile if granted
        if (initialProfile && status === 'granted') {
            const syncedDetails = { ...initialProfile, ...currentDetails }
            setUserDetails(syncedDetails)
            syncToDB(status, syncedDetails, sid)
        } else if (status === 'granted') {
            syncToDB(status, currentDetails, sid)
        }
    }, [initialProfile, syncToDB])

    const setConsent = (status: ConsentStatus) => {
        setConsentStatus(status)
        // Set cookie for 1 year
        document.cookie = `ua-consent=${status}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`

        if (status === 'granted' && sessionId) {
            syncToDB(status, userDetails, sessionId)
        }

        // If denied, clear personalization
        if (status === 'denied') {
            document.cookie = 'ua-personalization=; path=/; max-age=0'
            setUserDetails({})
        }
    }

    const updateUserDetails = (details: UserDetails) => {
        const newDetails = { ...userDetails, ...details }
        setUserDetails(newDetails)

        if (consentStatus === 'granted') {
            document.cookie = `ua-personalization=${encodeURIComponent(JSON.stringify(newDetails))}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
            if (sessionId) syncToDB(consentStatus, newDetails, sessionId)
        }
    }

    return (
        <ConsentContext.Provider value={{ consentStatus, userDetails, sessionId, setConsent, updateUserDetails }}>
            {children}
        </ConsentContext.Provider>
    )
}

export function useConsent() {
    const context = useContext(ConsentContext)
    if (context === undefined) {
        throw new Error('useConsent must be used within a ConsentProvider')
    }
    return context
}
