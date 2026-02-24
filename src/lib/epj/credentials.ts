import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import type { LeyrCredentials } from './types';

const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
  const hex = process.env.EPJ_ENCRYPTION_KEY;
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(
      'EPJ_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)'
    );
  }
  return Buffer.from(hex, 'hex');
}

export function encryptCredentials(credentials: LeyrCredentials): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(credentials), 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptCredentials(stored: string): LeyrCredentials {
  const key = getKey();
  const buf = Buffer.from(stored, 'base64');
  if (buf.length < 29) {
    throw new Error('Encrypted credential data is too short or corrupted');
  }
  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  const raw = JSON.parse(decrypted.toString('utf8'));
  if (!raw.clientId || !raw.clientSecret || !raw.careUnitId || !raw.epjSystem) {
    throw new Error('Decrypted credentials have invalid shape');
  }
  return raw as LeyrCredentials;
}
