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
    paymentMethod: string;
    transactionNumber: string;
}

/**
 * Generates a professional PDF invoice buffer using jsPDF.
 */
export async function generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
    console.log(`[PDF] Generating premium invoice PDF for Order #${data.orderNumber}...`);
    const doc = new jsPDF() as any;

    const GOLD: [number, number, number] = [191, 155, 101];
    const BLACK: [number, number, number] = [0, 0, 0];
    const GRAY: [number, number, number] = [100, 100, 100];
    const LIGHT_GRAY: [number, number, number] = [240, 240, 240];

    // --- Header & Brand ---
    doc.setFontSize(26);
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('AURERXA', 105, 20, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('NIJAM GOLD WORKS', 105, 26, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text('Eternal Luxury & Heritage Mastery', 105, 30, { align: 'center' });

    // Gold Divider
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // --- Invoice Metadata ---
    doc.setFontSize(14);
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', 20, 45);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: #${data.orderNumber}`, 190, 45, { align: 'right' });
    doc.text(`Date: ${data.date}`, 190, 50, { align: 'right' });

    // --- Seller & Buyer Info ---
    doc.setFont('helvetica', 'bold');
    doc.text('FROM:', 20, 60);
    doc.text('BILL TO:', 110, 60);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    // Seller Details
    doc.text('NIJAM GOLD WORKS (AURERXA)', 20, 65);
    doc.text('Rangargalli, Sangamner, MS 422605', 20, 69);
    doc.text('GSTIN: Unregistered Consumer', 20, 73);
    doc.text('PAN: ABCDE0000F', 20, 77);
    doc.text('Mobile: +91 7776818394', 20, 81);

    // Buyer Details
    doc.setFont('helvetica', 'bold');
    doc.text(data.customerName, 110, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(data.customerEmail, 110, 69);
    doc.text(data.shippingAddress.line1, 110, 73);
    doc.text(`${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.postal_code}`, 110, 77);
    doc.text(`Phone: ${data.shippingAddress.phone}`, 110, 81);

    // --- Items Table ---
    const tableData = data.items.map((item, idx) => [
        idx + 1,
        item.name + (item.size ? `\nSize: ${item.size}` : ''),
        item.quantity,
        `₹${item.price.toLocaleString('en-IN')}`,
        `₹${(item.price * item.quantity).toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
        startY: 90,
        head: [['#', 'Description of Goods', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'plain',
        headStyles: {
            fillColor: BLACK,
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
        },
        styles: {
            font: 'helvetica',
            fontSize: 8,
            cellPadding: 3,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { cellWidth: 90 },
            2: { halign: 'center', cellWidth: 15 },
            3: { halign: 'right', cellWidth: 30 },
            4: { halign: 'right', cellWidth: 30 }
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // --- Summary Section ---
    const summaryX = 130;
    doc.setFontSize(9);

    const drawRow = (label: string, value: string, y: number, isBold = false) => {
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.text(label, summaryX, y);
        doc.text(value, 190, y, { align: 'right' });
    };

    let currentSumY = finalY;
    drawRow('Subtotal:', `₹${data.subtotal.toLocaleString('en-IN')}`, currentSumY);
    currentSumY += 6;

    if (data.discount > 0) {
        drawRow('Discount:', `-₹${data.discount.toLocaleString('en-IN')}`, currentSumY);
        currentSumY += 6;
    }

    drawRow('Shipping:', data.shipping === 0 ? 'FREE' : `₹${data.shipping.toLocaleString('en-IN')}`, currentSumY);
    currentSumY += 6;

    drawRow('GST (Included 3%):', `₹${data.tax.toLocaleString('en-IN')}`, currentSumY);
    currentSumY += 8;

    // Total box
    doc.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
    doc.rect(summaryX - 5, currentSumY - 5, 65, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL:', summaryX, currentSumY + 2);
    doc.text(`₹${data.total.toLocaleString('en-IN')}`, 190, currentSumY + 2, { align: 'right' });

    // --- Footer & Signature ---
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Note: This is a computer generated invoice and does not require signature.', 20, pageHeight - 35);
    doc.text('7 Day exchange policy | Original tag must be intact.', 20, pageHeight - 31);

    // Signature Area
    doc.setFont('helvetica', 'bold');
    doc.text('For NIJAM GOLD WORKS', 190, pageHeight - 35, { align: 'right' });
    doc.setDrawColor(200);
    doc.line(140, pageHeight - 20, 190, pageHeight - 20);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Signatory', 165, pageHeight - 15, { align: 'center' });

    // Final Brand Footer
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.line(20, pageHeight - 10, 190, pageHeight - 10);
    doc.setFontSize(7);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text('www.aurerxa.com | Instagram: @aurerxa_official', 105, pageHeight - 7, { align: 'center' });

    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer);
}
