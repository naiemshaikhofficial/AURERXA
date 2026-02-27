import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/ccavenue';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { triggerOrderInvoice } from '@/app/actions';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const encResponse = formData.get('encResp') as string;

        if (!encResponse) {
            return NextResponse.redirect(new URL('/checkout?error=Payment response missing', req.url));
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

        if (orderStatus === 'Success') {
            // Update order to confirmed
            await supabase.from('orders').update({
                status: 'confirmed',
                payment_status: 'paid',
                payment_id: trackingId,
                payment_method: `CCAvenue (${paymentMode})`,
                bank_ref_no: bankRefNo,
                updated_at: new Date().toISOString()
            }).eq('id', orderId);

            // Trigger invoice
            if (orderId) {
                triggerOrderInvoice(orderId).catch((err: any) => console.error('Invoice trigger error:', err));
            }

            return NextResponse.redirect(new URL(`/account/orders/${orderId}?success=true`, req.url));
        } else {
            // Update order as failed/aborted
            await supabase.from('orders').update({
                status: 'payment_failed',
                payment_status: 'failed',
                updated_at: new Date().toISOString()
            }).eq('id', orderId);

            return NextResponse.redirect(new URL(`/checkout/payment-retry/${orderId}?status=${orderStatus}`, req.url));
        }
    } catch (err) {
        console.error('CCAvenue Callback Error:', err);
        return NextResponse.redirect(new URL('/checkout?error=Internal processing error', req.url));
    }
}
