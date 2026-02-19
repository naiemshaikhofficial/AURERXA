'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createDelhiveryShipment } from '../actions'

// UUID validation to prevent injection
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function isValidUUID(id: string): boolean {
    return UUID_REGEX.test(id)
}

// In-memory TTL cache (works with cookies/auth unlike unstable_cache)
const memCache = new Map<string, { data: any; expiry: number }>()
function getCached<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const now = Date.now()
    const cached = memCache.get(key)
    if (cached && cached.expiry > now) return Promise.resolve(cached.data as T)
    return fetcher().then(data => {
        memCache.set(key, { data, expiry: now + ttlSeconds * 1000 })
        return data
    })
}
function bustCache(...prefixes: string[]) {
    for (const [key] of memCache) {
        if (prefixes.some(p => key.startsWith(p))) memCache.delete(key)
    }
}

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
    try {
        const client = await getAuthClient()
        const { data: { user }, error: authError } = await client.auth.getUser()

        if (authError || !user) {
            return null
        }

        const { data, error: roleError } = await client
            .from('admin_users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (roleError || !data) {
            return null
        }
        return { userId: user.id, email: user.email, role: data.role as 'main_admin' | 'support_admin' | 'staff' | 'product_manager' }
    } catch (err) {
        return null
    }
}

// ============================================
// DASHBOARD STATS
// ============================================

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats(dateFrom?: string, dateTo?: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return null

    const from = dateFrom || new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
    const to = dateTo || new Date().toISOString()

    return getCached(`stats:${from}:${to}`, 60, async () => {
        const { data, error } = await client.rpc('get_dashboard_stats', {
            date_from: from,
            date_to: to
        })

        if (error || !data) {
            console.error('RPC get_dashboard_stats failed, falling back to legacy fetch:', error)
            return await getDashboardStatsLegacy(client, from, to)
        }

        return {
            confirmedRevenue: Number(data.confirmedRevenue) || 0,
            filteredRevenue: Number(data.filteredRevenue) || 0,
            pendingRevenue: Number(data.pendingRevenue) || 0,
            cancelledRevenue: Number(data.cancelledRevenue) || 0,
            revenueGrowth: data.prevRevenue > 0 ? ((data.filteredRevenue - data.prevRevenue) / data.prevRevenue) * 100 : 0,
            ordersGrowth: 0,
            prevRevenue: Number(data.prevRevenue) || 0,
            totalOrders: Number(data.totalOrders) || 0,
            filteredOrders: Number(data.filteredOrders) || 0,
            pendingOrders: Number(data.pendingOrders) || 0,
            packedOrders: Number(data.packedOrders) || 0,
            shippedOrders: Number(data.shippedOrders) || 0,
            deliveredOrders: Number(data.deliveredOrders) || 0,
            cancelledOrders: Number(data.cancelledOrders) || 0,
            totalProducts: Number(data.totalProducts) || 0,
            totalUsers: Number(data.totalUsers) || 0,
            lowStockProducts: data.lowStockProducts || [],
        }
    })
}

// Fallback legacy function (Optimized to NOT fetch all fields)
async function getDashboardStatsLegacy(client: any, from: string, to: string) {
    const [ordersRes, productsRes, usersRes] = await Promise.all([
        client.from('orders').select('total, status, created_at'),
        client.from('products').select('id, stock, name, image_url', { count: 'exact' }),
        client.from('profiles').select('id', { count: 'exact', head: true })
    ])

    const allOrders = ordersRes.data || []
    const allProducts = productsRes.data || []

    // Revenue logic (Same as before)
    const confirmedStatuses = ['delivered', 'shipped', 'packed']
    const confirmedOrders = allOrders.filter((o: any) => confirmedStatuses.includes(o.status))
    const confirmedRevenue = confirmedOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0)

    // Filtered
    const filteredOrders = allOrders.filter((o: any) => o.created_at >= from && o.created_at <= to)
    const filteredConfirmed = filteredOrders.filter((o: any) => confirmedStatuses.includes(o.status))
    const filteredRevenue = filteredConfirmed.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0)

    // Other stats
    const pendingOrders = allOrders.filter((o: any) => o.status === 'pending')
    const lowStock = allProducts.filter((p: any) => (p.stock || 0) <= 5)

    return {
        confirmedRevenue,
        filteredRevenue,
        pendingRevenue: pendingOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0),
        cancelledRevenue: allOrders.filter((o: any) => o.status === 'cancelled').reduce((sum: number, o: any) => sum + Number(o.total || 0), 0),
        revenueGrowth: 0, // skipped for fallback
        ordersGrowth: 0,
        prevRevenue: 0,
        totalOrders: allOrders.length,
        filteredOrders: filteredOrders.length,
        pendingOrders: pendingOrders.length,
        packedOrders: allOrders.filter((o: any) => o.status === 'packed').length,
        shippedOrders: allOrders.filter((o: any) => o.status === 'shipped').length,
        deliveredOrders: allOrders.filter((o: any) => o.status === 'delivered').length,
        cancelledOrders: allOrders.filter((o: any) => o.status === 'cancelled').length,
        totalProducts: productsRes.count || 0,
        totalUsers: usersRes.count || 0,
        lowStockProducts: lowStock.map((p: any) => ({ id: p.id, name: p.name, stock: p.stock, image_url: p.image_url })),
    }
}

