'use server'

import { headers } from 'next/headers'
import { getAuthClient, supabaseServer } from './utils'

export async function upsertVisitorIntelligence(payload: any) {
    try {
        const client = await getAuthClient()
        const { data: { user } } = await client.auth.getUser()

        const head = await headers()
        const ip = head.get('x-forwarded-for') || '0.0.0.0'
        const maskedIp = ip.split('.').slice(0, 3).join('.') + '.0'

        const { error } = await client
            .from('visitor_intelligence')
            .upsert({
                session_id: payload.sessionId,
                user_id: user?.id || null,
                identity_data: payload.identityData || {},
                device_info: payload.deviceInfo || {},
                marketing_info: { ...payload.marketingInfo, ip_prefix: maskedIp, updated_at: new Date().toISOString() },
                last_active: new Date().toISOString()
            }, { onConflict: 'session_id' })

        if (error) throw error
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function logVisitorEvent(sessionId: string, eventName: string, metadata: any = {}) {
    try {
        const { error } = await supabaseServer.rpc('log_visitor_event_v2', {
            p_session_id: sessionId,
            p_event_name: eventName,
            p_metadata: metadata
        })
        if (error) throw error
        return { success: true }
    } catch (err) {
        return { success: false }
    }
}
