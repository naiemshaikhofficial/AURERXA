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
 * Tries Raw email first (for PDF attachment), falls back to Simple email if
 * the IAM user lacks ses:SendRawEmail permission.
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

        // 2. Try RAW email (with PDF attachment) first
        try {
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

            const rawCommand = new SendEmailCommand({
                Content: {
                    Raw: {
                        Data: rawMessage,
                    },
                },
            });

            const response = await sesClient.send(rawCommand);
            logDiagnostic('EMAIL_SUCCESS', 'SES RAW Send Successful', {
                messageId: response.MessageId,
                to,
            });

            return { success: true, messageId: response.MessageId };
        } catch (rawError: any) {
            // If the error is an authorization issue specifically for SendRawEmail,
            // fall back to Simple email (no attachment)
            const isAuthError = rawError.message?.includes('not authorized') ||
                rawError.Code === 'AccessDenied' ||
                rawError.name === 'AccessDeniedException';

            if (isAuthError) {
                logDiagnostic('EMAIL_WARNING', `RAW send not authorized, falling back to SIMPLE email (no PDF attachment). Error: ${rawError.message}`);

                // Fallback: Send email WITHOUT attachment using Simple content
                const simpleCommand = new SendEmailCommand({
                    FromEmailAddress: `"AURERXA" <${SENDER_EMAIL}>`,
                    Destination: {
                        ToAddresses: [to],
                    },
                    Content: {
                        Simple: {
                            Subject: {
                                Data: `Invoice for your order #${orderNumber}`,
                                Charset: 'UTF-8',
                            },
                            Body: {
                                Html: {
                                    Data: htmlBody,
                                    Charset: 'UTF-8',
                                },
                            },
                        },
                    },
                });

                const fallbackResponse = await sesClient.send(simpleCommand);
                logDiagnostic('EMAIL_SUCCESS', 'SES SIMPLE Send Successful (no PDF attachment)', {
                    messageId: fallbackResponse.MessageId,
                    to,
                });

                return { success: true, messageId: fallbackResponse.MessageId, note: 'Sent without PDF attachment (IAM permission missing for ses:SendRawEmail)' };
            }

            // Re-throw if it's a different kind of error
            throw rawError;
        }
    } catch (error: any) {
        console.error('[SES CRITICAL ERROR]', error);
        logDiagnostic('EMAIL_ERROR', 'SES Send Failed', {
            error: error.message,
            code: error.code || error.Code,
            name: error.name,
            stack: error.stack?.substring(0, 500),
            to
        });
        return { success: false, error: error.message };
    }
}
