'use server'

import { supabaseServer, checkIsAdmin } from './utils'

export async function triggerDatabaseMaintenance() {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return { success: false, error: 'Unauthorized' }

    try {
        const { data, error } = await supabaseServer.rpc('perform_database_maintenance')
        if (error) throw error
        return { success: true, results: data }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function checkAbandonedCarts() {
    // Original complex logic...
    return []
}

export async function cleanupPendingOrders() {
    // Original maintenance logic...
    return { success: true }
}
