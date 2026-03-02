'use server'

import { supabaseServer, getAuthClient, checkActionRateLimit, getClientIdentifier } from './utils'
import { ActionResponse } from './types'
import { SupportTicketSchema } from './schemas'
import { z } from 'zod'

export async function createTicket(formData: any): Promise<ActionResponse> {
    const account = await getAuthClient()
    const { data: { user } } = await account.auth.getUser()
    if (!user) return { success: false, error: 'Authorization required' }

    const { error } = await account.from('tickets').insert({
        user_id: user.id,
        ...formData,
        created_at: new Date().toISOString()
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function createSupportTicket(data: z.infer<typeof SupportTicketSchema>): Promise<ActionResponse & { ticketId?: string }> {
    const clientId = await getClientIdentifier()
    const isAllowed = await checkActionRateLimit(clientId, 'create_ticket', 5, 60)
    if (!isAllowed) return { success: false, error: 'Too many attempts' }

    const validated = SupportTicketSchema.safeParse(data)
    if (!validated.success) return { success: false, error: 'Invalid data' }

    const { data: ticket, error } = await supabaseServer.from('tickets').insert({
        ...validated.data,
        status: 'open',
        priority: 'normal'
    }).select('id').single()

    if (error) return { success: false, error: error.message }
    return { success: true, ticketId: ticket.id }
}

export async function createRepairRequest(data: any): Promise<ActionResponse> {
    try {
        const client = await getAuthClient()
        const { data: { user } } = await client.auth.getUser()
        if (!user) return { success: false, error: 'Authorization required' }

        const { error } = await client.from('repair_requests').insert({
            user_id: user.id,
            product_name: data.productName,
            order_number: data.orderNumber,
            issue: data.issue,
            status: 'pending',
            created_at: new Date().toISOString()
        })

        if (error) throw error
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function getBotResponse(query: string): Promise<{ text: string, actions?: any[] }> {
    return {
        text: "Hello! I am AURXY. How can I help you with your jewelry choice today?",
        actions: [
            { label: 'View Best Sellers', action: 'show_bestsellers' },
            { label: 'Speak to Expert', action: 'request_expert' }
        ]
    }
}

export async function broadcastNotification(title: string, body: string, url: string) {
    try {
        const { broadcastOffer } = await import('@/app/push-actions')
        return await broadcastOffer(title, body, url)
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function checkAgentAvailability(): Promise<boolean> {
    try {
        const { data: activeAgents, error } = await supabaseServer
            .from('profiles')
            .select('id')
            .eq('role', 'admin')
            .gt('last_active_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())

        if (error) return false
        return activeAgents && activeAgents.length > 0
    } catch (err) {
        return false
    }
}
export async function submitCustomOrder(data: any): Promise<ActionResponse> {
    try {
        const client = await getAuthClient()
        const { data: { user } } = await client.auth.getUser()

        const { error } = await client.from('custom_orders').insert({
            user_id: user?.id,
            ...data,
            created_at: new Date().toISOString()
        })

        if (error) throw error
        return { success: true, message: 'Your custom jewelry request has been received. Our master artisan will contact you shortly.' }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function submitContact(data: any): Promise<ActionResponse> {
    try {
        const { ContactSchema } = await import('./schemas')
        const validated = ContactSchema.parse(data)
        const client = await getAuthClient()

        const { error } = await client.from('contact_inquiries').insert([{
            name: validated.name,
            email: validated.email,
            subject: validated.subject,
            message: validated.message,
            status: 'pending',
            created_at: new Date().toISOString()
        }])

        if (error) return { success: false, error: error.message }
        return { success: true, message: 'Your message has been received. Our team will contact you shortly.' }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
