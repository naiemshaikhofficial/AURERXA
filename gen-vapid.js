const webpush = require('web-push');
const fs = require('fs');
const vapidKeys = webpush.generateVAPIDKeys();
fs.writeFileSync('public_key.txt', vapidKeys.publicKey);
fs.writeFileSync('private_key.txt', vapidKeys.privateKey);
console.log('Saved keys to separate files');
