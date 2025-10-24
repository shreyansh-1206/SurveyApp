import CryptoJS from 'crypto-js';

// Get encryption key from environment
const getEncryptionKey = () => {
  return process.env.EXPO_PUBLIC_ENCRYPTION_KEY || 'default-key-change-in-production';
};

/**
 * Encrypt sensitive data (e.g., Aadhar number)
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted data
 */
export const encrypt = (data) => {
  try {
    if (!data) return '';
    const key = getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(data, key).toString();
    return encrypted;
  } catch (e) {
    console.error('Encryption error:', e);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - Encrypted data
 * @returns {string} Decrypted data
 */
export const decrypt = (encryptedData) => {
  try {
    if (!encryptedData) return '';
    const key = getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (e) {
    console.error('Decryption error:', e);
    throw new Error('Failed to decrypt data');
  }
};