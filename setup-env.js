const fs = require('fs');
const pub = fs.readFileSync('public_key.txt', 'utf8').trim();
const priv = fs.readFileSync('private_key.txt', 'utf8').trim();
const envContent = `
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${pub}
VAPID_PRIVATE_KEY=${priv}
VAPID_EMAIL=admin@aurerxa.com
`;
fs.appendFileSync('.env.local', envContent);
console.log('Appended VAPID keys to .env.local');
