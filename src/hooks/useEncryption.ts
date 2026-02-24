// src/hooks/useEncryption.ts
'use client';

import { useCallback } from 'react';
import {
  encryptNote,
  decryptNote,
  type EncryptedPayload,
} from '@/lib/crypto/encryption';
import { getSessionKey, hasSessionKey } from '@/lib/crypto/key-store';

export function useEncryption() {
  const isReady = hasSessionKey();

  const encrypt = useCallback(async (plaintext: string): Promise<EncryptedPayload> => {
    const key = getSessionKey();
    if (!key) throw new Error('Krypteringsnøkkel ikke tilgjengelig. Logg inn på nytt.');
    return encryptNote(plaintext, key);
  }, []);

  const decrypt = useCallback(async (payload: EncryptedPayload): Promise<string> => {
    const key = getSessionKey();
    if (!key) throw new Error('Krypteringsnøkkel ikke tilgjengelig. Logg inn på nytt.');
    return decryptNote(payload, key);
  }, []);

  return { encrypt, decrypt, isReady };
}
