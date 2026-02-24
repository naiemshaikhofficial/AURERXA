const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_MODE = process.env.CASHFREE_MODE || 'sandbox';

const BASE_URL = CASHFREE_MODE === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

export async function createCashfreeOrder(orderData: {
    order_id: string;
    order_amount: number;
    order_currency: string;
    customer_details: {
        customer_id: string;
        customer_phone: string;
        customer_email?: string;
        customer_name?: string;
    };
    order_meta?: {
        return_url: string;
        notify_url?: string;
        payment_methods?: string;
    };
}) {
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
        throw new Error('Cashfree credentials are not configured');
    }

    const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY,
            'x-api-version': '2023-08-01',
        },
        body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('Cashfree order creation failed:', data);
        throw new Error(data.message || 'Failed to create Cashfree order');
    }

    return data;
}

export async function getCashfreeOrder(cfOrderId: string) {
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
        throw new Error('Cashfree credentials are not configured');
    }

    const response = await fetch(`${BASE_URL}/orders/${cfOrderId}`, {
        method: 'GET',
        headers: {
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY,
            'x-api-version': '2023-08-01',
        },
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('Cashfree order fetch failed:', data);
        throw new Error(data.message || 'Failed to fetch Cashfree order');
    }

    return data;
}

export async function getCashfreePayments(cfOrderId: string) {
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
        throw new Error('Cashfree credentials are not configured');
    }

    const response = await fetch(`${BASE_URL}/orders/${cfOrderId}/payments`, {
        method: 'GET',
        headers: {
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY,
            'x-api-version': '2023-08-01',
        },
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('Cashfree payments fetch failed:', data);
        throw new Error(data.message || 'Failed to fetch Cashfree payments');
    }

    return data;
}
