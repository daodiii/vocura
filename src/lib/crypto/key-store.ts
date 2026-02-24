// src/lib/crypto/key-store.ts

/**
 * In-memory encryption key store.
 * Key is stored in a closure — never on `window` or in localStorage.
 * Wiped on session timeout via clearSessionKey().
 */
let sessionKey: CryptoKey | null = null;

export function setSessionKey(key: CryptoKey): void {
  sessionKey = key;
}

export function getSessionKey(): CryptoKey | null {
  return sessionKey;
}

export function clearSessionKey(): void {
  sessionKey = null;
}

export function hasSessionKey(): boolean {
  return sessionKey !== null;
}
