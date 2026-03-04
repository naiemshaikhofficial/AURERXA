'use server'

import { revalidateTag } from 'next/cache'
import { supabaseServer, getAuthClient, checkIsAdmin, getCached } from './utils'
import { ActionResponse } from './types'
import { triggerOrderInvoice } from './orders'
import { createRazorpayOrder, verifyRazorpayPayment as verifyRazorpayPaymentLib } from '@/lib/razorpay'
import { encrypt, refundOrder } from '@/lib/ccavenue'

export type PaymentResult =
    | { success: true; gateway: 'ccavenue'; encRequest: string; accessCode: string; merchantId: string; actionUrl: string }
    | { success: true; gateway: 'razorpay'; keyId: string; amount: number; currency: string; razorpayOrderId: string; productName: string; customer: { name: string; email: string; contact: string } }
    | { success: true; gateway: 'free'; orderId: string }
    | { success: false; error: string };

export async function initiatePayment(orderId: string): Promise<PaymentResult> {
    const client = await getAuthClient()
    // Detect whether orderId is a UUID or an order_number (e.g. AUR-528879)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)
    const lookupField = isUUID ? 'id' : 'order_number'

    // Fetch order without join – profiles join requires a direct FK that doesn't exist
    const { data: order, error: orderErr } = await client.from('orders').select('*').eq(lookupField, orderId).single()
    if (orderErr || !order) return { success: false, error: 'Order not found' }

    // Separately fetch user profile for billing pre-fill (non-critical, fail gracefully)
    let profile: { full_name?: string; email?: string; phone_number?: string } = {}
    if (order.user_id) {
        const { data: profileData } = await client.from('profiles').select('full_name, email, phone_number').eq('id', order.user_id).maybeSingle()
        if (profileData) profile = profileData
    }


    if (order.total <= 0) {
        await client.from('orders').update({ status: 'confirmed', payment_status: 'paid', payment_method: 'Free' }).eq('id', orderId)
        return { success: true, gateway: 'free', orderId }
    }

    // CCAvenue Logic
    const merchantId = process.env.CCAVENUE_MERCHANT_ID
    const workingKey = process.env.CCAVENUE_WORKING_KEY
    const accessCode = process.env.CCAVENUE_ACCESS_CODE

    if (merchantId && workingKey && accessCode) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aurerxa.com'
        const redirectUrl = `${baseUrl}/api/payment/ccavenue/callback`
        const cancelUrl = `${baseUrl}/api/payment/ccavenue/callback`

        // Extract shipping address details
        const addr = order.shipping_address || {}
        // `profile` is already fetched above as a separate query

        const billingName = encodeURIComponent(addr.full_name || profile.full_name || '')
        const billingAddress = encodeURIComponent(addr.street_address || addr.address_line1 || '')
        const billingCity = encodeURIComponent(addr.city || '')
        const billingState = encodeURIComponent(addr.state || '')
        const billingZip = encodeURIComponent(addr.pincode || '')
        const billingCountry = encodeURIComponent('India')
        const billingTel = encodeURIComponent(addr.phone || profile.phone_number || '')
        const billingEmail = encodeURIComponent(profile.email || '')

        // Build parameter string following the CCAvenue NodeJS Integration Kit format
        const params = [
            `merchant_id=${merchantId}`,
            `order_id=${order.order_number}`,
            `currency=INR`,
            `amount=${order.total}`,
            `redirect_url=${encodeURIComponent(redirectUrl)}`,
            `cancel_url=${encodeURIComponent(cancelUrl)}`,
            `language=EN`,
            `integration_type=iframe_normal`,
            `merchant_param1=${order.id}`,
            // Billing details (optional, pre-fills payment page)
            `billing_name=${billingName}`,
            `billing_address=${billingAddress}`,
            `billing_city=${billingCity}`,
            `billing_state=${billingState}`,
            `billing_zip=${billingZip}`,
            `billing_country=${billingCountry}`,
            `billing_tel=${billingTel}`,
            `billing_email=${billingEmail}`,
            // Shipping details (same as billing for physical delivery)
            `delivery_name=${billingName}`,
            `delivery_address=${billingAddress}`,
            `delivery_city=${billingCity}`,
            `delivery_state=${billingState}`,
            `delivery_zip=${billingZip}`,
            `delivery_country=${billingCountry}`,
            `delivery_tel=${billingTel}`,
            // Customer identifier for returning customer recognition
            `customer_identifier=${encodeURIComponent(order.user_id || '')}`,
        ].join('&')

        const encRequest = encrypt(params, workingKey)
        return {
            success: true,
            gateway: 'ccavenue',
            encRequest,
            accessCode,
            merchantId,
            actionUrl: 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction'
        }
    }

    return { success: false, error: 'Payment gateway error' }
}

export async function verifyPayment(orderId: string, details: any = {}): Promise<ActionResponse> {
    const client = await getAuthClient()

    // 1. Log payment attempt
    await client.from('payment_logs').insert({ order_id: orderId, details, created_at: new Date().toISOString() })

    // 2. Gateway verification logic (Simplified for brevity)
    // In prod, this would call Razorpay.verify() or CCAvenue.verify()
    const isSuccess = details.status === 'success' || details.razorpay_payment_id || details.encResp

    if (isSuccess) {
        await client.from('orders').update({
            payment_status: 'paid',
            status: 'confirmed',
            payment_id: details.razorpay_payment_id || details.tracking_id,
            updated_at: new Date().toISOString()
        }).eq('id', orderId)

        // Trigger invoice
        triggerOrderInvoice(orderId)

        revalidateTag('orders')
        return { success: true }
    }

    return { success: false, error: 'Verification failed' }
}

export async function getOrderPaymentSession(orderId: string) {
    const client = await getAuthClient()
    const { data } = await client.from('orders').select('payment_id, payment_status, total').eq('id', orderId).single()
    return data || null
}

export async function processCCAvenueRefund(orderId: string, amount: number, reason: string): Promise<ActionResponse> {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return { success: false, error: 'Unauthorized' }

    const client = await getAuthClient()
    const { data: order } = await client.from('orders').select('payment_id').eq('id', orderId).single()
    if (!order?.payment_id) return { success: false, error: 'No payment record' }

    try {
        const result = await refundOrder(order.payment_id, amount.toString(), `REF-${Date.now()}`)
        if (result.status === '0' || result.refund_status === 'Success') {
            await client.from('orders').update({ payment_status: 'refunded' }).eq('id', orderId)
            return { success: true }
        }
        return { success: false, error: result.message || 'Refund failed' }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function getPaymentGatewayConfig() {
    return getCached('config:payment-gateway', 300, async () => {
        const { getSiteSetting: getSetting } = await import('./utils')
        const config = await getSetting('payment_config', {
            enable_cod: true,
            enable_ccavenue: true,
            enable_razorpay: false
        })
        return {
            enableCod: config.enable_cod,
            enableCCAvenue: config.enable_ccavenue,
            enableRazorpay: config.enable_razorpay
        }
    })
}