export async function getRevenueChart(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return []

    return getCached(`revenue:${period}`, 120, async () => {
        let daysBack = 30
        if (period === 'daily') daysBack = 7
        if (period === 'weekly') daysBack = 90
        if (period === 'yearly') daysBack = 365

        const fromDate = new Date()
        fromDate.setDate(fromDate.getDate() - daysBack)

        const { data: orders } = await client
            .from('orders')
            .select('total, status, created_at')
            .gte('created_at', fromDate.toISOString())
            .in('status', ['delivered', 'shipped', 'packed'])
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

            grouped[key] = (grouped[key] || 0) + o.total
        })

        return Object.entries(grouped).map(([name, revenue]) => ({ name, revenue }))
    })
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

export async function getAnalyticsSummary(dateFrom?: string, dateTo?: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return null

    const from = dateFrom || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const to = dateTo || new Date().toISOString()

    // Fetch orders with items for the period
    const { data: orders } = await client
        .from('orders')
        .select('id, total, status, user_id, payment_method, order_items(quantity)')
        .gte('created_at', from)
        .lte('created_at', to)

    const allOrders = orders || []
    const confirmedStatuses = ['delivered', 'shipped', 'packed']
    const confirmed = allOrders.filter(o => confirmedStatuses.includes(o.status))
    const delivered = allOrders.filter(o => o.status === 'delivered')

    // AOV - Average Order Value (confirmed orders only)
    const confirmedRevenue = confirmed.reduce((sum, o) => sum + Number(o.total || 0), 0)
    const aov = confirmed.length > 0 ? Math.round(confirmedRevenue / confirmed.length) : 0

    // Conversion Rate - Delivered / Total orders %
    const conversionRate = allOrders.length > 0 ? Math.round((delivered.length / allOrders.length) * 1000) / 10 : 0

    // Repeat Customer Rate - users with 2+ orders / total ordering users
    const userOrderCounts: Record<string, number> = {}
    allOrders.forEach(o => {
        if (o.user_id) {
            userOrderCounts[o.user_id] = (userOrderCounts[o.user_id] || 0) + 1
        }
    })
    const totalOrderingUsers = Object.keys(userOrderCounts).length
    const repeatUsers = Object.values(userOrderCounts).filter(c => c >= 2).length
    const repeatCustomerRate = totalOrderingUsers > 0 ? Math.round((repeatUsers / totalOrderingUsers) * 1000) / 10 : 0

    // Avg items per order
    let totalItems = 0
    allOrders.forEach((o: any) => {
        if (o.order_items) {
            totalItems += o.order_items.reduce((s: number, i: any) => s + (i.quantity || 0), 0)
        }
    })
    const avgItemsPerOrder = allOrders.length > 0 ? Math.round((totalItems / allOrders.length) * 10) / 10 : 0

    // Top payment method
    const methodCounts: Record<string, number> = {}
    allOrders.forEach(o => {
        const m = (o as any).payment_method || 'unknown'
        methodCounts[m] = (methodCounts[m] || 0) + 1
    })
    const topPaymentMethod = Object.entries(methodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'

    return {
        aov,
        conversionRate,
        repeatCustomerRate,
        avgItemsPerOrder,
        topPaymentMethod,
    }
}

// ============================================
// DASHBOARD WIDGETS DATA
// ============================================

export async function getRecentOrders(limit: number = 5) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return []

    return getCached(`recent-orders:${limit}`, 30, async () => {
        const { data } = await client
            .from('orders')
            .select('id, order_number, total, status, created_at, profiles(full_name)')
            .order('created_at', { ascending: false })
            .limit(limit)
        return data || []
    })
}

