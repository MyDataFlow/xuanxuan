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
    const paddedData = AES.padding.pkcs7.pad(dataBytes);
    const encryptedBytes = aesCbc.encrypt(paddedData);
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
    const utf8Array = new Uint8Array(data);
    const decryptedBytes = aesCbc.decrypt(utf8Array);
    const decryptedText = AES.utils.utf8.fromBytes(AES.padding.pkcs7.strip(decryptedBytes));
    return decryptedText;
};

export default {
    encrypt,
    decrypt
};
