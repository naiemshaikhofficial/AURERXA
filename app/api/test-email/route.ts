
import { NextResponse } from 'next/server'
import { sendInvoiceEmail } from '@/lib/email'
import { getInvoiceEmailHtml } from '@/lib/templates/invoice-email'
import { generateInvoicePdf } from '@/lib/pdf-generator'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

/**
 * GET /api/test-email
 * 
 * Diagnostic endpoint to test the full invoice email pipeline.
 * Tests: Resend API key → PDF generation → MIME construction → Email send
 * 
 * IMPORTANT: Remove this endpoint after debugging is complete.
 */
export async function GET(request: Request) {
    const results: Record<string, any> = {
        timestamp: new Date().toISOString(),
        steps: [],
        env: {
            RESEND_API_KEY: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 8)}...` : 'NOT SET',
            SES_SENDER_EMAIL: process.env.SES_SENDER_EMAIL || 'NOT SET',
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (hidden)' : 'NOT SET',
        },
    }

    // Step 1: Check Resend API Key
    if (!process.env.RESEND_API_KEY) {
        results.steps.push({ step: '1. Resend API Key', status: 'FAIL', error: 'RESEND_API_KEY is not configured in .env.local' })
        return NextResponse.json(results, { status: 500 })
    }
    results.steps.push({ step: '1. Resend API Key', status: 'OK' })

    // Step 2: Find a recent order and its user email
    let testEmail = ''
    let testOrderNumber = 'TEST-0000'
    try {
        const client = createSupabaseAdminClient()
        const { data: recentOrder, error: orderErr } = await client
            .from('orders')
            .select('id, order_number, user_id, shipping_address')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (orderErr || !recentOrder) {
            results.steps.push({ step: '2. Fetch Recent Order', status: 'FAIL', error: orderErr?.message || 'No orders found' })
            return NextResponse.json(results, { status: 500 })
        }

        testOrderNumber = recentOrder.order_number
        results.steps.push({ step: '2. Fetch Recent Order', status: 'OK', order: testOrderNumber, userId: recentOrder.user_id })

        // Step 3: Get user email
        const { data: profile } = await client
            .from('profiles')
            .select('email, full_name')
            .eq('id', recentOrder.user_id)
            .single()

        if (profile?.email) {
            testEmail = profile.email
            results.steps.push({ step: '3. Get User Email (profile)', status: 'OK', email: testEmail })
        } else {
            const { data: { user }, error: authErr } = await client.auth.admin.getUserById(recentOrder.user_id)
            if (user?.email) {
                testEmail = user.email
                results.steps.push({ step: '3. Get User Email (auth fallback)', status: 'OK', email: testEmail })
            } else {
                results.steps.push({ step: '3. Get User Email', status: 'FAIL', error: authErr?.message || 'No email in profile or auth' })
                return NextResponse.json(results, { status: 500 })
            }
        }
    } catch (err: any) {
        results.steps.push({ step: '2-3. DB Access', status: 'FAIL', error: err.message })
        return NextResponse.json(results, { status: 500 })
    }

    // Step 4: Generate PDF
    let pdfBuffer: Buffer
    try {
        pdfBuffer = await generateInvoicePdf({
            orderNumber: testOrderNumber,
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
            customerName: 'Test Customer',
            customerEmail: testEmail,
            shippingAddress: { line1: 'Test Address', city: 'Mumbai', state: 'Maharashtra', postal_code: '400001', phone: '+91 9999999999' },
            items: [{ name: 'Test Product', quantity: 1, size: 'M', price: 999 }],
            subtotal: 999, shipping: 0, discount: 0, tax: 29, total: 999,
            paymentMethod: 'Prepaid',
            transactionNumber: 'TEST-TXN-123'
        })
        results.steps.push({ step: '4. PDF Generation', status: 'OK', sizeBytes: pdfBuffer.length })
    } catch (err: any) {
        results.steps.push({ step: '4. PDF Generation', status: 'FAIL', error: err.message, stack: err.stack?.substring(0, 300) })
        return NextResponse.json(results, { status: 500 })
    }

    // Step 5: Generate HTML body
    let emailHtml: string
    try {
        emailHtml = getInvoiceEmailHtml({
            customerName: 'Test Customer',
            orderNumber: testOrderNumber,
            total: 999,
            transactionId: 'TEST-TXN-123',
            paymentMethod: 'Prepaid'
        })
        results.steps.push({ step: '5. Email HTML Template', status: 'OK', htmlLength: emailHtml.length })
    } catch (err: any) {
        results.steps.push({ step: '5. Email HTML Template', status: 'FAIL', error: err.message })
        return NextResponse.json(results, { status: 500 })
    }

    // Step 6: Send Email via Resend
    try {
        const sendResult = await sendInvoiceEmail(testEmail, testOrderNumber, emailHtml, pdfBuffer)
        if (sendResult.success) {
            results.steps.push({ step: '6. Resend Email Send', status: 'OK', messageId: sendResult.messageId })
        } else {
            results.steps.push({ step: '6. Resend Email Send', status: 'FAIL', error: sendResult.error })
        }
    } catch (err: any) {
        results.steps.push({ step: '6. Resend Email Send', status: 'FAIL', error: err.message, stack: err.stack?.substring(0, 300) })
    }

    results.overallStatus = results.steps.every((s: any) => s.status === 'OK') ? 'ALL PASSED ✅' : 'SOME FAILED ❌'
    return NextResponse.json(results, { status: results.overallStatus.includes('PASSED') ? 200 : 500 })
}