export async function getTopProducts(limit: number = 5) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return []

    return getCached(`top-products:${limit}`, 120, async () => {
        const { data: items } = await client
            .from('order_items')
            .select('product_id, quantity, orders!inner(status)')

        if (!items?.length) return []

        const productSales: Record<string, number> = {}
        items.forEach((item: any) => {
            if (item.orders?.status !== 'cancelled') {
                productSales[item.product_id] = (productSales[item.product_id] || 0) + item.quantity
            }
        })

        const topIds = Object.entries(productSales)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([id]) => id)

        if (topIds.length === 0) return []

        const { data: products } = await client
            .from('products')
            .select('id, name, price, image_url, stock')
            .in('id', topIds)

        if (!products) return []

        return products.map(p => ({
            ...p,
            sales: productSales[p.id] || 0
        })).sort((a, b) => b.sales - a.sales)
    })
}

export async function getCancelledOrderDetails(limit: number = 10) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return []

    const { data } = await client
        .from('orders')
        .select('id, order_number, total, status, created_at, updated_at, profiles(full_name, email), order_items(quantity, price, products(name))')
        .eq('status', 'cancelled')
        .order('updated_at', { ascending: false })
        .limit(limit)

    return data || []
}

export async function getOrdersByStatus(statusFilter?: string, limit: number = 20) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return []

    let query = client
        .from('orders')
        .select('id, order_number, total, status, created_at, updated_at, tracking_number, payment_method, profiles(full_name, email, phone_number), order_items(quantity, price, products(name, image_url))')

    if (statusFilter && statusFilter !== 'all') {
        if (statusFilter === 'confirmed') {
            query = query.in('status', ['delivered', 'shipped', 'packed'])
        } else {
            query = query.eq('status', statusFilter)
        }
    }

    const { data } = await query
        .order('created_at', { ascending: false })
        .limit(limit)

    return data || []
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
    limit: number = 20,
    minTotal?: number,
    maxTotal?: number
) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { orders: [], total: 0 }

    let query = client
        .from('orders')
        .select('*, order_items(*, products(name, image_url, weight_grams, purity))', { count: 'exact' })

    if (status && status !== 'all') query = query.eq('status', status)
    if (dateFrom) query = query.gte('created_at', dateFrom)
    if (dateTo) query = query.lte('created_at', dateTo)
    if (search) query = query.or(`order_number.ilike.%${search}%`)
    if (minTotal) query = query.gte('total', minTotal)
    if (maxTotal) query = query.lte('total', maxTotal)

    const offset = (page - 1) * limit
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    let { data: ordersData, count, error } = await query

    if (error) { console.error('Admin orders error:', error); return { orders: [], total: 0 } }

    // Manually join profiles to avoid complex FK constraints
    const orders = ordersData || []
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

// Enhanced polling endpoint to get latest order details for notifications
export async function getOrdersPollingData() {
    const client = await getAuthClient()
    const admin = await checkAdminRole()

    if (!admin) {
        return null
    }

    // Get the absolute latest order with items and product names
    const { data, error } = await client
        .from('orders')
        .select(`
            id, 
            order_number, 
            status, 
            total, 
            updated_at, 
            created_at,
            order_items (
                quantity,
                products (
                    name
                )
            )
        `)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error('DEBUG: Polling error:', error.message)
        // If error is "JSON object requested, multiple (or no) rows returned", it means table is likely empty
        // Return 0 count but null latestOrder
    }

    // Also get total count to detect new orders specifically
    const { count, error: countError } = await client
        .from('orders')
        .select('*', { count: 'exact', head: true })

    if (countError) console.error('DEBUG: Count error:', countError.message);

    const res = {
        latestOrder: data || null,
        latestId: data?.id || null,
        latestTimestamp: data?.updated_at || data?.created_at || null,
        totalOrders: count || 0,
    }

    return res
}

export async function getSingleOrderForNotification(orderId: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return null

    const { data, error } = await client
        .from('orders')
        .select(`
            id, 
            order_number, 
            status, 
            total, 
            updated_at, 
            created_at,
            order_items (
                quantity,
                products (
                    name
                )
            )
        `)
        .eq('id', orderId)
        .single()

    if (error) {
        console.error('Error fetching single order:', error.message)
        return null
    }

    return data
}

