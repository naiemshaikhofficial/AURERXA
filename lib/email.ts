import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import nodemailer from 'nodemailer';
import { logDiagnostic } from './logger';

const SES_REGION = process.env.AWS_SES_REGION || 'ap-south-1';
const SENDER_EMAIL = process.env.SES_SENDER_EMAIL || 'orders@aurerxa.com';

const sesClient = new SESv2Client({
    region: SES_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

/**
 * Sends an invoice email with a PDF attachment using AWS SES v2.
 * Uses Nodemailer as a raw MIME generator to ensure attachments work perfectly.
 */
export async function sendInvoiceEmail(
    to: string,
    orderNumber: string,
    htmlBody: string,
    pdfBuffer: Buffer
) {
    logDiagnostic('EMAIL', `Attempting to send invoice for Order #${orderNumber} to ${to}`);

    try {
        // 1. Check if we have credentials
        if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'YOUR_AWS_ACCESS_KEY_ID') {
            logDiagnostic('EMAIL_ERROR', 'AWS Credentials not configured in .env.local');
            return { success: false, error: 'AWS Configuration Missing' };
        }

        // 2. Generate the raw MIME message using Nodemailer stream transport
        const transporter = nodemailer.createTransport({
            streamTransport: true,
            newline: 'unix',
            buffer: true,
        });

        const mailOptions = {
            from: `"AURERXA" <${SENDER_EMAIL}>`,
            to,
            subject: `Invoice for your order #${orderNumber}`,
            html: htmlBody,
            attachments: [
                {
                    filename: `AURERXA-Invoice-${orderNumber}.pdf`,
                    content: pdfBuffer,
                },
            ],
        };

        const info: any = await transporter.sendMail(mailOptions);
        const rawMessage = info.message; // Buffer containing raw MIME

        logDiagnostic('EMAIL', `MIME message generated (${rawMessage.length} bytes). Sending via RAW SES...`);

        // 3. Send the raw message via SES v2 SendEmailCommand
        const command = new SendEmailCommand({
            Content: {
                Raw: {
                    Data: rawMessage,
                },
            },
        });

        const response = await sesClient.send(command);
        logDiagnostic('EMAIL_SUCCESS', 'SES Send Successful', {
            messageId: response.MessageId,
            to
        });

        return { success: true, messageId: response.MessageId };
    } catch (error: any) {
        logDiagnostic('EMAIL_ERROR', 'SES Send Failed', {
            error: error.message,
            code: error.code,
            metadata: error.$metadata,
            to
        });
        return { success: false, error: error.message };
    }
}
