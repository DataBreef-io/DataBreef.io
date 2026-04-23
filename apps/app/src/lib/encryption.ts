import CryptoJS from "crypto-js";

const MASTER_KEY = process.env.MASTER_ENCRYPTION_KEY || "default-dev-key-please-change-in-production";

/**
 * Encrypts a sensitive string (like a connection string) using AES-256.
 */
export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, MASTER_KEY).toString();
}

/**
 * Decrypts a sensitive string.
 */
export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, MASTER_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