export async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { success: false, error: 'Unauthorized' }

    // Role Restrictions
    // Staff: Can only mark 'shipped' or 'packed'
    if (admin.role === 'staff' && !['shipped', 'packed'].includes(status)) {
        return { success: false, error: 'Staff can only update shipping status' }
    }
    // Product Manager: Cannot update orders at all
    if (admin.role === 'product_manager') {
        return { success: false, error: 'Unauthorized. Product Managers cannot manage orders.' }
    }

    const updates: any = { status, updated_at: new Date().toISOString() }
    if (trackingNumber) updates.tracking_number = trackingNumber

    // Automation: Create Delhivery Shipment when status is 'packed'
    if (status === 'packed') {
        const shipment = await createDelhiveryShipment(orderId)
        if (!shipment.success) {
            console.error('Auto shipment creation failed:', shipment.error)
            // We still update the status, but log the error
        } else if (shipment.trackingNumber) {
            updates.tracking_number = shipment.trackingNumber
        }
    }

    if (!isValidUUID(orderId)) return { success: false, error: 'Invalid order ID' }

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

    // Bust caches
    bustCache('stats', 'recent-orders', 'revenue')

    return { success: true }
}

export async function bulkUpdateOrderStatus(orderIds: string[], status: string) {
    const admin = await checkAdminRole()
    if (!admin) return { success: false, error: 'Unauthorized' }

    // Use Promise.all for now, or a single Supabase query if preferred.
    // updateOrderStatus has complex logic (Delhivery automation), so we'll call it for each.
    const results = await Promise.all(orderIds.map(id => updateOrderStatus(id, status)))
    const failedCount = results.filter(r => !r.success).length

    if (failedCount > 0) {
        return { success: false, error: `${failedCount} updates failed.` }
    }

    return { success: true }
}

export async function deleteOrder(orderId: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role !== 'main_admin') return { success: false, error: 'Unauthorized. Only Main Admins can delete orders.' }
    if (!isValidUUID(orderId)) return { success: false, error: 'Invalid order ID' }

    const { error } = await client.from('orders').delete().eq('id', orderId)
    if (error) return { success: false, error: error.message }

    // Log activity
    await client.from('admin_activity_logs').insert({
        admin_id: admin.userId,
        action: 'Deleted order',
        entity_type: 'order',
        entity_id: orderId,
    })

    // Bust caches
    bustCache('stats', 'recent-orders', 'revenue')

    return { success: true }
}

// ============================================
// PRODUCTS MANAGEMENT
// ============================================

export async function getAdminAllProducts(
    search?: string,
    page: number = 1,
    limit: number = 20,
    categoryId?: string,
    subCategoryId?: string,
    minPrice?: number,
    maxPrice?: number,
    stockStatus?: 'low' | 'out' | 'in',
    dateFrom?: string,
    dateTo?: string
) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { products: [], total: 0 }

    let query = client
        .from('products')
        .select('*, categories(name), sub_categories(name)', { count: 'exact' })

    if (search) query = query.ilike('name', `%${search}%`)
    if (categoryId && categoryId !== 'all') query = query.eq('category_id', categoryId)
    if (subCategoryId && subCategoryId !== 'all') query = query.eq('sub_category_id', subCategoryId)
    if (minPrice) query = query.gte('price', minPrice)
    if (maxPrice) query = query.lte('price', maxPrice)
    if (dateFrom) query = query.gte('created_at', dateFrom)
    if (dateTo) query = query.lte('created_at', dateTo)

    if (stockStatus) {
        if (stockStatus === 'low') query = query.lte('stock', 5).gt('stock', 0)
        else if (stockStatus === 'out') query = query.eq('stock', 0)
        else if (stockStatus === 'in') query = query.gt('stock', 5)
    }

    const offset = (page - 1) * limit
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    const { data, count, error } = await query
    if (error) console.error('Admin products error:', error)

    return { products: data || [], total: count || 0 }
}

// ============================================
// INTERNAL NOTES (AMAZON-STYLE COLLABORATION)
// ============================================

export async function addInternalNote(entityType: 'order' | 'user' | 'product' | 'general', entityId: string, content: string, isFlagged: boolean = false) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { success: false, error: 'Unauthorized' }

    const { error } = await client.from('internal_notes').insert({
        entity_type: entityType,
        entity_id: entityId,
        author_id: admin.userId,
        content,
        is_flagged: isFlagged
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function getInternalNotes(entityType: string, entityId: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return []

    const { data } = await client
        .from('internal_notes')
        .select('*, author:profiles(full_name, avatar_url)')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })

    return data || []
}

export async function getFlaggedNotes() {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return []

    const { data } = await client
        .from('internal_notes')
        .select('*, author:profiles(full_name)')
        .eq('is_flagged', true)
        .order('created_at', { ascending: false })
        .limit(10)

    return data || []
}



