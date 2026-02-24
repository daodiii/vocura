// src/lib/auth/bankid.ts
import crypto from 'crypto';

interface CriiptoClaims {
  identityscheme?: string;
  nameidentifier?: string;
  name?: string;
  dateOfBirth?: string;
  pid?: string;
  sub?: string;
}

export function parseCriiptoClaims(
  metadata: Record<string, unknown>
): CriiptoClaims {
  return {
    identityscheme: metadata.identityscheme as string | undefined,
    nameidentifier: metadata.nameidentifier as string | undefined,
    name: metadata.name as string | undefined,
    dateOfBirth: metadata.dateOfBirth as string | undefined,
    pid: metadata.pid as string | undefined,
    sub: metadata.sub as string | undefined,
  };
}

export function extractIdentityLevel(
  metadata: Record<string, unknown>
): 'bankid' | 'buypass' | null {
  const scheme = metadata.identityscheme as string | undefined;
  if (!scheme) return null;
  if (scheme.includes('bankid') || scheme === 'nobankid') return 'bankid';
  if (scheme.includes('buypass') || scheme === 'nobuypass') return 'buypass';
  return null;
}

export function isAuthenticatedViaBankId(
  metadata: Record<string, unknown>
): boolean {
  return extractIdentityLevel(metadata) !== null;
}

export function hashNationalId(pid: string): string {
  return crypto.createHash('sha256').update(pid).digest('hex');
}
