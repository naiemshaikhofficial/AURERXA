import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoiceItem {
    name: string;
    quantity: number;
    size?: string;
    price: number;
}

export interface InvoicePdfData {
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
    items: InvoiceItem[];
    subtotal: number;
    shipping: number;
    discount: number;
    tax: number;
    total: number;
}

/**
 * Generates a professional PDF invoice buffer using jsPDF.
 */
export async function generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
    console.log(`[PDF] Generating invoice PDF for Order #${data.orderNumber}...`);
    const doc = new jsPDF() as any;

    // --- Header & Brand ---
    doc.setFontSize(24);
    doc.setTextColor(191, 155, 101); // AURERXA Gold
    doc.text('AURERXA', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Eternal Luxury & Heritage Mastery', 105, 27, { align: 'center' });

    // --- Invoice Title ---
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('TAX INVOICE', 20, 45);

    // --- Order Details ---
    doc.setFontSize(10);
    doc.text(`Order: #${data.orderNumber}`, 20, 55);
    doc.text(`Date: ${data.date}`, 20, 60);

    // --- Customer Details ---
    doc.text('BILL TO:', 20, 75);
    doc.setFont('helvetica', 'bold');
    doc.text(data.customerName, 20, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(data.customerEmail, 20, 85);
    doc.text(data.shippingAddress.line1, 20, 90);
    doc.text(`${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.postal_code}`, 20, 95);
    doc.text(`Phone: ${data.shippingAddress.phone}`, 20, 100);

    // --- Items Table ---
    const tableData = data.items.map(item => [
        item.name + (item.size ? ` (Size: ${item.size})` : ''),
        item.quantity,
        `₹${item.price.toLocaleString('en-IN')}`,
        `₹${(item.price * item.quantity).toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
        startY: 110,
        head: [['Item Description', 'Qty', 'Unit Price', 'Amount']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [191, 155, 101], textColor: [0, 0, 0] },
        styles: { font: 'helvetica', fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'right' }
        }
    });

    // --- Totals ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalsX = 140;

    doc.text('Subtotal:', totalsX, finalY);
    doc.text(`₹${data.subtotal.toLocaleString('en-IN')}`, 190, finalY, { align: 'right' });

    doc.text('Shipping:', totalsX, finalY + 7);
    doc.text(data.shipping === 0 ? 'FREE' : `₹${data.shipping.toLocaleString('en-IN')}`, 190, finalY + 7, { align: 'right' });

    if (data.discount > 0) {
        doc.text('Discount:', totalsX, finalY + 14);
        doc.text(`-₹${data.discount.toLocaleString('en-IN')}`, 190, finalY + 14, { align: 'right' });
    }

    doc.text('GST (Included):', totalsX, finalY + 21);
    doc.text(`₹${data.tax.toLocaleString('en-IN')}`, 190, finalY + 21, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', totalsX, finalY + 30);
    doc.text(`₹${data.total.toLocaleString('en-IN')}`, 190, finalY + 30, { align: 'right' });

    // --- Footer ---
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    const footerY = doc.internal.pageSize.height - 20;
    doc.text('Thank you for choosing AURERXA Heritage.', 105, footerY, { align: 'center' });
    doc.text('This is a computer-generated invoice and does not require a signature.', 105, footerY + 5, { align: 'center' });
    doc.text('aurerxa.com | Instagram: @aurerxa', 105, footerY + 10, { align: 'center' });

    // Return as Buffer
    const arrayBuffer = doc.output('arraybuffer');
    const resultBuffer = Buffer.from(arrayBuffer);
    console.log(`[PDF] Invoice PDF generated successfully for Order #${data.orderNumber} (${resultBuffer.length} bytes)`);
    return resultBuffer;
}
