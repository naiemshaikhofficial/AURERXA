'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

async function getAuthClient() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                },
            },
        }
    )
}

// ============================================
// AUTH & ROLE CHECKS
// ============================================

export async function checkAdminRole() {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return null

    const { data } = await client
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!data) return null
    return { userId: user.id, email: user.email, role: data.role as 'main_admin' | 'support_admin' | 'staff' }
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats(dateFrom?: string, dateTo?: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return null

    const from = dateFrom || new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
    const to = dateTo || new Date().toISOString()

    // Total Revenue & Orders
    // Parallel Fetching for performance
    const [ordersRes, todayOrdersRes, productsRes, usersRes] = await Promise.all([
        client.from('orders').select('id, total, status, created_at'),
        client.from('orders').select('id, total, status').gte('created_at', from).lte('created_at', to),
        client.from('products').select('id, stock, name, image_url'),
        client.from('profiles').select('id')
    ])

    const orders = ordersRes.data
    const todayOrders = todayOrdersRes.data
    const products = productsRes.data
    const users = usersRes.data

    const allOrders = orders || []
    const filteredOrders = todayOrders || []
    const allProducts = products || []

    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
    const filteredRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
    const pendingOrders = allOrders.filter(o => o.status === 'pending').length
    const shippedOrders = allOrders.filter(o => o.status === 'shipped').length
    const deliveredOrders = allOrders.filter(o => o.status === 'delivered').length
    const cancelledOrders = allOrders.filter(o => o.status === 'cancelled').length
    const lowStockProducts = allProducts.filter(p => (p.stock || 0) <= 5)

    return {
        totalRevenue,
        filteredRevenue,
        totalOrders: allOrders.length,
        filteredOrders: filteredOrders.length,
        pendingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalProducts: allProducts.length,
        totalUsers: (users || []).length,
        lowStockProducts: lowStockProducts.map(p => ({ id: p.id, name: p.name, stock: p.stock, image_url: p.image_url })),
    }
}

