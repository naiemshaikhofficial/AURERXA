import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/ccavenue';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { triggerOrderInvoice } from '@/app/actions';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const encResponse = formData.get('encResp') as string;

        if (!encResponse) {
            return NextResponse.redirect(new URL('/checkout?error=Payment response missing', req.url), 303);
        }

        const workingKey = process.env.CCAVENUE_WORKING_KEY;
        if (!workingKey) {
            throw new Error('Working key missing');
        }

        const decryptedResp = decrypt(encResponse, workingKey);
        const params = new URLSearchParams(decryptedResp);

        // Security / Audit Logging
        console.log('[CCAvenue Callback] Decrypted Response:', decryptedResp);

        const orderNumber = params.get('order_id');
        const merchantParam1 = params.get('merchant_param1'); // This is our internal UUID
        const orderStatus = params.get('order_status'); // Success, Failure, Aborted, Invalid
        const trackingId = params.get('tracking_id');
        const bankRefNo = params.get('bank_ref_no');
        const paymentMode = params.get('payment_mode');
        const amount = params.get('amount');

        if (!orderNumber && !merchantParam1) {
            throw new Error('Order identification missing in callback');
        }

        const supabase = await createSupabaseAdminClient();

        // Use merchant_param1 (UUID) if available, otherwise fallback to order_number
        const lookupId = merchantParam1 || orderNumber;
        const lookupField = merchantParam1 ? 'id' : 'order_number';

        // 1. Fetch current order state for verification
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('id, total, status, payment_status, order_number')
            .eq(lookupField, lookupId)
            .single();

        if (fetchError || !order) {
            console.error(`[CCAvenue Callback] Order not found for ${lookupField}: ${lookupId}`);
            return NextResponse.redirect(new URL(`/checkout?error=Order not found`, req.url), 303);
        }

        const internalOrderId = order.id;

        // 2. Idempotency check: Don't process if already paid
        if (order.status === 'confirmed' || order.payment_status === 'paid') {
            console.log(`[CCAvenue Callback] Order ${order.order_number} already processed.`);
            return NextResponse.redirect(new URL(`/account/orders/${order.order_number || internalOrderId}?success=true`, req.url), 303);
        }

        if (orderStatus === 'Success') {
            // 3. Security Check: Verify Amount
            const paidAmount = parseFloat(amount || "0");
            const expectedAmount = parseFloat(order.total.toString());

            if (Math.abs(paidAmount - expectedAmount) > 0.01) {
                console.error(`[SECURITY ALERT] CCAvenue Amount Mismatch for Order ${order.order_number}. Paid: ${paidAmount}, Expected: ${expectedAmount}`);
                await supabase.from('orders').update({
                    payment_status: 'flagged_mismatch',
                    status: 'payment_failed',
                    payment_id: trackingId,
                    updated_at: new Date().toISOString()
                }).eq('id', internalOrderId);

                return NextResponse.redirect(new URL(`/checkout/payment-retry/${order.order_number || internalOrderId}?status=mismatch`, req.url), 303);
            }

            // Update order to confirmed
            await supabase.from('orders').update({
                status: 'confirmed',
                payment_status: 'paid',
                payment_id: trackingId,
                payment_method: `CCAvenue (${paymentMode})`,
                bank_ref_no: bankRefNo,
                updated_at: new Date().toISOString()
            }).eq('id', internalOrderId);

            // Trigger invoice
            triggerOrderInvoice(internalOrderId).catch((err: any) => console.error('Invoice trigger error:', err));

            return NextResponse.redirect(new URL(`/account/orders/${order.order_number || internalOrderId}?success=true`, req.url), 303);
        } else {
            console.warn(`[CCAvenue Callback] Payment ${orderStatus} for Order ${order.order_number}`);

            // Update order as failed/aborted
            await supabase.from('orders').update({
                status: 'payment_failed',
                payment_status: orderStatus === 'Aborted' ? 'aborted' : 'failed',
                updated_at: new Date().toISOString()
            }).eq('id', internalOrderId);

            return NextResponse.redirect(new URL(`/checkout/payment-retry/${order.order_number || internalOrderId}?status=${orderStatus}`, req.url), 303);
        }
    } catch (err) {
        console.error('CCAvenue Callback Error:', err);
        return NextResponse.redirect(new URL('/checkout?error=Internal processing error', req.url), 303);
    }
}
