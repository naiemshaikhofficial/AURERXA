/**
 * Generates a branded HTML email body for order confirmations.
 */
export function getInvoiceEmailHtml(data: {
    customerName: string;
    orderNumber: string;
    total: number;
    transactionId: string;
    paymentMethod: string;
}) {
    const primaryColor = '#BF9B65'; // AURERXA gold
    const bgColor = '#000000';
    const textColor = '#FFFFFF';
    const accentColor = '#1A1A1A';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'serif', 'Georgia', Times, serif; background-color: ${bgColor}; color: ${textColor}; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: ${bgColor}; border: 1px solid #333; }
        .header { text-align: center; padding: 40px 20px; border-bottom: 1px solid #222; }
        .logo { font-size: 32px; letter-spacing: 5px; color: ${primaryColor}; font-weight: 300; text-transform: uppercase; }
        .content { padding: 40px; text-align: center; }
        .title { font-size: 24px; color: ${textColor}; margin-bottom: 20px; font-weight: 300; }
        .message { font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.7); margin-bottom: 30px; }
        .order-box { background-color: ${accentColor}; padding: 20px; border: 1px solid #333; margin-bottom: 30px; }
        .order-label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: ${primaryColor}; margin-bottom: 5px; }
        .order-value { font-size: 20px; font-weight: 400; color: #fff; }
        .button { display: inline-block; padding: 15px 40px; background-color: ${primaryColor}; color: #000; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; font-weight: 600; margin-top: 20px; }
        .footer { padding: 40px; background-color: #0a0a0a; border-top: 1px solid #222; text-align: center; }
        .social-links { margin-bottom: 25px; }
        .social-link { display: inline-block; margin: 0 10px; color: rgba(255,255,255,0.5); text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        .social-link:hover { color: ${primaryColor}; }
        .contact-info { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.8; margin-top: 20px; border-top: 1px solid #222; padding-top: 20px; }
        .attachment-note { font-size: 12px; color: ${primaryColor}; font-style: italic; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">AURERXA</div>
        </div>
        <div class="content">
            <h1 class="title">Thank You for Your Order, ${data.customerName}</h1>
            <p class="message">
                Your request for luxury has been received. We are currently preparing your masterpiece with the utmost care and precision.
            </p>
            <div class="order-box">
                <div class="order-label">Order ID Number</div>
                <div class="order-value">#${data.orderNumber}</div>
                <div style="margin-top: 10px;">
                    <div class="order-label">Transaction Number</div>
                    <div class="order-value">${data.transactionId || 'N/A'}</div>
                </div>
                <div style="margin-top: 10px;">
                    <div class="order-label">Payment Method</div>
                    <div class="order-value">${data.paymentMethod || 'N/A'}</div>
                </div>
                <div style="margin-top: 10px;">
                    <div class="order-label">Amount Paid</div>
                    <div class="order-value">₹${data.total.toLocaleString('en-IN')}</div>
                </div>
            </div>
            <p class="attachment-note">Please find your official invoice attached as a PDF to this email.</p>
            <a href="https://aurerxa.com/account/orders" class="button">Track Order</a>
        </div>
        <div class="footer">
            <div class="social-links">
                <a href="https://instagram.com/aurerxa" class="social-link">Instagram</a>
                <a href="https://aurerxa.com" class="social-link">Website</a>
                <a href="https://wa.me/+919999999999" class="social-link">WhatsApp</a>
            </div>
            <div class="contact-info">
                © ${new Date().getFullYear()} AURERXA. All rights reserved.<br>
                For concierge assistance: contact@aurerxa.com<br>
                Crafted with Passion for Eternal Elegance.
            </div>
        </div>
    </div>
</body>
</html>
    `;
}
