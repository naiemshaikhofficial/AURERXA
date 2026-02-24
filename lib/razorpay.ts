const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const getAuthHeader = () => {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay credentials not found');
    }
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    return `Basic ${auth}`;
};

export async function createRazorpayOrder(amount: number, currency: string, receipt: string) {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
        },
        body: JSON.stringify({
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt,
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.description || 'Failed to create Razorpay order');
    }
    return data;
}

export async function verifyRazorpayPayment(paymentId: string, orderId: string, signature: string) {
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
            'Authorization': getAuthHeader(),
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.description || 'Failed to verify Razorpay payment');
    }

    // Check if payment is captured or authorized correctly
    const isValid = data.status === 'captured' || data.status === 'authorized';

    return {
        isValid,
        amount: data.amount, // in paise
        method: data.method, // upi, card, netbanking, etc.
        card_network: data.card?.network,
        card_type: data.card?.type,
        vpa: data.vpa // for UPI
    };
}