export async function getRevenueChart(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return []

    let daysBack = 30
    if (period === 'daily') daysBack = 7
    if (period === 'weekly') daysBack = 90
    if (period === 'yearly') daysBack = 365

    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - daysBack)

    const { data: orders } = await client
        .from('orders')
        .select('total, created_at')
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: true })

    if (!orders) return []

    const grouped: Record<string, number> = {}
    orders.forEach(o => {
        const d = new Date(o.created_at)
        let key = ''
        if (period === 'daily') key = d.toLocaleDateString('en-IN', { weekday: 'short' })
        else if (period === 'weekly') key = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleDateString('en-IN', { month: 'short' })}`
        else if (period === 'monthly') key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
        else key = d.toLocaleDateString('en-IN', { month: 'short' })

        grouped[key] = (grouped[key] || 0) + Number(o.total || 0)
    })

    return Object.entries(grouped).map(([label, value]) => ({ label, value }))
}

export async function getOrdersChart(period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return []

    let daysBack = 30
    if (period === 'daily') daysBack = 7
    if (period === 'weekly') daysBack = 90

    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - daysBack)

    const { data: orders } = await client
        .from('orders')
        .select('status, created_at')
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: true })

    if (!orders) return []

    const grouped: Record<string, { total: number; pending: number; shipped: number; delivered: number; cancelled: number }> = {}
    orders.forEach(o => {
        const d = new Date(o.created_at)
        let key = ''
        if (period === 'daily') key = d.toLocaleDateString('en-IN', { weekday: 'short' })
        else if (period === 'weekly') key = `W${Math.ceil(d.getDate() / 7)}`
        else key = d.toLocaleDateString('en-IN', { month: 'short' })

        if (!grouped[key]) grouped[key] = { total: 0, pending: 0, shipped: 0, delivered: 0, cancelled: 0 }
        grouped[key].total++
        const status = (o.status || 'pending') as keyof typeof grouped[string]
        if (grouped[key][status] !== undefined) (grouped[key] as any)[status]++
    })

    return Object.entries(grouped).map(([label, data]) => ({ label, ...data }))
}

// ============================================
// ORDERS MANAGEMENT
// ============================================

export async function getAdminOrders(
    status?: string,
    dateFrom?: string,
    dateTo?: string,
    search?: string,
    page: number = 1,
    limit: number = 20
) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { orders: [], total: 0 }

    let query = client
        .from('orders')
        .select('*, order_items(*, products(name, image_url))', { count: 'exact' })

    if (status && status !== 'all') query = query.eq('status', status)
    if (dateFrom) query = query.gte('created_at', dateFrom)
    if (dateTo) query = query.lte('created_at', dateTo)
    if (search) query = query.or(`order_number.ilike.%${search}%`)

    const offset = (page - 1) * limit
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    const { data, count, error } = await query
    if (error) { console.error('Admin orders error:', error); return { orders: [], total: 0 } }

    // Manually join profiles to avoid complex FK constraints
    const orders = data || []
    const userIds = Array.from(new Set(orders.map((o: any) => o.user_id).filter(Boolean)))

    let profilesMap: Record<string, any> = {}
    if (userIds.length > 0) {
        const { data: profiles } = await client
            .from('profiles')
            .select('id, full_name, email, phone_number')
            .in('id', userIds)

        if (profiles) {
            profiles.forEach((p: any) => { profilesMap[p.id] = p })
        }
    }

    const ordersWithProfiles = orders.map((o: any) => ({
        ...o,
        user: o.user_id ? profilesMap[o.user_id] : null
    }))

    return { orders: ordersWithProfiles, total: count || 0 }
}

export async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { success: false, error: 'Unauthorized' }
    if (admin.role === 'staff' && !['shipped', 'packed'].includes(status)) {
        return { success: false, error: 'Staff can only update shipping status' }
    }

    const updates: any = { status, updated_at: new Date().toISOString() }
    if (trackingNumber) updates.tracking_number = trackingNumber

    const { error } = await client.from('orders').update(updates).eq('id', orderId)
    if (error) return { success: false, error: error.message }

    // Log activity
    await client.from('admin_activity_logs').insert({
        admin_id: admin.userId,
        action: `Updated order status to ${status}`,
        entity_type: 'order',
        entity_id: orderId,
        details: { status, trackingNumber },
    })

    return { success: true }
}

export async function deleteOrder(orderId: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role !== 'main_admin') return { success: false, error: 'Unauthorized. Only Main Admins can delete orders.' }

    const { error } = await client.from('orders').delete().eq('id', orderId)
    if (error) return { success: false, error: error.message }

    // Log activity
    await client.from('admin_activity_logs').insert({
        admin_id: admin.userId,
        action: 'Deleted order',
        entity_type: 'order',
        entity_id: orderId,
    })

    return { success: true }
}

// ============================================
// PRODUCTS MANAGEMENT
// ============================================

export async function getAdminAllProducts(search?: string, page: number = 1, limit: number = 20) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { products: [], total: 0 }

    let query = client
        .from('products')
        .select('id, name, price, stock, slug, created_at, categories(name)', { count: 'exact' })

    if (search) query = query.ilike('name', `%${search}%`)

    const offset = (page - 1) * limit
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    const { data, count } = await query
    return { products: data || [], total: count || 0 }
}

export async function deleteProduct(productId: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role === 'staff') return { success: false, error: 'Unauthorized' }

    const { error } = await client.from('products').delete().eq('id', productId)
    if (error) return { success: false, error: error.message }

    await client.from('admin_activity_logs').insert({
        admin_id: admin.userId,
        action: 'Deleted product',
        entity_type: 'product',
        entity_id: productId,
    })

    return { success: true }
}

// ============================================
// USERS MANAGEMENT
// ============================================

export async function getAdminAllUsers(search?: string, page: number = 1, limit: number = 20) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role === 'staff') return { users: [], total: 0 }

    let query = client
        .from('profiles')
        .select('id, full_name, email, phone_number, created_at, is_banned', { count: 'exact' })

    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)

    const offset = (page - 1) * limit
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    const { data: profiles, count } = await query

    if (!profiles) return { users: [], total: 0 }

    // Fetch stats for these users
    const userIds = profiles.map((p: any) => p.id)
    const { data: orders } = await client
        .from('orders')
        .select('user_id, total, created_at')
        .in('user_id', userIds)
        .neq('status', 'cancelled') // Exclude cancelled orders from valid stats

    const statsMap: Record<string, { totalOrders: number, totalSpent: number, lastOrderDate: string | null }> = {}

    if (orders) {
        orders.forEach((o: any) => {
            if (!statsMap[o.user_id]) statsMap[o.user_id] = { totalOrders: 0, totalSpent: 0, lastOrderDate: null }
            statsMap[o.user_id].totalOrders++
            statsMap[o.user_id].totalSpent += Number(o.total || 0)
            if (!statsMap[o.user_id].lastOrderDate || new Date(o.created_at) > new Date(statsMap[o.user_id].lastOrderDate!)) {
                statsMap[o.user_id].lastOrderDate = o.created_at
            }
        })
    }

    const usersWithStats = profiles.map((p: any) => ({
        ...p,
        stats: statsMap[p.id] || { totalOrders: 0, totalSpent: 0, lastOrderDate: null }
    }))

    return { users: usersWithStats, total: count || 0 }
}

export async function getUserDetails(userId: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return null

    const { data: profile } = await client.from('profiles').select('id, full_name, email, phone_number, avatar_url, is_banned, created_at').eq('id', userId).single()
    if (!profile) return null

    const { data: orders } = await client
        .from('orders')
        .select('id, order_number, status, total, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    const validOrders = orders?.filter((o: any) => o.status !== 'cancelled') || []
    const totalSpent = validOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0)

    return {
        profile,
        orders: orders || [],
        stats: {
            totalOrders: validOrders.length,
            totalSpent
        }
    }
}

export async function toggleUserBan(userId: string, banStatus: boolean) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role !== 'main_admin') return { success: false, error: 'Unauthorized. Only Main Admins can ban users.' }

    const { error } = await client.from('profiles').update({ is_banned: banStatus }).eq('id', userId)
    if (error) return { success: false, error: error.message }

    await client.from('admin_activity_logs').insert({
        admin_id: admin.userId,
        action: banStatus ? 'Banned user' : 'Unbanned user',
        entity_type: 'user',
        entity_id: userId,
    })

    return { success: true }
}

export async function deleteUser(userId: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role !== 'main_admin') return { success: false, error: 'Unauthorized. Only Main Admins can delete users.' }

    // Auth delete is restricted, so we delete profile (which should handle app data)
    // Note: Deleting from auth.users requires Service Role, which we don't expose here for safety.
    // Instead we delete the profile which cascades to orders etc if configured, or just removes app access.
    // For this implementation, we'll try to delete the profile.

    const { error } = await client.from('profiles').delete().eq('id', userId)
    if (error) return { success: false, error: error.message }

    await client.from('admin_activity_logs').insert({
        admin_id: admin.userId,
        action: 'Deleted user',
        entity_type: 'user',
        entity_id: userId,
    })

    return { success: true }
}

// ============================================
// ADMIN ROLE MANAGEMENT
// ============================================

export async function getAdminList() {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role !== 'main_admin') return []

    const { data } = await client
        .from('admin_users')
        .select('id, role, created_at, profiles(full_name, email)')
        .order('created_at', { ascending: false })

    return data || []
}

export async function updateAdminRole(targetUserId: string, newRole: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role !== 'main_admin') return { success: false, error: 'Unauthorized' }

    const { error } = await client
        .from('admin_users')
        .upsert({ id: targetUserId, role: newRole }, { onConflict: 'id' })

    if (error) return { success: false, error: error.message }

    await client.from('admin_activity_logs').insert({
        admin_id: admin.userId,
        action: `Changed role to ${newRole}`,
        entity_type: 'admin_user',
        entity_id: targetUserId,
    })

    return { success: true }
}

export async function removeAdmin(targetUserId: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role !== 'main_admin') return { success: false, error: 'Unauthorized' }

    const { error } = await client.from('admin_users').delete().eq('id', targetUserId)
    if (error) return { success: false, error: error.message }

    return { success: true }
}

// ============================================
// SUPPORT: TICKETS, REPAIRS, CONTACTS, CUSTOM ORDERS
// ============================================

export async function getAdminTickets(status?: string, page: number = 1) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { tickets: [], total: 0 }

    let query = client.from('tickets').select('*, profiles(full_name, email)', { count: 'exact' })
    if (status && status !== 'all') query = query.eq('status', status)
    query = query.order('created_at', { ascending: false }).range((page - 1) * 20, page * 20 - 1)

    const { data, count } = await query
    return { tickets: data || [], total: count || 0 }
}

export async function updateTicketStatus(ticketId: string, status: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { success: false }

    await client.from('tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', ticketId)
    return { success: true }
}

export async function getAdminRepairs(page: number = 1) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { repairs: [], total: 0 }

    const { data, count } = await client
        .from('repairs')
        .select('*, profiles(full_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1)

    return { repairs: data || [], total: count || 0 }
}

export async function getAdminContactMessages(page: number = 1) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { messages: [], total: 0 }

    const { data, count } = await client
        .from('contact_messages')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1)

    return { messages: data || [], total: count || 0 }
}

export async function getAdminCustomOrders(page: number = 1) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { orders: [], total: 0 }

    const { data, count } = await client
        .from('custom_orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1)

    return { orders: data || [], total: count || 0 }
}

// ============================================
// SETTINGS: GOLD RATES, COUPONS
// ============================================

export async function getAdminGoldRates() {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return []

    const { data } = await client.from('gold_rates').select('*').order('purity')
    return data || []
}

export async function updateGoldRate(id: string, rate: number) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role === 'staff') return { success: false }

    await client.from('gold_rates').update({ rate, updated_at: new Date().toISOString() }).eq('id', id)

    await client.from('admin_activity_logs').insert({
        admin_id: admin.userId,
        action: `Updated gold rate to ₹${rate}`,
        entity_type: 'gold_rate',
        entity_id: id,
    })

    return { success: true }
}

export async function getAdminCoupons() {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return []

    const { data } = await client.from('coupons').select('id, code, discount_type, discount_value, used_count, usage_limit, is_active, created_at').order('created_at', { ascending: false })
    return data || []
}

export async function createCoupon(couponData: any) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role === 'staff') return { success: false }

    const { error } = await client.from('coupons').insert(couponData)
    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function deleteCoupon(couponId: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role === 'staff') return { success: false }

    await client.from('coupons').delete().eq('id', couponId)
    return { success: true }
}

// ============================================
// ACTIVITY LOGS (Enhanced with filters)
// ============================================

export async function getActivityLogs(page: number = 1, entityType?: string, search?: string, dateFrom?: string, dateTo?: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { logs: [], total: 0 }

    let query = client
        .from('admin_activity_logs')
        .select('id, admin_id, action, entity_type, entity_id, created_at, profiles(full_name, email)', { count: 'exact' })

    if (entityType && entityType !== 'all') query = query.eq('entity_type', entityType)
    if (search) query = query.ilike('action', `%${search}%`)
    if (dateFrom) query = query.gte('created_at', dateFrom)
    if (dateTo) query = query.lte('created_at', dateTo)

    query = query.order('created_at', { ascending: false }).range((page - 1) * 50, page * 50 - 1)

    const { data, count } = await query
    return { logs: data || [], total: count || 0 }
}

// ============================================
// SUPPORT: DELETE & STATUS UPDATES
// ============================================

export async function deleteSupportItem(table: string, id: string) {
    const allowedTables = ['tickets', 'repairs', 'contact_messages', 'custom_orders']
    if (!allowedTables.includes(table)) return { success: false, error: 'Invalid table' }

    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { success: false, error: 'Unauthorized' }

    const { error } = await client.from(table).delete().eq('id', id)
    if (error) return { success: false, error: error.message }

    await client.from('admin_activity_logs').insert({
        admin_id: admin.userId,
        action: `Deleted ${table.replace('_', ' ')} item`,
        entity_type: table,
        entity_id: id,
    })

    return { success: true }
}

export async function updateSupportItemStatus(table: string, id: string, status: string) {
    const allowedTables = ['tickets', 'repairs', 'contact_messages', 'custom_orders']
    if (!allowedTables.includes(table)) return { success: false, error: 'Invalid table' }

    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { success: false, error: 'Unauthorized' }

    const { error } = await client.from(table).update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) return { success: false, error: error.message }

    await client.from('admin_activity_logs').insert({
        admin_id: admin.userId,
        action: `Updated ${table.replace('_', ' ')} status to ${status}`,
        entity_type: table,
        entity_id: id,
    })

    return { success: true }
}

// ============================================
// SERVICES: STATUS & DELETE
// ============================================

export async function updateServiceStatus(table: string, id: string, status: string) {
    const allowedTables = ['virtual_try_on_requests', 'gold_harvest_leads', 'jewelry_care_appointments', 'boutique_appointments']
    if (!allowedTables.includes(table)) return { success: false, error: 'Invalid table' }

    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { success: false, error: 'Unauthorized' }

    const { error } = await client.from(table).update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) return { success: false, error: error.message }

    await client.from('admin_activity_logs').insert({
        admin_id: admin.userId,
        action: `Updated ${table.replace(/_/g, ' ')} status to ${status}`,
        entity_type: 'service',
        entity_id: id,
    })

    return { success: true }
}

export async function deleteServiceRequest(table: string, id: string) {
    const allowedTables = ['virtual_try_on_requests', 'gold_harvest_leads', 'jewelry_care_appointments', 'boutique_appointments']
    if (!allowedTables.includes(table)) return { success: false, error: 'Invalid table' }

    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { success: false, error: 'Unauthorized' }

    const { error } = await client.from(table).delete().eq('id', id)
    if (error) return { success: false, error: error.message }

    await client.from('admin_activity_logs').insert({
        admin_id: admin.userId,
        action: `Deleted ${table.replace(/_/g, ' ')} request`,
        entity_type: 'service',
        entity_id: id,
    })

    return { success: true }
}

// ============================================
// EXPORT ORDERS CSV
// ============================================

export async function exportOrdersCsv(dateFrom?: string, dateTo?: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return ''

    let query = client.from('orders').select('order_number, status, subtotal, shipping, total, payment_method, tracking_number, created_at')
    if (dateFrom) query = query.gte('created_at', dateFrom)
    if (dateTo) query = query.lte('created_at', dateTo)
    query = query.order('created_at', { ascending: false })

    const { data } = await query
    if (!data || data.length === 0) return ''

    const headers = 'Order Number,Status,Subtotal,Shipping,Total,Payment Method,Tracking,Date\n'
    const rows = data.map(o =>
        `${o.order_number},${o.status},${o.subtotal},${o.shipping},${o.total},${o.payment_method || ''},${o.tracking_number || ''},${new Date(o.created_at).toLocaleDateString('en-IN')}`
    ).join('\n')

    return headers + rows
}
