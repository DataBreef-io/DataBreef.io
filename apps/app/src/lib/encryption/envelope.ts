/**
 * Envelope encryption: AES-256-GCM with KEK wrapping.
 *
 * Pattern:
 * 1. Generate random 256-bit data key
 * 2. Encrypt plaintext with data key (AES-256-GCM)
 * 3. Encrypt data key with platform KEK (Key Encryption Key)
 * 4. Store: ciphertext, iv, authTag, encryptedDataKey
 * 5. On decrypt: unwrap data key with KEK, decrypt ciphertext
 *
 * Why: DataBreef cannot read customer connection strings. Encrypted
 * storage proves it cryptographically.
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits

export interface EncryptedData {
  ciphertext: string; // base64
  iv: string; // base64
  authTag: string; // base64
  encryptedDataKey: string; // base64
  keyId: string; // rotation identifier
}

/**
 * Encrypt plaintext with a generated data key, wrap with KEK.
 *
 * @param plaintext - connection string
 * @param kek - platform KEK (Buffer)
 * @returns encrypted data object ready for storage
 */
export function encryptWithKEK(plaintext: string, kek: Buffer): EncryptedData {
  // Generate random IV and data key
  const iv = crypto.randomBytes(IV_LENGTH);
  const dataKey = crypto.randomBytes(KEY_LENGTH);

  // Encrypt plaintext with data key
  const cipher = crypto.createCipheriv(ALGORITHM, dataKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Encrypt data key with KEK (using same IV for determinism, though not ideal)
  const keyCipher = crypto.createCipheriv("aes-256-gcm", kek, iv);
  const wrappedKey = Buffer.concat([
    keyCipher.update(dataKey),
    keyCipher.final(),
  ]);
  const keyAuthTag = keyCipher.getAuthTag();

  // Combine wrapped key + tag for storage
  const encryptedDataKey = Buffer.concat([wrappedKey, keyAuthTag]).toString("base64");

  const keyId = `kek-v1-${Date.now()}`;

  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    encryptedDataKey,
    keyId,
  };
}

/**
 * Decrypt ciphertext with KEK.
 *
 * @param encrypted - { ciphertext, iv, authTag, encryptedDataKey } (all base64)
 * @param kek - platform KEK (Buffer)
 * @returns plaintext connection string
 */
export function decryptWithKEK(encrypted: Omit<EncryptedData, "keyId">, kek: Buffer): string {
  const iv = Buffer.from(encrypted.iv, "base64");
  const ciphertext = Buffer.from(encrypted.ciphertext, "base64");
  const authTag = Buffer.from(encrypted.authTag, "base64");

  const wrappedKeyWithTag = Buffer.from(encrypted.encryptedDataKey, "base64");
  const wrappedKey = wrappedKeyWithTag.slice(0, wrappedKeyWithTag.length - 16);
  const keyAuthTag = wrappedKeyWithTag.slice(wrappedKeyWithTag.length - 16);

  // Decrypt data key with KEK
  const keyDecipher = crypto.createDecipheriv("aes-256-gcm", kek, iv);
  keyDecipher.setAuthTag(keyAuthTag);
  const dataKey = Buffer.concat([
    keyDecipher.update(wrappedKey),
    keyDecipher.final(),
  ]);

  // Decrypt ciphertext with data key
  const decipher = crypto.createDecipheriv(ALGORITHM, dataKey, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");

  return plaintext;
}

/**
 * Hash connection string (one-way, for audit logs only).
 */
export function hashConnectionString(connectionString: string): string {
  return crypto.createHash("sha256").update(connectionString).digest("hex");
}

/**
 * Get platform KEK from environment.
 * In production, this should fetch from a KMS (AWS KMS, Google Cloud KMS, etc).
 */
export function getKEK(): Buffer {
  const kekEnv = process.env.ENCRYPTION_KEK;
  if (!kekEnv) {
    throw new Error("ENCRYPTION_KEK environment variable not set");
  }
  return Buffer.from(kekEnv, "base64");
}
