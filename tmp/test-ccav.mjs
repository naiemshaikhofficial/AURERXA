import { encrypt, decrypt } from '../lib/ccavenue.js';

async function testCCAvenue() {
    const workingKey = '1234567890ABCDEF1234567890ABCDEF'; // 32 chars
    const plainText = 'merchant_id=123&order_id=987&amount=10.00&currency=INR';

    console.log('Testing AES-128-CBC with MD5 key derivation (ESM)...');
    console.log('Original Text:', plainText);

    try {
        const encrypted = encrypt(plainText, workingKey);
        console.log('Encrypted (Hex):', encrypted);

        const decrypted = decrypt(encrypted, workingKey);
        console.log('Decrypted Text:', decrypted);

        if (plainText === decrypted) {
            console.log('✅ SUCCESS: Encryption/Decryption cycle matches!');
        } else {
            console.log('❌ FAILURE: Decrypted text does not match original!');
        }
    } catch (err) {
        console.error('❌ ERROR during test:', err);
    }
}

testCCAvenue();
