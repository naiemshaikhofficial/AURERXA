export interface InvoiceData {
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    phone: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    size?: string;
    price: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
}

export function getInvoiceHtml(data: InvoiceData) {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0;">
        <div style="display: flex; align-items: center;">
          <div style="flex: 1;">
            <p style="margin: 0; font-weight: 600; color: #111; font-size: 14px;">${item.name}</p>
            ${item.size ? `<p style="margin: 3px 0 0; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Size: ${item.size}</p>` : ''}
          </div>
        </div>
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0; text-align: center; color: #444;">${item.quantity}</td>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 500; color: #111;">₹${item.price.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your AURERXA Invoice</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border: 1px solid #eee; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
    .header { background-color: #000; color: #fff; padding: 40px; text-align: center; }
    .content { padding: 40px; }
    .invoice-title { font-size: 24px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 30px; border-bottom: 2px solid #D4AF37; display: inline-block; padding-bottom: 10px; }
    .details-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
    .details-label { color: #999; text-transform: uppercase; letter-spacing: 1px; }
    .details-value { font-weight: 600; color: #111; }
    .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
    .table th { text-align: left; border-bottom: 2px solid #111; padding-bottom: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; }
    .summary { margin-top: 30px; margin-left: auto; width: 250px; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .summary-label { color: #666; }
    .summary-value { font-weight: 600; color: #111; }
    .total-row { border-top: 2px solid #D4AF37; margin-top: 10px; padding-top: 15px; font-size: 18px; }
    .footer { padding: 40px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #999; }
    .accent { color: #D4AF37; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://aurerxa.com/logo-white.png" alt="AURERXA" style="width: 150px; margin-bottom: 10px;">
      <p style="font-size: 10px; letter-spacing: 3px; opacity: 0.6; margin: 0; text-transform: uppercase;">Excellence in Craftsmanship</p>
    </div>
    
    <div class="content">
      <div style="text-align: center;">
        <h1 class="invoice-title">Invoice</h1>
      </div>
      
      <div style="margin-bottom: 40px; font-size: 14px;">
        <p style="margin-bottom: 5px;"><strong style="font-size: 16px; color: #000;">Thank you for your order, ${data.customerName}!</strong></p>
        <p style="color: #666; margin-top: 0;">We are preparing your jewelry for dispatch. You will receive a tracking number once it's on the way.</p>
      </div>
      
      <div style="background: #fcfcfc; border: 1px solid #f0f0f0; padding: 20px; border-radius: 8px;">
        <div class="details-row">
          <span class="details-label">Order ID Number</span>
          <span class="details-value">#${data.orderNumber}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Order Date</span>
          <span class="details-value">${data.date}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Payment Method</span>
          <span class="details-value">${(data as any).paymentMethod || 'N/A'}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Transaction Number</span>
          <span class="details-value">${(data as any).transactionNumber || 'N/A'}</span>
        </div>
        <div class="details-row" style="margin-top: 15px; border-top: 1px solid #f0f0f0; padding-top: 15px;">
          <span class="details-label">Shipping To</span>
          <span class="details-value" style="text-align: right;">
            ${data.customerName}<br>
            ${data.shippingAddress.line1}<br>
            ${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.postal_code}<br>
            T: ${data.shippingAddress.phone}
          </span>
        </div>
      </div>
      
      <table class="table">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div class="summary">
        <div class="summary-row">
          <span class="summary-label">Subtotal</span>
          <span class="summary-value">₹${data.subtotal.toLocaleString('en-IN')}</span>
        </div>
        ${data.discount > 0 ? `
        <div class="summary-row">
          <span class="summary-label">Discount</span>
          <span class="summary-value" style="color: #6bca6b;">-₹${data.discount.toLocaleString('en-IN')}</span>
        </div>
        ` : ''}
        <div class="summary-row">
          <span class="summary-label">Shipping</span>
          <span class="summary-value">${data.shipping === 0 ? 'FREE' : `₹${data.shipping.toLocaleString('en-IN')}`}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Tax (GST)</span>
          <span class="summary-value">₹${data.tax.toLocaleString('en-IN')}</span>
        </div>
        <div class="summary-row total-row">
          <span class="summary-label" style="color: #000; font-weight: 700;">Grand Total</span>
          <span class="summary-value accent" style="font-size: 20px;">₹${data.total.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>If you have any questions regarding this invoice, please contact our concierge at <span class="accent">support@aurerxa.com</span></p>
      <p style="margin-top: 20px;">Captain Lakshmi Chowk, Rangargalli, Sangamner, Maharashtra 422605</p>
      <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} AURERXA. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