export async function deleteProduct(productId: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    // STRICT CHECK: Only Main Admin can delete products
    if (!admin || admin.role !== 'main_admin') return { success: false, error: 'Unauthorized. Only Main Admin can delete products.' }

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

export async function getAdminAllUsers(
    search?: string,
    page: number = 1,
    limit: number = 20,
    role?: string,
    isBanned?: boolean,
    dateFrom?: string,
    dateTo?: string,
    minSpent?: number,
    maxSpent?: number
) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role === 'staff') return { users: [], total: 0 }

    let query = client
        .from('profiles')
        .select('id, full_name, email, phone_number, created_at, is_banned, avatar_url', { count: 'exact' })

    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    if (isBanned !== undefined) query = query.eq('is_banned', isBanned)
    if (dateFrom) query = query.gte('created_at', dateFrom)
    if (dateTo) query = query.lte('created_at', dateTo)

    if (role && role !== 'all') {
        const { data: adminUsers } = await client.from('admin_users').select('id').eq('role', role)
        const adminIds = adminUsers?.map((au: any) => au.id) || []
        if (role === 'user') {
            // This is tricky, we need users NOT in admin_users
            const { data: allAdmins } = await client.from('admin_users').select('id')
            const allAdminIds = allAdmins?.map((au: any) => au.id) || []
            if (allAdminIds.length > 0) query = query.not('id', 'in', `(${allAdminIds.join(',')})`)
        } else {
            if (adminIds.length > 0) query = query.in('id', adminIds)
            else return { users: [], total: 0 } // No users found with this admin role
        }
    }

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

    // Client-side filtering for spent range since it's derived from multiple tables
    // (Ideally this should be a view or RPC for large scale)
    let filteredResults = usersWithStats
    if (minSpent !== undefined) filteredResults = filteredResults.filter(u => u.stats.totalSpent >= minSpent)
    if (maxSpent !== undefined) filteredResults = filteredResults.filter(u => u.stats.totalSpent <= maxSpent)

    return { users: filteredResults, total: count || 0 }
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

    const { data: addresses } = await client
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })

    const { data: adminUser } = await client.from('admin_users').select('role').eq('id', userId).single()

    return {
        profile,
        orders: orders || [],
        addresses: addresses || [],
        stats: {
            totalOrders: validOrders.length,
            totalSpent
        },
        isAdmin: !!adminUser,
        adminRole: adminUser?.role
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

export async function searchUsersForAdmin(query: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return []

    const { data } = await client
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10)

    return data || []
}

export async function toggleAdminRole(userId: string, makeAdmin: boolean) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role !== 'main_admin') return { success: false, error: 'Unauthorized. Only Main Admins can manage roles.' }

    if (makeAdmin) {
        // Promote to admin (default role: staff)
        const { error } = await client.from('admin_users').insert({ id: userId, role: 'staff' })
        if (error) return { success: false, error: 'Failed to promote: ' + error.message }

        await client.from('admin_activity_logs').insert({
            admin_id: admin.userId,
            action: 'Promoted user to Admin',
            entity_type: 'user',
            entity_id: userId
        })
    } else {
        // Demote from admin
        const { error } = await client.from('admin_users').delete().eq('id', userId)
        if (error) return { success: false, error: 'Failed to demote: ' + error.message }

        await client.from('admin_activity_logs').insert({
            admin_id: admin.userId,
            action: 'Demoted Admin to User',
            entity_type: 'user',
            entity_id: userId
        })
    }

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

    return getCached('gold-rates', 60, async () => {
        const { data } = await client.from('gold_rates').select('*').order('purity')
        return data || []
    })
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

    bustCache('gold-rates', 'coupons')
    return { success: true }
}

export async function getAdminCoupons() {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return []

    return getCached('coupons', 60, async () => {
        const { data } = await client.from('coupons').select('id, code, discount_type, discount_value, used_count, usage_limit, is_active, created_at').order('created_at', { ascending: false })
        return data || []
    })
}

export async function createCoupon(couponData: any) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role === 'staff') return { success: false }

    const { error } = await client.from('coupons').insert(couponData)
    if (error) return { success: false, error: error.message }
    bustCache('coupons')
    return { success: true }
}

export async function deleteCoupon(couponId: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role === 'staff') return { success: false }

    await client.from('coupons').delete().eq('id', couponId)
    bustCache('coupons')
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

export async function getShipmentLabel(waybill: string) {
    const delhiveryToken = process.env.DELHIVERY_API_TOKEN
    const delhiveryUrl = process.env.DELHIVERY_API_URL || 'https://staging-express.delhivery.com'

    if (!delhiveryToken) return null

    try {
        const response = await fetch(`${delhiveryUrl}/api/p/packing_slip?waybills=${waybill}`, {
            headers: { 'Authorization': `Token ${delhiveryToken}` }
        })
        const responseText = await response.text()
        let data: any
        try {
            data = JSON.parse(responseText)
        } catch {
            console.error('Delhivery non-JSON response:', responseText.slice(0, 500))
            return { success: false, error: 'Delhivery API returned an invalid response. Please try scheduling pickup manually.' }
        }
        return data.packages?.[0]?.pdf_url || null
    } catch (e) {
        return null
    }
}

