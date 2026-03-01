'use server'

import { supabaseServer, getAuthClient, checkIsAdmin } from './utils'
import { ActionResponse } from './types'
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
        const params = `merchant_id=${merchantId}&order_id=${order.order_number}&currency=INR&amount=${order.total}&redirect_url=...&cancel_url=...`
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

export async function processRefund(orderId: string, amount: number, reason: string): Promise<ActionResponse> {
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
