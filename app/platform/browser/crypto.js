import AES from 'aes-js';

/**
 * Encrypt data with aes
 * @param  {string} data
 * @return {Buffer}
 */
const encrypt = (data, token, cipherIV) => {
    const key = AES.utils.utf8.toBytes(token);
    const iv = AES.utils.utf8.toBytes(cipherIV);
    const aesCbc = new AES.ModeOfOperation.cbc(key, iv);
    const dataBytes = AES.utils.utf8.toBytes(data);
    const encryptedBytes = aesCbc.encrypt(textBytes);
    return encryptedBytes;
}

/**
 * Decrypt data
 * @param  {Buffer} data
 * @return {string}
 */
const decrypt = (data, token, cipherIV) => {
    const key = AES.utils.utf8.toBytes(token);
    const iv = AES.utils.utf8.toBytes(cipherIV);
    const aesCbc = new AES.ModeOfOperation.cbc(key, iv);
    const decryptedBytes = aesCbc.decrypt(data);
    const decryptedText = AES.utils.utf8.fromBytes(decryptedBytes);
    return decryptedText;
};

export default {
    encrypt,
    decrypt
};
