import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/ccavenue';
import { createSupabaseServerClient } from '@/lib/supabase-server';
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

        const orderId = params.get('order_id');
        const orderStatus = params.get('order_status'); // Success, Failure, Aborted, Invalid
        const trackingId = params.get('tracking_id');
        const bankRefNo = params.get('bank_ref_no');
        const paymentMode = params.get('payment_mode');

        const supabase = await createSupabaseServerClient();

        // Detect if orderId is UUID or Order Number
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId || "");
        const queryField = isUUID ? 'id' : 'order_number';

        if (orderStatus === 'Success') {
            // Update order to confirmed
            await supabase.from('orders').update({
                status: 'confirmed',
                payment_status: 'paid',
                payment_id: trackingId,
                payment_method: `CCAvenue (${paymentMode})`,
                bank_ref_no: bankRefNo,
                updated_at: new Date().toISOString()
            }).eq(queryField, orderId);

            // Trigger invoice
            if (orderId) {
                // If we have an order number, triggerOrderInvoice might need the UUID. 
                // But triggerOrderInvoice is already written to handle order lookup by ID.
                // We should find the actual order ID first if we have the order number.
                let actualOrderId = orderId;
                if (!isUUID) {
                    const { data: orderData } = await supabase
                        .from('orders')
                        .select('id')
                        .eq('order_number', orderId)
                        .single();
                    if (orderData) actualOrderId = orderData.id;
                }

                triggerOrderInvoice(actualOrderId).catch((err: any) => console.error('Invoice trigger error:', err));
            }

            return NextResponse.redirect(new URL(`/account/orders/${orderId}?success=true`, req.url), 303);
        } else {
            // Update order as failed/aborted
            await supabase.from('orders').update({
                status: 'payment_failed',
                payment_status: 'failed',
                updated_at: new Date().toISOString()
            }).eq(queryField, orderId);

            return NextResponse.redirect(new URL(`/checkout/payment-retry/${orderId}?status=${orderStatus}`, req.url), 303);
        }
    } catch (err) {
        console.error('CCAvenue Callback Error:', err);
        return NextResponse.redirect(new URL('/checkout?error=Internal processing error', req.url), 303);
    }
}
