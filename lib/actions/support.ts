'use server'

import { supabaseServer, getAuthClient, checkActionRateLimit, getClientIdentifier } from './utils'
import { ActionResponse } from './types'
import { sanitize } from '@/lib/sanitizer'
import { z } from 'zod'

const SupportTicketSchema = z.object({
    subject: z.string().min(5).max(100),
    description: z.string().min(10).max(2000),
    category: z.string(),
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().min(10).max(15),
    userId: z.string().uuid().optional(),
})

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

export async function getBotResponse(query: string) {
    // AURXY ChatBot Logic...
    return { text: "Hello! I am AURXY. How can I help you with your jewelry choice today?" }
}

export async function createSupportTicket(data: z.infer<typeof SupportTicketSchema>): Promise<ActionResponse> {
    const clientId = await getClientIdentifier()
    const isAllowed = await checkActionRateLimit(clientId, 'create_ticket', 5, 60)
    if (!isAllowed) return { success: false, error: 'Too many attempts' }

    const validated = SupportTicketSchema.safeParse(data)
    if (!validated.success) return { success: false, error: 'Invalid data' }

    const { error } = await supabaseServer.from('tickets').insert({
        ...validated.data,
        status: 'open',
        priority: 'normal'
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
}