// ============================================
// BULK / WHOLESALE ORDERS MANAGEMENT
// ============================================

export async function getAdminBulkOrders(status?: string, page: number = 1, limit: number = 20) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { orders: [], total: 0 }

    let query = client
        .from('bulk_orders')
        .select('*, bulk_order_items(*)', { count: 'exact' })

    if (status && status !== 'all') query = query.eq('status', status)

    const offset = (page - 1) * limit
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    const { data, count, error } = await query
    if (error) {
        console.error('Admin bulk orders error:', error)
        return { orders: [], total: 0 }
    }

    return { orders: data || [], total: count || 0 }
}

export async function updateBulkOrderStatus(
    bulkOrderId: string,
    status: string,
    adminNotes?: string,
    quotedTotal?: number,
    itemQuotes?: { itemId: string; quotedPrice: number }[]
) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { success: false, error: 'Unauthorized' }

    const updates: any = {
        status,
        updated_at: new Date().toISOString()
    }
    if (adminNotes !== undefined) updates.admin_notes = adminNotes
    if (quotedTotal !== undefined) updates.quoted_total = quotedTotal

    const { error } = await client
        .from('bulk_orders')
        .update(updates)
        .eq('id', bulkOrderId)

    if (error) return { success: false, error: error.message }

    // Update individual item quotes if provided
    if (itemQuotes && itemQuotes.length > 0) {
        for (const iq of itemQuotes) {
            await client
                .from('bulk_order_items')
                .update({ quoted_price: iq.quotedPrice })
                .eq('id', iq.itemId)
        }
    }

    // Log activity
    await client.from('admin_activity_logs').insert({
        admin_id: admin.userId,
        action: `Updated bulk order status to ${status}`,
        entity_type: 'bulk_order',
        entity_id: bulkOrderId,
        details: { status, adminNotes, quotedTotal },
    })

    return { success: true }
}

export async function deleteBulkOrder(bulkOrderId: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role === 'staff') return { success: false, error: 'Unauthorized' }

    const { error } = await client.from('bulk_orders').delete().eq('id', bulkOrderId)
    if (error) return { success: false, error: error.message }

    await client.from('admin_activity_logs').insert({
        admin_id: admin.userId,
        action: 'Deleted bulk order inquiry',
        entity_type: 'bulk_order',
        entity_id: bulkOrderId,
    })

    return { success: true }
}

// ============================================
// SYSTEM HEALTH & ERROR LOGS
// ============================================

export async function getErrorLogs(limit: number = 50) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role !== 'main_admin') return []

    const { data, error } = await client
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching logs:', error)
        return []
    }
    return data || []
}

export async function deleteErrorLog(id: string) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role !== 'main_admin') return { success: false }

    const { error } = await client.from('error_logs').delete().eq('id', id)
    return { success: !error }
}

// ============================================
// DATA EXPORT TOOLS (Phase 4)
// ============================================

