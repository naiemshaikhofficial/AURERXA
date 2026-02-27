import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts plain text using a working key for CCAvenue.
 * Ported from CCAvenue NodeJS Integration Kit (AES-256-GCM)
 */
export function encrypt(plainText: string, workingKey: string): string {
    const key = Buffer.from(workingKey, 'hex'); // CCAvenue working key is usually hex
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
        cipher.update(plainText, 'utf8'),
        cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    // Format: IV (12 bytes) + Encrypted Payload + Auth Tag (16 bytes)
    return iv.toString('hex') + Buffer.concat([encrypted, authTag]).toString('hex');
}

/**
 * Decrypts encrypted text using a working key for CCAvenue.
 */
export function decrypt(encryptedText: string, workingKey: string): string {
    const key = Buffer.from(workingKey, 'hex');
    const encryptedBuffer = Buffer.from(encryptedText, 'hex');

    const iv = encryptedBuffer.slice(0, IV_LENGTH);
    const authTag = encryptedBuffer.slice(-AUTH_TAG_LENGTH);
    const ciphertext = encryptedBuffer.slice(IV_LENGTH, -AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
    ]);

    return decrypted.toString('utf8');
}
