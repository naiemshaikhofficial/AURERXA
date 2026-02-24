'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'

// Helper to get authenticated client (optional, but good for RLS if user is logged in)
// For public forms, we might need a service role or just use `createClient` and rely on the public insert policy.
// Since we set "Allow public insert ...", standard client is fine.

async function getClient() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

export async function submitVirtualTryOn(formData: FormData) {
    const supabase = await getClient()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    // For date/time, handle potential nulls or empty strings
    const dateStr = formData.get('date') as string
    const timeStr = formData.get('time') as string

    if (!name || !email || !phone) {
        return { success: false, error: 'Name, Email, and Phone are required.' }
    }

    const { error } = await supabase.from('virtual_try_on_requests').insert({
        name,
        email,
        phone,
        preferred_date: dateStr || null,
        preferred_time: timeStr || null,
    })

    if (error) {
        console.error('Try-On Submit Error:', error)
        return { success: false, error: 'Failed to submit request. Please try again.' }
    }

    // Revalidate admin page so they see it immediately if they have it open (though it's client fetch usually)
    revalidatePath('/admin/services')
    return { success: true, message: 'Request submitted successfully!' }
}

export async function submitGoldHarvest(formData: FormData) {
    const supabase = await getClient()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const amountStr = formData.get('amount') as string

    if (!name || !email || !phone) {
        return { success: false, error: 'Name, Email, and Phone are required.' }
    }

    const { error } = await supabase.from('gold_harvest_leads').insert({
        name,
        email,
        phone,
        monthly_amount: amountStr ? parseFloat(amountStr) : null,
    })

    if (error) {
        console.error('Gold Harvest Submit Error:', error)
        return { success: false, error: 'Failed to submit request.' }
    }

    revalidatePath('/admin/services')
    return { success: true, message: 'Interest registered successfully!' }
}

export async function submitJewelryCare(formData: FormData) {
    const supabase = await getClient()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const serviceType = formData.get('serviceType') as string
    const dateStr = formData.get('date') as string

    if (!name || !email || !phone) {
        return { success: false, error: 'Name, Email, and Phone are required.' }
    }

    const { error } = await supabase.from('jewelry_care_appointments').insert({
        name,
        email,
        phone,
        service_type: serviceType || 'General Cleaning',
        preferred_date: dateStr || null,
    })

    if (error) {
        console.error('Jewelry Care Submit Error:', error)
        return { success: false, error: 'Failed to book appointment.' }
    }

    revalidatePath('/admin/services')
    return { success: true, message: 'Appointment requested successfully!' }
}

export async function submitBoutiqueVisit(formData: FormData) {
    const supabase = await getClient()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const dateStr = formData.get('date') as string
    const timeStr = formData.get('time') as string
    const purpose = formData.get('purpose') as string

    if (!name || !email || !phone) {
        return { success: false, error: 'Name, Email, and Phone are required.' }
    }

    const { error } = await supabase.from('boutique_appointments').insert({
        name,
        email,
        phone,
        preferred_date: dateStr || null,
        preferred_time: timeStr || null,
        visit_reason: purpose || null,
    })

    if (error) {
        console.error('Boutique Visit Submit Error:', error)
        return { success: false, error: 'Failed to schedule visit.' }
    }

    revalidatePath('/admin/services')
    return { success: true, message: 'Visit scheduled successfully!' }
}
