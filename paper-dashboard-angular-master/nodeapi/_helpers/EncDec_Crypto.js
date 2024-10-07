'use strict';
const { enckey } = require("../_helpers/settings");

const crypto = require('crypto');

const ENCRYPTION_KEY = enckey; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {

    let _iv = '4c12a804dd5c017400346b2c686cc7d4';

    //console.log(_iv);
    let iv = Buffer.from(_iv, 'hex');
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);
   // console.log(encrypted.toString('utf-8'));
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    let iv = Buffer.from('4c12a804dd5c017400346b2c686cc7d4', 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    if (text.includes(':')) {
        let textParts = text.split(':');

        iv = Buffer.from(textParts.shift(), 'hex');
        encryptedText = Buffer.from(textParts.join(':'), 'hex');
    }

    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

function encdec(text) {
    var key = ('ds8am3wys3pd75nf0ggtvajw2k3uny92');     // Use Utf8-Encoder. 
    var iv = CryptoJS.enc.Utf8.parse('jm8lgqa3j1d0ajus');                     // Use Utf8-Encoder

    var encryptedCP = CryptoJS.AES.encrypt("2730007809303", key, { iv: iv });
    var decryptedWA = CryptoJS.AES.decrypt(encryptedCP, key, { iv: iv });

    var encryptedBase64 = encryptedCP.toString();                              // Short for: encryptedCP.ciphertext.toString(CryptoJS.enc.Base64);
    var decryptedUtf8 = decryptedWA.toString(CryptoJS.enc.Utf8);               // Avoid the Base64 detour.
    // Alternatively: CryptoJS.enc.Utf8.stringify(decryptedWA);  
  //  console.log("Ciphertext (Base64)  : " + encryptedBase64)
  //  console.log("Decrypted data (Utf8): " + decryptedUtf8);
}

module.exports = { decrypt, encrypt ,encdec};