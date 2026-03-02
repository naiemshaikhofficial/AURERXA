'use server'

import { revalidateTag, revalidatePath, unstable_cache } from 'next/cache'
import { supabaseServer, getAuthClient, checkIsAdmin, getSiteSetting, createSupabaseAdminClient } from './utils'
import { ActionResponse } from './types'
import { headers } from 'next/headers'
import { sendInvoiceEmail } from '@/lib/email'
import { getInvoiceEmailHtml } from '@/lib/templates/invoice-email'
import { generateInvoicePdf } from '@/lib/pdf-generator'
import { logDiagnostic } from '@/lib/logger'

// ============================================
// ORDER LIFECYCLE
// ============================================

export async function createOrder(addressId: string, paymentMethod: string, options: any = {}): Promise<ActionResponse> {
    try {
        const client = await getAuthClient()
        const { data: { user } } = await client.auth.getUser()
        if (!user) return { success: false, error: 'Authorization required' }

        // 1. Resolve shipping address
        let shippingAddress = options.address;
        if (!shippingAddress && addressId) {
            const { data: addr } = await client
                .from('addresses')
                .select('*')
                .eq('id', addressId)
                .single()
            if (addr) shippingAddress = addr
        }

        if (!shippingAddress) return { success: false, error: 'Shipping address required' }

        // 2. Get Cart items
        const { data: cartItems, error: cartError } = await client
            .from('cart')
            .select('*, products(*)')
            .eq('user_id', user.id)

        if (cartError || !cartItems || cartItems.length === 0) {
            return { success: false, error: 'Your cart is empty' }
        }

        // 3. Calculate totals
        let subtotal = 0;
        const orderItemsData = cartItems.map(item => {
            const product = Array.isArray(item.products) ? item.products[0] : item.products;
            const price = Number(product?.price || 0);
            subtotal += price * (item.quantity || 1);
            return {
                product_id: item.product_id,
                product_name: product?.name || 'Product',
                product_image: product?.image_url,
                quantity: item.quantity,
                size: item.size,
                price: price
            };
        });

        const shipping = options.shippingCost || 0;
        const discount = options.couponDiscount || 0;
        const total = subtotal + shipping - discount + (options.giftWrap ? 50 : 0);
        const orderNumber = `AUR-${Math.floor(100000 + Math.random() * 900000)}`;

        // 4. Insert Order
        const { data: order, error: orderError } = await client
            .from('orders')
            .insert({
                user_id: user.id,
                order_number: orderNumber,
                subtotal,
                shipping,
                total,
                shipping_address: shippingAddress,
                payment_method: paymentMethod,
                coupon_code: options.couponCode,
                coupon_discount: discount,
                gift_wrap: options.giftWrap,
                gift_message: options.giftMessage,
                delivery_time_slot: options.deliveryTimeSlot,
                status: 'pending',
                payment_status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (orderError) throw orderError;

        // 5. Insert Order Items
        const finalOrderItems = orderItemsData.map(item => ({
            ...item,
            order_id: order.id
        }));

        const { error: itemsError } = await client.from('order_items').insert(finalOrderItems)
        if (itemsError) throw itemsError;

        // 6. Clear Cart
        await client.from('cart').delete().eq('user_id', user.id)

        revalidateTag('orders', '')
        return { success: true, orderId: order.id, message: 'Order placed successfully' }
    } catch (err: any) {
        console.error('Create order error:', err)
        return { success: false, error: err.message }
    }
}

export async function cancelOrder(orderId: string, reason?: string): Promise<ActionResponse> {
    try {
        const client = await getAuthClient()
        const { data: { user } } = await client.auth.getUser()
        if (!user) return { success: false, error: 'Authorization required' }

        const { error } = await client
            .from('orders')
            .update({
                status: 'cancelled',
                updated_at: new Date().toISOString(),
                cancel_reason: reason || 'User cancelled'
            })
            .eq('id', orderId)
            .eq('user_id', user.id)
            .in('status', ['pending', 'processing'])

        if (error) throw error

        revalidateTag('orders', '')
        return { success: true, message: 'Your order has been cancelled successfully' }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function updateOrderStatus(orderId: string, status: string) {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin access required' }

    const client = await getAuthClient()

    const { data: order, error: fetchError } = await client
        .from('orders')
        .select('user_id, order_number')
        .eq('id', orderId)
        .single()

    if (fetchError || !order) return { success: false, error: 'Order not found' }

    const { error } = await client
        .from('orders')
        .update({
            status,
            updated_at: new Date().toISOString(),
            ...(status === 'cancelled' && { payment_status: 'awaiting_refund' }),
            ...(status === 'returned' && { return_status: 'completed' })
        })
        .eq('id', orderId)

    if (error) return { success: false, error: error.message }

    try {
        const { notifyOrderStatusChange } = await import('@/app/push-actions')
        await notifyOrderStatusChange(order.user_id, order.order_number, status)
    } catch (e) {
        console.error('Push notification failed for order update:', e)
    }

    return { success: true }
}

export async function getOrders() {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return []

    const { data, error } = await client
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return []
    return data
}

export async function getAdminOrders() {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return []

    const client = await getAuthClient()
    const { data, error } = await client
        .from('orders')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })

    if (error) return []
    return data
}

const _getCachedOrderById = unstable_cache(
    async (id: string, userId: string) => {
        const adminClient = createSupabaseAdminClient()
        const { data, error } = await adminClient
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', id)
            .eq('user_id', userId)
            .single()
        if (error) return null
        return data
    },
    ['order-detail'],
    { revalidate: 300, tags: ['orders'] }
)

export async function getOrderById(id: string) {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return null

    return _getCachedOrderById(id, user.id)
}

// ============================================
// RETURNS
// ============================================

export async function requestReturn(orderId: string, formData: any) {
    try {
        const client = await getAuthClient()
        const { data: { user } } = await client.auth.getUser()
        if (!user) return { success: false, error: 'Authorization required' }

        const { data: order } = await client
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', user.id)
            .single()

        if (!order || order.status !== 'delivered') {
            return { success: false, error: 'Order not eligible for return' }
        }

        const deliveredAt = new Date(order.updated_at).getTime()
        if (Date.now() - deliveredAt > 24 * 60 * 60 * 1000) {
            return { success: false, error: '24-hour return window expired' }
        }

        const { error } = await client
            .from('return_requests')
            .insert({
                order_id: orderId,
                user_id: user.id,
                ...formData,
                status: 'requested',
                created_at: new Date().toISOString()
            })

        if (error) throw error

        await client.from('orders').update({ status: 'return_requested' }).eq('id', orderId)

        revalidateTag('orders', '')
        return { success: true, message: 'Return request submitted successfully' }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function getReturnByOrderId(orderId: string) {
    const client = await getAuthClient()
    const { data, error } = await client
        .from('return_requests')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle()
    if (error) return null
    return data
}

export async function getReturnRequests() {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return []

    const client = await getAuthClient()
    const { data, error } = await client
        .from('return_requests')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })

    if (error) return []
    return data
}

// ============================================
// DELHIVERY LOGISTICS
// ============================================

export async function checkDeliveryAvailability(pincode: string) {
    try {
        if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
            return { success: false, error: 'Invalid pincode' }
        }

        const delhiveryToken = process.env.DELHIVERY_API_TOKEN
        const delhiveryUrl = process.env.DELHIVERY_API_URL || 'https://staging-express.delhivery.com'

        if (delhiveryToken) {
            const response = await fetch(`${delhiveryUrl}/c/api/pin-codes/json/?filter_codes=${pincode}`, {
                headers: { 'Authorization': `Token ${delhiveryToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                if (data.delivery_codes && data.delivery_codes.length > 0) {
                    const info = data.delivery_codes[0].postal_code
                    return {
                        success: true,
                        available: info.pre_paid === 'Y' || info.cod === 'Y',
                        location: `${info.district}, ${info.state_code}`,
                        codAvailable: info.cod === 'Y'
                    }
                }
            }
        }
        return { success: true, available: true, location: 'India' }
    } catch (err) {
        return { success: false, error: 'Unable to check delivery' }
    }
}

export async function getPincodeDetails(pincode: string) {
    try {
        const delhiveryToken = process.env.DELHIVERY_API_TOKEN
        const delhiveryUrl = process.env.DELHIVERY_API_URL || 'https://staging-express.delhivery.com'

        if (delhiveryToken) {
            const response = await fetch(`${delhiveryUrl}/c/api/pin-codes/json/?filter_codes=${pincode}`, {
                headers: { 'Authorization': `Token ${delhiveryToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                if (data.delivery_codes && data.delivery_codes.length > 0) {
                    const info = data.delivery_codes[0].postal_code
                    return {
                        success: true,
                        city: info.district,
                        stateCode: info.state_code
                    }
                }
            }
        }
        return { success: false, error: 'Pincode not found' }
    } catch (err) {
        return { success: false, error: 'Detection failed' }
    }
}

export async function calculateShippingRate(pincode: string, cartItems: any[], isCod: boolean = false) {
    const config = await getSiteSetting('shipping_config', { free_shipping_threshold: 50000, default_shipping_fee: 90 })
    let cartTotal = cartItems.reduce((acc, item) => acc + (item.products.price * item.quantity), 0)

    if (cartTotal >= config.free_shipping_threshold) return { success: true, rate: 0 }

    return { success: true, rate: config.default_shipping_fee || 90 }
}

export async function createDelhiveryShipment(orderId: string) {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return { success: false, error: 'Unauthorized' }

    return { success: true, trackingNumber: 'WAYBILL123' }
}

export async function createDelhiveryReturnShipment(requestId: string) {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return { success: false, error: 'Unauthorized' }

    return { success: true, trackingNumber: 'RET-WAYBILL-123' }
}

export async function getOrderTracking(orderId: string) {
    const client = await getAuthClient()
    const { data } = await client.from('orders').select('tracking_id, status').eq('id', orderId).single()
    if (!data?.tracking_id) return { success: false, status: 'processing', updates: [] }

    return {
        success: true,
        status: data.status,
        tracking_id: data.tracking_id,
        updates: [
            { status: 'Order Placed', date: new Date().toISOString() }
        ]
    }
}

// ============================================
// INVOICING
// ============================================

export async function triggerOrderInvoice(orderId: string) {
    logDiagnostic('INVOICE', `Triggering for order ID: ${orderId}`)
    try {
        const client = createSupabaseAdminClient()

        const { data: order, error } = await client
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', orderId)
            .single()

        if (error || !order) {
            logDiagnostic('INVOICE_ERROR', 'Order fetch failed', error)
            return
        }

        let name = order.shipping_address?.full_name || 'Valued Customer'
        let email = ''

        const { data: profile } = await client
            .from('profiles')
            .select('email, full_name')
            .eq('id', order.user_id)
            .single()

        if (profile) {
            if (name === 'Valued Customer' && profile.full_name) name = profile.full_name
            email = profile.email
        } else {
            const { data: { user } } = await client.auth.admin.getUserById(order.user_id)
            if (user && user.email) {
                email = user.email
            }
        }

        if (!email) return

        const invoiceData = {
            orderNumber: order.order_number,
            date: new Date(order.created_at).toLocaleDateString('en-IN'),
            customerName: name,
            customerEmail: email,
            shippingAddress: {
                line1: order.shipping_address?.street_address || '',
                city: order.shipping_address?.city || '',
                state: order.shipping_address?.state || '',
                postal_code: order.shipping_address?.pincode || '',
                phone: order.shipping_address?.phone || ''
            },
            items: order.order_items.map((item: any) => ({
                name: item.product_name,
                quantity: item.quantity,
                price: Number(item.price)
            })),
            total: Number(order.total)
        }

        const emailHtml = getInvoiceEmailHtml({
            customerName: name,
            orderNumber: order.order_number,
            total: invoiceData.total,
            transactionId: order.payment_id || 'N/A',
            paymentMethod: order.payment_method || 'N/A'
        })

        const pdfBuffer = await generateInvoicePdf(invoiceData as any)
        await sendInvoiceEmail(email, order.order_number, emailHtml, pdfBuffer)
        logDiagnostic('INVOICE_SUCCESS', `Email sent for #${order.order_number}`)

    } catch (err: any) {
        logDiagnostic('INVOICE_CRITICAL', `System failure for order ${orderId}`, err.message)
    }
}

export async function checkPendingOrder(productId?: string) {
    try {
        const client = await getAuthClient()
        const { data: { user } } = await client.auth.getUser()
        if (!user) return null

        if (productId) {
            // Find if this product is in any pending order of the user
            const { data } = await client
                .from('order_items')
                .select('order_id, orders!inner(status, payment_status)')
                .eq('product_id', productId)
                .eq('orders.user_id', user.id)
                .eq('orders.payment_status', 'pending')
                .maybeSingle()
            return data ? true : false
        }

        const { data, error } = await client
            .from('orders')
            .select('id, order_number')
            .eq('user_id', user.id)
            .eq('payment_status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error) throw error
        return data || null
    } catch (err: any) {
        console.error('checkPendingOrder error:', err)
        return null
    }
}

export async function submitBulkOrder(data: any) {
    try {
        const { BulkOrderSchema } = await import('./schemas')
        const validated = BulkOrderSchema.parse(data)
        const client = await getAuthClient()

        const { error } = await client.from('bulk_orders').insert([{
            business_name: validated.businessName,
            contact_name: validated.contactName,
            email: validated.email,
            phone: validated.phone,
            gst_number: validated.gstNumber,
            message: validated.message,
            items: validated.items,
            status: 'pending'
        }])

        if (error) return { success: false, error: error.message }
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function validateCoupon(code: string, subtotal: number, shipping: number): Promise<any> {
    try {
        const client = await getAuthClient()
        const { data: coupon, error } = await client
            .from('coupons')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .single()

        if (error || !coupon) return { valid: false, error: 'Invalid coupon code' }

        if (new Date(coupon.expires_at) < new Date()) {
            return { valid: false, error: 'Coupon has expired' }
        }

        if (subtotal < coupon.min_purchase) {
            return { valid: false, error: `Minimum purchase of ₹${coupon.min_purchase} required` }
        }

        let discount = 0
        if (coupon.type === 'percentage') {
            discount = Math.round((subtotal * coupon.value) / 100)
            if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount)
        } else if (coupon.type === 'fixed') {
            discount = coupon.value
        }

        return {
            valid: true,
            discount,
            message: `Coupon applied: ₹${discount} saved`,
            shippingDiscount: coupon.free_shipping ? shipping : 0
        }
    } catch (err: any) {
        return { valid: false, error: 'Failed to validate coupon' }
    }
}
