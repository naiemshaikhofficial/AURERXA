import { Resend } from 'resend';
import { logDiagnostic } from './logger';

// ─── ACTIVE PROVIDER: RESEND ─────────────────────────────────────────
const SENDER_EMAIL = process.env.SES_SENDER_EMAIL || 'orders@aurerxa.com';
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an invoice email with a PDF attachment using Resend.
 * Resend supports attachments natively and has no sandbox restrictions.
 */
export async function sendInvoiceEmail(
    to: string,
    orderNumber: string,
    htmlBody: string,
    pdfBuffer: Buffer
) {
    logDiagnostic('EMAIL', `Attempting to send invoice for Order #${orderNumber} to ${to}`);

    try {
        // 1. Check if we have the API key
        if (!process.env.RESEND_API_KEY) {
            logDiagnostic('EMAIL_ERROR', 'RESEND_API_KEY is not configured');
            return { success: false, error: 'Resend API Key Missing' };
        }

        // 2. Send email with PDF attachment via Resend
        const { data, error } = await resend.emails.send({
            from: `AURERXA <${SENDER_EMAIL}>`,
            to: [to],
            subject: `Invoice for your order #${orderNumber}`,
            html: htmlBody,
            attachments: [
                {
                    filename: `AURERXA-Invoice-${orderNumber}.pdf`,
                    content: pdfBuffer,
                },
            ],
        });

        if (error) {
            console.error('[RESEND ERROR]', error);
            logDiagnostic('EMAIL_ERROR', 'Resend Send Failed', {
                error: error.message,
                name: error.name,
                to
            });
            return { success: false, error: error.message };
        }

        logDiagnostic('EMAIL_SUCCESS', 'Resend Send Successful', {
            messageId: data?.id,
            to,
        });

        return { success: true, messageId: data?.id };
    } catch (error: any) {
        console.error('[RESEND CRITICAL ERROR]', error);
        logDiagnostic('EMAIL_ERROR', 'Resend Send Failed', {
            error: error.message,
            stack: error.stack?.substring(0, 500),
            to
        });
        return { success: false, error: error.message };
    }
}

// ─── PRESERVED: AWS SES IMPLEMENTATION (activate when SES Production access is approved) ───
//
// To switch back to AWS SES:
// 1. Uncomment the SES code below
// 2. Comment out the Resend code above
// 3. Ensure AWS env vars are set: AWS_SES_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, SES_SENDER_EMAIL
//
// import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
// import nodemailer from 'nodemailer';
//
// const SES_REGION = process.env.AWS_SES_REGION || 'ap-south-1';
// const sesClient = new SESv2Client({
//     region: SES_REGION,
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//     },
// });
//
// export async function sendInvoiceEmail(to, orderNumber, htmlBody, pdfBuffer) {
//     const transporter = nodemailer.createTransport({ streamTransport: true, newline: 'unix', buffer: true });
//     const info = await transporter.sendMail({
//         from: `"AURERXA" <${SENDER_EMAIL}>`, to,
//         subject: `Invoice for your order #${orderNumber}`,
//         html: htmlBody,
//         attachments: [{ filename: `AURERXA-Invoice-${orderNumber}.pdf`, content: pdfBuffer }],
//     });
//     const command = new SendEmailCommand({ Content: { Raw: { Data: info.message } } });
//     const response = await sesClient.send(command);
//     return { success: true, messageId: response.MessageId };
// }
