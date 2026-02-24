// src/lib/crypto/encryption.ts

export interface EncryptedPayload {
  ciphertext: string; // base64
  iv: string; // base64
}

/**
 * Derive an AES-256-GCM encryption key from a password and salt using PBKDF2.
 * Key is non-extractable for security.
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // non-extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext using AES-256-GCM.
 * Returns base64-encoded ciphertext and IV.
 */
export async function encryptNote(
  plaintext: string,
  key: CryptoKey
): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );

  return {
    ciphertext: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
  };
}

/**
 * Decrypt ciphertext using AES-256-GCM.
 * Returns the original plaintext string.
 */
export async function decryptNote(
  payload: EncryptedPayload,
  key: CryptoKey
): Promise<string> {
  const decoder = new TextDecoder();
  const iv = base64ToUint8Array(payload.iv);
  const ciphertext = base64ToUint8Array(payload.ciphertext);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    ciphertext as BufferSource
  );

  return decoder.decode(decrypted);
}

/**
 * Generate a random 16-byte salt for key derivation.
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Convert salt to base64 string for storage.
 */
export function saltToBase64(salt: Uint8Array): string {
  return arrayBufferToBase64(salt.buffer as ArrayBuffer);
}

/**
 * Convert base64 string back to salt.
 */
export function base64ToSalt(b64: string): Uint8Array {
  return base64ToUint8Array(b64);
}

// --- Helpers ---

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
