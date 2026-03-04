import crypto from 'node:crypto';

/**
 * Ported from CCAvenue NodeJS Integration Kit (AES-128-CBC)
 * The working key is MD5 hashed to create the 16-byte key.
 * A static IV is used as per the official documentation/kit.
 */
export function encrypt(plainText: string, workingKey: string): string {
    const m = crypto.createHash('md5');
    m.update(workingKey);
    const key = m.digest(); // Node.js default digest is 'binary' as Buffer
    // Static IV: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    const iv = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);

    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    let encoded = cipher.update(plainText, 'utf8', 'hex');
    encoded += cipher.final('hex');
    return encoded;
}

/**
 * Decrypts encrypted text using the AES-128-CBC logic.
 */
export function decrypt(encText: string, workingKey: string): string {
    const m = crypto.createHash('md5');
    m.update(workingKey);
    const key = m.digest();
    const iv = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);

    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    let decoded = decipher.update(encText, 'hex', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
}

/**
 * CCAvenue Refund Implementation (Merchant API V1.2)
 * Note: Requires the server IP to be whitelisted in CCAvenue dashboard.
 */
export async function refundOrder(orderNumber: string, amount: string, refundRefNo: string) {
    const merchantId = process.env.CCAVENUE_MERCHANT_ID;
    const workingKey = process.env.CCAVENUE_WORKING_KEY;
    const accessCode = process.env.CCAVENUE_ACCESS_CODE;

    if (!merchantId || !workingKey || !accessCode) {
        throw new Error('Merchant credentials missing in environment.');
    }

    // Parameters for refundOrder command
    const requestData = [
        `reference_no=${orderNumber}`,
        `amount=${amount}`,
        `refund_ref_no=${refundRefNo}`,
        `command=refundOrder`
    ].join('&');

    const encRequest = encrypt(requestData, workingKey);

    const response = await fetch('https://api.ccavenue.com/apis/servlet/DoWebTrans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            enc_request: encRequest,
            access_code: accessCode,
            request_type: 'JSON',
            command: 'refundOrder',
            merchant_id: merchantId
        })
    });

    if (!response.ok) {
        throw new Error(`CCAvenue Refund API Error: ${response.statusText}`);
    }

    const encResponse = await response.text();

    // Attempt decryption if response is encrypted hex
    if (/^[0-9a-f]+$/i.test(encResponse)) {
        try {
            const decrypted = decrypt(encResponse, workingKey);
            return JSON.parse(decrypted);
        } catch (e) {
            return { raw: encResponse, error: 'Decryption/Parse Failed' };
        }
    }

    // Check if it's already a JSON string or plain error
    try {
        return JSON.parse(encResponse);
    } catch (e) {
        return { status: 'unknown', raw: encResponse };
    }
}