export async function exportOrdersToCSV() {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { success: false, error: 'Unauthorized' }

    const { data: orders, error } = await client
        .from('orders')
        .select('order_number, total, status, payment_method, created_at, profiles(full_name, email)')
        .order('created_at', { ascending: false })

    if (error || !orders) return { success: false, error: 'Database error' }

    const headers = ['Order #', 'Customer', 'Email', 'Total (INR)', 'Status', 'Payment', 'Date']
    const rows = orders.map((o: any) => [
        o.order_number,
        o.profiles?.full_name || 'Guest',
        o.profiles?.email || '',
        o.total,
        o.status,
        o.payment_method || 'N/A',
        new Date(o.created_at).toLocaleDateString()
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    return { success: true, csv: csvContent, filename: `orders_report_${new Date().toISOString().split('T')[0]}.csv` }
}

export async function exportUsersToCSV() {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin || admin.role === 'staff') return { success: false, error: 'Unauthorized' }

    const { data: users, error } = await client
        .from('profiles')
        .select('full_name, email, phone_number, created_at, is_banned')
        .order('created_at', { ascending: false })

    if (error || !users) return { success: false, error: 'Database error' }

    const headers = ['Full Name', 'Email', 'Phone', 'Joined Date', 'Banned Status']
    const rows = users.map((u: any) => [
        u.full_name,
        u.email,
        u.phone_number || '',
        new Date(u.created_at).toLocaleDateString(),
        u.is_banned ? 'Yes' : 'No'
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    return { success: true, csv: csvContent, filename: `users_report_${new Date().toISOString().split('T')[0]}.csv` }
}

// ============================================
// SYSTEM MAINTENANCE
// ============================================

export async function triggerDatabaseMaintenance() {
    const admin = await checkAdminRole()
    if (!admin || admin.role !== 'main_admin') return { success: false, error: 'Unauthorized. Only Main Admin can perform maintenance.' }

    const client = await getAuthClient()
    const { data, error } = await client.rpc('perform_database_maintenance')

    if (error) {
        console.error('Maintenance RPC failed:', error)
        return { success: false, error: error.message }
    }

    // Log the maintenance action
    await client.from('admin_activity_logs').insert({
        admin_id: admin.userId,
        action: 'System Maintenance Performed',
        entity_type: 'system',
        details: data
    })

    return { success: true, results: data }
}
// ============================================
// MARKETING & USER ENGAGEMENT
// ============================================

export async function getAbandonedCarts() {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return []

    // Find carts that haven't been touched in > 2 hours and haven't become orders
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    const { data, error } = await client
        .from('cart')
        .select(`
            id, 
            user_id, 
            quantity, 
            size, 
            created_at, 
            updated_at,
            products(name, price, image_url, id, slug)
        `)
        .lt('updated_at', twoHoursAgo)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching abandoned carts:', error)
        return []
    }

    // Group by user
    const usersMap: Record<string, any> = {}

    // Fetch profiles for these users
    const userIds = Array.from(new Set(data?.map(item => item.user_id).filter(Boolean)))
    let profiles: any[] = []
    if (userIds.length > 0) {
        const { data: p } = await client.from('profiles').select('id, full_name, email, phone_number').in('id', userIds)
        profiles = p || []
    }

    data?.forEach(item => {
        if (!item.user_id) return
        if (!usersMap[item.user_id]) {
            const profile = profiles.find(p => p.id === item.user_id)
            usersMap[item.user_id] = {
                user: profile || { email: 'Unknown' },
                items: [],
                last_updated: item.updated_at,
                total_value: 0
            }
        }
        usersMap[item.user_id].items.push(item)
        const product = Array.isArray(item.products) ? item.products[0] : item.products
        usersMap[item.user_id].total_value += ((product?.price || 0) * item.quantity)
        if (new Date(item.updated_at) > new Date(usersMap[item.user_id].last_updated)) {
            usersMap[item.user_id].last_updated = item.updated_at
        }
    })

    return Object.values(usersMap)
}

export async function sendAbandonmentReminder(userId: string, type: 'push' | 'whatsapp' | 'email') {
    const admin = await checkAdminRole()
    if (!admin) return { success: false, error: 'Unauthorized' }

    // Fetch the user's latest cart item
    const client = await getAuthClient()
    const { data: cartItems } = await client
        .from('cart')
        .select('*, products(name, slug, image_url)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)

    if (!cartItems || cartItems.length === 0) return { success: false, error: 'No items in cart' }

    const item = cartItems[0]

    if (type === 'push') {
        const { notifyAbandonedCart } = await import('../push-actions')
        return await notifyAbandonedCart(userId, item.products.name, item.products.slug, item.products.image_url)
    }

    // Placeholder for WhatsApp/Email
    return { success: true, message: `Reminder sent via ${type}` }
}

export async function getMarketingSegments() {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return []

    // Logical segments based on visitor_intelligence and orders
    const { data: intelligence } = await client
        .from('visitor_intelligence')
        .select('*')

    // Logic to build segments...
    const segments = [
        { id: 'high_value', name: 'High Value Visitors', description: 'Interacted with products > ₹50,000', count: 12 },
        { id: 'cart_abandoners', name: 'Cart Abandoners', description: 'Users with items left in cart', count: 45 },
        { id: 'bridal_enthusiasts', name: 'Bridal Enthusiasts', description: 'Viewed Bridal collection 3+ times', count: 28 }
    ]

    return segments
}

export async function broadcastMarketingMessage(segmentId: string, title: string, body: string, url: string) {
    const admin = await checkAdminRole()
    if (!admin) return { success: false, error: 'Unauthorized' }

    const { sendNotification } = await import('../push-actions')
    // In a real scenario, filter subscriptions by segment
    return await sendNotification(title, body, url)
}

// ============================================
// RETURN REQUESTS MANAGEMENT
// ============================================

export async function getAdminReturnRequests() {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return []

    // Fetch return requests with order data (profiles join doesn't work because user_id FK points to auth.users, not profiles)
    const { data, error } = await client
        .from('return_requests')
        .select(`
            *,
            orders(order_number, total)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching admin return requests:', error)
        return []
    }

    if (!data || data.length === 0) return []

    // Batch-fetch profiles for all unique user_ids
    const userIds = [...new Set(data.map(r => r.user_id).filter(Boolean))]
    let profilesMap: Record<string, any> = {}

    if (userIds.length > 0) {
        const { data: profiles } = await client
            .from('profiles')
            .select('id, full_name, email, phone_number')
            .in('id', userIds)

        if (profiles) {
            profiles.forEach(p => { profilesMap[p.id] = p })
        }
    }

    // Attach profile data to each request
    return data.map(req => ({
        ...req,
        profiles: profilesMap[req.user_id] || { full_name: 'Unknown', email: '', phone_number: '' }
    }))
}

export async function getSingleReturnRequestForNotification(requestId: string) {
    const client = await getAuthClient()
    const { data, error } = await client
        .from('return_requests')
        .select(`
            *,
            orders(order_number, total)
        `)
        .eq('id', requestId)
        .single()

    if (error || !data) return null

    // Fetch profile separately (user_id FK -> auth.users, not profiles)
    const { data: profile } = await client
        .from('profiles')
        .select('full_name, email')
        .eq('id', data.user_id)
        .single()

    return { ...data, profiles: profile || { full_name: 'Customer', email: '' } }
}

async function sendReturnStatusNotification(requestId: string, status: string, orderNumber: string) {
    // Placeholder: Trigger Email/WhatsApp via Resend or generic notification service
    console.log(`[Notification] Return ${requestId} for Order ${orderNumber} updated to ${status}`)
}

export async function updateReturnStatus(requestId: string, status: string, adminNotes?: string, restockInventory: boolean = false) {
    const client = await getAuthClient()
    const admin = await checkAdminRole()
    if (!admin) return { success: false, error: 'Unauthorized' }

    // Fetch current status and order items
    const { data: current } = await client
        .from('return_requests')
        .select('status, order_id, orders(order_number, order_items(product_id, quantity))')
        .eq('id', requestId)
        .single()

    const orderNumber = (current?.orders as any)?.order_number || 'Unknown'

    // Role check for re-approval
    if (current?.status === 'rejected' && status === 'approved') {
        if (admin.role !== 'main_admin') {
            return { success: false, error: 'Only Main Admin can re-approve rejected returns.' }
        }
    }

    const updates: any = { status, updated_at: new Date().toISOString() }
    if (adminNotes) updates.admin_notes = adminNotes

    // Auto-Restock Logic
    if (restockInventory && current?.orders) {
        const order = Array.isArray(current.orders) ? current.orders[0] : current.orders
        const orderItems = (order as any)?.order_items
        if (orderItems) {
            for (const item of orderItems as any[]) {
                if (item.product_id && item.quantity) {
                    await client.rpc('increment_product_stock', {
                        p_id: item.product_id,
                        p_qty: item.quantity
                    })
                }
            }
        }
    }

    // Delhivery Reverse Pickup Trigger
    if (status === 'approved') {
        try {
            const { createDelhiveryReturnShipment } = await import('../actions')
            const shipmentRes = await createDelhiveryReturnShipment(requestId)
            if (shipmentRes.success && shipmentRes.trackingNumber) {
                updates.tracking_number = shipmentRes.trackingNumber
            }
        } catch (e) {
            console.error('Delhivery pickup scheduling failed:', e)
        }
    }

    const { error, data: updatedReq } = await client
        .from('return_requests')
        .update(updates)
        .eq('id', requestId)
        .select('order_id')
        .single()

    if (error) return { success: false, error: error.message }

    // Trigger Notification
    await sendReturnStatusNotification(requestId, status, orderNumber)

    // Synchronize parent Order status
    if (updatedReq?.order_id) {
        let orderStatus = ''
        if (status === 'approved') orderStatus = 'returning'
        else if (status === 'refunded') orderStatus = 'refunded'
        else if (status === 'rejected') orderStatus = 'delivered'

        if (orderStatus) {
            await client
                .from('orders')
                .update({ status: orderStatus, updated_at: new Date().toISOString() })
                .eq('id', updatedReq.order_id)

            // Bust relevant caches
            bustCache('stats', 'recent-orders', 'revenue')
        }
    }

    // Log activity
    await client.from('admin_activity_logs').insert({
        admin_id: admin.userId,
        action: `Updated return request ${requestId} to ${status}`,
        entity_type: 'return_request',
        entity_id: requestId,
        details: { status, adminNotes, restockInventory }
    })

    return { success: true }
}
