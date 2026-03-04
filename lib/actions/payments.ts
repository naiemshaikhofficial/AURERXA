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
    const { data: order } = await client.from('orders').select('*').eq('id', orderId).single()
    if (!order) return { success: false, error: 'Order not found' }

    if (order.total <= 0) {
        await client.from('orders').update({ status: 'confirmed', payment_status: 'paid', payment_method: 'Free' }).eq('id', orderId)
        return { success: true, gateway: 'free', orderId }
    }

    // CCAvenue Logic
    const merchantId = process.env.CCAVENUE_MERCHANT_ID
    const workingKey = process.env.CCAVENUE_WORKING_KEY
    const accessCode = process.env.CCAVENUE_ACCESS_CODE

    if (merchantId && workingKey && accessCode) {
        // Use environment variable for base URL or fallback to window.location (client will handle)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aurerxa.com'
        const redirectUrl = `${baseUrl}/api/payment/ccavenue/callback`
        const cancelUrl = `${baseUrl}/api/payment/ccavenue/callback`

        const params = `merchant_id=${merchantId}&order_id=${order.order_number}&currency=INR&amount=${order.total}&redirect_url=${encodeURIComponent(redirectUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}&language=EN&integration_type=iframe_normal&merchant_param1=${order.id}`

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

        revalidateTag('orders', '')
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
