'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { upsertVisitorIntelligence } from '@/app/actions'

type ConsentStatus = 'undecided' | 'granted' | 'denied'

interface ConsentPreferences {
    functional: boolean
    statistical: boolean
    personalization: boolean
}

interface UserDetails {
    name?: string
    email?: string
    phone?: string
}

interface ConsentContextType {
    consentStatus: ConsentStatus
    preferences: ConsentPreferences
    userDetails: UserDetails
    sessionId: string | null
    setConsent: (status: ConsentStatus, prefs?: ConsentPreferences) => void
    updateUserDetails: (details: UserDetails) => void
    showPreferenceManager: boolean
    setShowPreferenceManager: (show: boolean) => void
}

const DEFAULT_PREFERENCES: ConsentPreferences = {
    functional: true,
    statistical: true,
    personalization: true
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
    const [preferences, setPreferences] = useState<ConsentPreferences>(DEFAULT_PREFERENCES)
    const [userDetails, setUserDetails] = useState<UserDetails>({})
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [showPreferenceManager, setShowPreferenceManager] = useState(false)

    // Helper to sync to DB
    const syncToDB = useCallback(async (status: ConsentStatus, details: UserDetails, sid: string, prefs: ConsentPreferences) => {
        // Only sync if at least statistical or personalization is granted
        if (!prefs.statistical && !prefs.personalization) return;

        // Capture device context
        const deviceInfo = {
            ua: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            platform: (navigator as any).platform || 'unknown'
        }

        await upsertVisitorIntelligence({
            sessionId: sid,
            identityData: prefs.personalization ? details : {}, // Only sync identity if personalization granted
            deviceInfo,
            marketingInfo: {
                referral: document.referrer,
                landing_page: window.location.pathname
            },
            consentData: {
                status,
                preferences: prefs,
                timestamp: new Date().toISOString()
            }
        })
    }, [])

    // Initialize from cookies
    useEffect(() => {
        const cookiesStr = document.cookie.split('; ')
        const consentCookie = cookiesStr.find(row => row.startsWith('ua-consent='))
        const prefsCookie = cookiesStr.find(row => row.startsWith('ua-preferences='))
        const detailsCookie = cookiesStr.find(row => row.startsWith('ua-personalization='))
        const sessionCookie = cookiesStr.find(row => row.startsWith('ua-sid='))

        let status: ConsentStatus = 'undecided'
        if (consentCookie) {
            status = consentCookie.split('=')[1] as ConsentStatus
            setConsentStatus(status)
        }

        let currentPrefs = DEFAULT_PREFERENCES
        if (prefsCookie) {
            try {
                currentPrefs = JSON.parse(decodeURIComponent(prefsCookie.split('=')[1]))
                setPreferences(currentPrefs)
            } catch (e) {
                console.error('Failed to parse preferences cookie')
            }
        } else if (status === 'granted') {
            // Migration/Default for existing granted users
            currentPrefs = { functional: true, statistical: true, personalization: true }
            setPreferences(currentPrefs)
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

        // Overwrite/Sync with initialProfile if personalization granted
        if (initialProfile && currentPrefs.personalization) {
            const syncedDetails = { ...initialProfile, ...currentDetails }
            setUserDetails(syncedDetails)
            syncToDB(status, syncedDetails, sid, currentPrefs)
        } else if (status !== 'undecided') {
            syncToDB(status, currentDetails, sid, currentPrefs)
        }
    }, [initialProfile, syncToDB])

    const setConsent = (status: ConsentStatus, prefs?: ConsentPreferences) => {
        const finalPrefs = prefs || (status === 'granted'
            ? { functional: true, statistical: true, personalization: true }
            : { functional: true, statistical: false, personalization: false })

        setConsentStatus(status)
        setPreferences(finalPrefs)

        // Expiry 1 year
        const expiry = 365 * 24 * 60 * 60
        document.cookie = `ua-consent=${status}; path=/; max-age=${expiry}; SameSite=Lax`
        document.cookie = `ua-preferences=${encodeURIComponent(JSON.stringify(finalPrefs))}; path=/; max-age=${expiry}; SameSite=Lax`

        if (sessionId) {
            syncToDB(status, userDetails, sessionId, finalPrefs)
        }

        // Handle personalization cleanup
        if (!finalPrefs.personalization) {
            document.cookie = 'ua-personalization=; path=/; max-age=0'
            setUserDetails({})
        }
    }

    const updateUserDetails = (details: UserDetails) => {
        const newDetails = { ...userDetails, ...details }
        setUserDetails(newDetails)

        if (preferences.personalization) {
            document.cookie = `ua-personalization=${encodeURIComponent(JSON.stringify(newDetails))}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
            if (sessionId) syncToDB(consentStatus, newDetails, sessionId, preferences)
        }
    }

    return (
        <ConsentContext.Provider value={{
            consentStatus,
            preferences,
            userDetails,
            sessionId,
            setConsent,
            updateUserDetails,
            showPreferenceManager,
            setShowPreferenceManager
        }}>
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
