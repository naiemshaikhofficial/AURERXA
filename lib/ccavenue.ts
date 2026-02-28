import crypto from 'node:crypto';

/**
 * Ported from CCAvenue NodeJS Integration Kit (AES-128-CBC)
 * The working key is MD5 hashed to create the 16-byte key.
 * A static IV is used as per the official documentation/kit.
 */
export function encrypt(plainText: string, workingKey: string): string {
    const m = crypto.createHash('md5');
    m.update(workingKey);
    const key = m.digest();
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
