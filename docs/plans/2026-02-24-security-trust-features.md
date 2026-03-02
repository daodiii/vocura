# Security & Trust Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Achieve security feature parity with Journalia.no — add BankID/Buypass auth, E2E encryption, auto-delete retention, Normen compliance, and a public security page to Vocura.

**Architecture:** Supabase Auth OIDC for BankID via Criipto provider, Web Crypto API for client-side AES-256-GCM encryption (following existing pattern in `src/lib/epj/credentials.ts`), Prisma models for clinical notes with retention policies, pg_cron for automated cleanup. No new npm packages — all built on platform APIs.

**Tech Stack:** Next.js 16 + Supabase Auth OIDC + Web Crypto API + Prisma + pg_cron

---

## Task 1: Root Middleware — Centralized Route Protection

**Files:**
- Create: `src/middleware.ts`

**Step 1: Create the root middleware**

```typescript
// src/middleware.ts
import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/personvern',
  '/vilkar',
  '/sikkerhet',
  '/databehandleravtale',
  '/docs',
];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Allow public routes
  if (PUBLIC_ROUTES.some((r) => path === r || path.startsWith(r + '/'))) {
    return supabaseResponse;
  }

  // Allow API routes and auth callbacks (they handle their own auth)
  if (path.startsWith('/api/') || path.startsWith('/auth/')) {
    return supabaseResponse;
  }

  // Allow static assets
  if (path.startsWith('/_next/') || path.includes('.')) {
    return supabaseResponse;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
```

**Step 2: Verify the dev server starts without errors**

Run: `cd /Users/daodilyas/SpeechToText && npx next dev`
Expected: Server starts, visiting `/dashboard` without auth redirects to `/login`, visiting `/` works without auth.

**Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add root middleware for centralized route protection"
```

---

## Task 2: Shared API Auth Helper

**Files:**
- Create: `src/lib/api-auth.ts`

**Step 1: Create the shared auth helper**

```typescript
// src/lib/api-auth.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface AuthResult {
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> };
  supabase: Awaited<ReturnType<typeof createClient>>;
}

type AuthResponse = AuthResult | NextResponse;

export async function requireAuth(): Promise<AuthResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: 'Ikke autentisert. Vennligst logg inn.' },
      { status: 401 }
    );
  }

  return { user, supabase };
}

export function isAuthResponse(result: AuthResponse): result is NextResponse {
  return result instanceof NextResponse;
}
```

**Step 2: Verify it compiles**

Run: `cd /Users/daodilyas/SpeechToText && npx tsc --noEmit src/lib/api-auth.ts` (or just start dev server)
Expected: No type errors.

**Step 3: Commit**

```bash
git add src/lib/api-auth.ts
git commit -m "feat: add shared API auth helper (requireAuth)"
```

---

## Task 3: CSP Updates for BankID/Criipto

**Files:**
- Modify: `next.config.ts:3-16`

**Step 1: Update the CSP directives to allow Criipto and BankID domains**

In `next.config.ts`, update the `connect-src` and add `frame-src` for BankID:

```typescript
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://api.openai.com https://cdn.jsdelivr.net https://*.criipto.id",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.criipto.id",
  "frame-src 'self' https://*.criipto.id https://*.bankid.no https://*.buypass.no",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");
```

**Step 2: Verify dev server starts**

Run: `cd /Users/daodilyas/SpeechToText && npx next dev`
Expected: No errors, existing functionality unchanged.

**Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: update CSP to allow Criipto/BankID/Buypass domains"
```

---

## Task 4: Database Schema — Identity & Retention Models

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Add identity fields to User model and new models**

Add these fields to the existing `User` model (after `address`):

```prisma
  identityLevel  String?  @map("identity_level")
  authProvider   String?  @default("email") @map("auth_provider")
  nationalIdHash String?  @unique @map("national_id_hash")
  encryptionSalt String?  @map("encryption_salt")
```

Add the `User` relation to the new models + `auditLogs` and `clinicalNotes` relations. Then add these new models after `EpjIntegration`:

```prisma
model ClinicalNote {
  id               String    @id @default(uuid())
  userId           String    @map("user_id")
  patientId        String?   @map("patient_id")
  contentEncrypted String    @map("content_encrypted")
  contentIv        String?   @map("content_iv")
  templateType     String?   @map("template_type")
  epjTransferred   Boolean   @default(false) @map("epj_transferred")
  epjTransferredAt DateTime? @map("epj_transferred_at")
  retentionHours   Int       @default(48) @map("retention_hours")
  deleteAfter      DateTime? @map("delete_after")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  @@index([deleteAfter])
  @@index([userId])
  @@map("clinical_notes")
}

model RetentionSettings {
  id                 String   @id @default(uuid())
  userId             String   @unique @map("user_id")
  textRetentionHours Int      @default(48) @map("text_retention_hours")
  autoDeleteEnabled  Boolean  @default(true) @map("auto_delete_enabled")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  @@map("retention_settings")
}
```

**Step 2: Generate Prisma client and create migration**

Run: `cd /Users/daodilyas/SpeechToText && npx prisma generate && npx prisma migrate dev --name security_features`
Expected: Migration created and applied successfully.

**Step 3: Commit**

```bash
git add prisma/
git commit -m "feat: add identity fields, ClinicalNote, RetentionSettings models"
```

---

## Task 5: BankID Auth Helpers

**Files:**
- Create: `src/lib/auth/bankid.ts`

**Step 1: Create the BankID helper module**

```typescript
// src/lib/auth/bankid.ts
import crypto from 'crypto';

interface CriiptoClaims {
  identityscheme?: string;
  nameidentifier?: string;
  name?: string;
  dateOfBirth?: string;
  // Norwegian BankID specific
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
```

**Step 2: Verify it compiles**

Run: `cd /Users/daodilyas/SpeechToText && npx tsc --noEmit`
Expected: No type errors.

**Step 3: Commit**

```bash
git add src/lib/auth/bankid.ts
git commit -m "feat: add BankID/Buypass auth helpers (claim parsing, PID hashing)"
```

---

## Task 6: Login Page — Add BankID Button

**Files:**
- Modify: `src/app/login/page.tsx`

**Step 1: Add the BankID login button above the existing form**

Add `Shield` to the lucide-react import. Then after the `<h1>` and `<p>` subtitle, before the `{/* Form Card */}` comment, add the BankID section inside the form card, above the `<form>`:

```tsx
{/* BankID Login */}
{isLogin && (
  <div className="mb-6">
    <button
      type="button"
      onClick={async () => {
        setError('');
        setLoading(true);
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'keycloak' as any,
            options: {
              redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
              scopes: 'openid profile',
            },
          });
          if (error) throw error;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'BankID-innlogging feilet';
          setError(message);
          setLoading(false);
        }
      }}
      disabled={loading}
      className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg bg-[#2B2D42] hover:bg-[#1E2036] text-white font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Shield className="w-4.5 h-4.5" />
      Logg inn med BankID
    </button>

    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[rgba(255,255,255,0.06)]" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-3 bg-[#191919] text-xs text-[#5C5C5C]">
          eller logg inn med e-post
        </span>
      </div>
    </div>
  </div>
)}
```

Note: The `provider` value will need to match whatever you configure in Supabase OIDC settings. The `'keycloak' as any` is a placeholder — Supabase custom OIDC providers use the provider name you set in the dashboard. Update this after Criipto setup.

**Step 2: Verify the login page renders correctly**

Run: `cd /Users/daodilyas/SpeechToText && npx next dev`
Expected: Login page shows BankID button above the email form with a divider. BankID button only shows in login mode, not signup.

**Step 3: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "feat: add BankID login button to login page"
```

---

## Task 7: Auth Callback — Handle BankID Provider

**Files:**
- Modify: `src/app/auth/callback/route.ts`

**Step 1: Extend the callback to handle BankID identity linking**

```typescript
// src/app/auth/callback/route.ts
export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { extractIdentityLevel, hashNationalId, parseCriiptoClaims } from '@/lib/auth/bankid';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const metadata = data.user.user_metadata || {};
      const identityLevel = extractIdentityLevel(metadata);

      // If this is a BankID/Buypass login, update user profile
      if (identityLevel) {
        const claims = parseCriiptoClaims(metadata);
        const nationalIdHash = claims.pid ? hashNationalId(claims.pid) : null;

        try {
          await prisma.user.upsert({
            where: { id: data.user.id },
            update: {
              identityLevel,
              authProvider: identityLevel,
              ...(nationalIdHash ? { nationalIdHash } : {}),
              ...(claims.name ? { name: claims.name } : {}),
            },
            create: {
              id: data.user.id,
              email: data.user.email || '',
              name: claims.name || data.user.email || 'Ukjent',
              identityLevel,
              authProvider: identityLevel,
              ...(nationalIdHash ? { nationalIdHash } : {}),
            },
          });
        } catch (err) {
          console.error('Failed to update user profile after BankID auth:', err);
        }
      }
    }
  }

  return NextResponse.redirect(new URL(redirect, request.url));
}
```

**Step 2: Verify it compiles**

Run: `cd /Users/daodilyas/SpeechToText && npx tsc --noEmit`
Expected: No type errors.

**Step 3: Commit**

```bash
git add src/app/auth/callback/route.ts
git commit -m "feat: handle BankID identity linking in auth callback"
```

---

## Task 8: Audit Log — Add New Entity Types

**Files:**
- Modify: `src/lib/audit.ts:4-8`

**Step 1: Extend the AuditLogParams entityType and action unions**

```typescript
interface AuditLogParams {
    userId: string;
    entityType: 'journal_entry' | 'form_submission' | 'patient' | 'recording' | 'epj_push' | 'patient_context_import' | 'epj_integration' | 'clinical_note' | 'retention_settings' | 'auto_delete';
    entityId: string;
    action: 'create' | 'update' | 'delete' | 'approve' | 'push' | 'search' | 'auto_delete' | 'encrypt' | 'decrypt';
    changes?: Record<string, unknown>;
    content?: string;
    ipAddress?: string;
}
```

Also add `'auto_delete'` to the `CRITICAL_ACTIONS` array:

```typescript
const CRITICAL_ACTIONS: AuditLogParams['action'][] = ['delete', 'approve', 'push', 'auto_delete'];
```

**Step 2: Verify it compiles**

Run: `cd /Users/daodilyas/SpeechToText && npx tsc --noEmit`
Expected: No type errors.

**Step 3: Commit**

```bash
git add src/lib/audit.ts
git commit -m "feat: extend audit log with retention/encryption entity types"
```

---

## Task 9: Validation Schemas — Retention & Clinical Notes

**Files:**
- Modify: `src/lib/validations.ts`

**Step 1: Add new Zod schemas at the end of the file**

```typescript
// --- Retention ---
export const retentionSettingsSchema = z.object({
  textRetentionHours: z.number().int().min(1).max(168).default(48),
  autoDeleteEnabled: z.boolean().default(true),
});

// --- Clinical Notes ---
export const clinicalNoteCreateSchema = z.object({
  patientId: z.string().max(200).optional(),
  contentEncrypted: z.string().min(1, 'Kryptert innhold er påkrevd').max(5_000_000),
  contentIv: z.string().max(100).optional(),
  templateType: z.string().max(100).optional(),
});

export const clinicalNoteUpdateSchema = z.object({
  contentEncrypted: z.string().min(1).max(5_000_000).optional(),
  contentIv: z.string().max(100).optional(),
  epjTransferred: z.boolean().optional(),
});

// --- Cleanup (cron) ---
export const cleanupSchema = z.object({
  secret: z.string().min(1, 'CRON_SECRET er påkrevd'),
});
```

**Step 2: Verify it compiles**

Run: `cd /Users/daodilyas/SpeechToText && npx tsc --noEmit`
Expected: No type errors.

**Step 3: Commit**

```bash
git add src/lib/validations.ts
git commit -m "feat: add Zod schemas for retention settings and clinical notes"
```

---

## Task 10: Retention Logic Library

**Files:**
- Create: `src/lib/retention.ts`

**Step 1: Create the retention logic module**

```typescript
// src/lib/retention.ts

export function computeDeleteAfter(
  transferredAt: Date,
  retentionHours: number
): Date {
  return new Date(transferredAt.getTime() + retentionHours * 60 * 60 * 1000);
}

export function getRetentionBadgeText(deleteAfter: Date | null): {
  text: string;
  variant: 'gray' | 'amber' | 'red' | 'blue';
} {
  if (!deleteAfter) {
    return { text: 'Venter på EPJ-overf.', variant: 'gray' };
  }

  const now = Date.now();
  const remaining = deleteAfter.getTime() - now;

  if (remaining <= 0) {
    return { text: 'Slettes nå', variant: 'red' };
  }

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  if (hours < 2) {
    return { text: 'Slettes snart', variant: 'red' };
  }

  return {
    text: `Slettes om ${hours}t ${minutes}m`,
    variant: 'amber',
  };
}

export function shouldAutoDelete(note: {
  epjTransferred: boolean;
  deleteAfter: Date | null;
}): boolean {
  if (!note.epjTransferred || !note.deleteAfter) return false;
  return new Date() >= note.deleteAfter;
}
```

**Step 2: Commit**

```bash
git add src/lib/retention.ts
git commit -m "feat: add retention policy logic (computeDeleteAfter, badge text)"
```

---

## Task 11: RetentionBadge Component

**Files:**
- Create: `src/components/RetentionBadge.tsx`

**Step 1: Create the badge component**

```tsx
// src/components/RetentionBadge.tsx
'use client';

import { useEffect, useState } from 'react';
import { Clock, Trash2, AlertTriangle, Pause } from 'lucide-react';
import { getRetentionBadgeText } from '@/lib/retention';
import { cn } from '@/lib/utils';

interface RetentionBadgeProps {
  deleteAfter: Date | null;
  autoDeleteEnabled?: boolean;
  className?: string;
}

const VARIANT_STYLES = {
  gray: 'bg-[var(--surface-primary)] text-[var(--text-muted)] border-[var(--border-default)]',
  amber: 'bg-[rgba(245,158,11,0.08)] text-[#F59E0B] border-[rgba(245,158,11,0.2)]',
  red: 'bg-[rgba(239,68,68,0.08)] text-[#EF4444] border-[rgba(239,68,68,0.2)]',
  blue: 'bg-[rgba(94,106,210,0.08)] text-[#5E6AD2] border-[rgba(94,106,210,0.2)]',
};

const VARIANT_ICONS = {
  gray: Pause,
  amber: Clock,
  red: AlertTriangle,
  blue: Trash2,
};

export default function RetentionBadge({
  deleteAfter,
  autoDeleteEnabled = true,
  className,
}: RetentionBadgeProps) {
  const [badge, setBadge] = useState(() => getRetentionBadgeText(deleteAfter));

  useEffect(() => {
    if (!deleteAfter) return;
    const interval = setInterval(() => {
      setBadge(getRetentionBadgeText(deleteAfter));
    }, 60_000); // update every minute
    return () => clearInterval(interval);
  }, [deleteAfter]);

  if (!autoDeleteEnabled) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border',
          VARIANT_STYLES.blue,
          className
        )}
      >
        <Trash2 className="w-3 h-3" />
        Manuell sletting
      </span>
    );
  }

  const Icon = VARIANT_ICONS[badge.variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border',
        VARIANT_STYLES[badge.variant],
        badge.variant === 'red' && 'animate-pulse',
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {badge.text}
    </span>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/RetentionBadge.tsx
git commit -m "feat: add RetentionBadge component with countdown and variants"
```

---

## Task 12: E2E Encryption — Crypto Library

**Files:**
- Create: `src/lib/crypto/encryption.ts`

**Step 1: Create the client-side encryption module using Web Crypto API**

Reference: Follow the AES-256-GCM pattern from `src/lib/epj/credentials.ts` but adapted for browser-side Web Crypto API.

```typescript
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
      salt,
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
    iv: arrayBufferToBase64(iv.buffer),
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
    { name: 'AES-GCM', iv },
    key,
    ciphertext
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
  return arrayBufferToBase64(salt.buffer);
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
```

**Step 2: Commit**

```bash
git add src/lib/crypto/encryption.ts
git commit -m "feat: add client-side AES-256-GCM encryption via Web Crypto API"
```

---

## Task 13: E2E Encryption — In-Memory Key Store

**Files:**
- Create: `src/lib/crypto/key-store.ts`

**Step 1: Create the session key manager**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/lib/crypto/key-store.ts
git commit -m "feat: add in-memory session encryption key store"
```

---

## Task 14: useEncryption Hook

**Files:**
- Create: `src/hooks/useEncryption.ts`

**Step 1: Create the React hook**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/hooks/useEncryption.ts
git commit -m "feat: add useEncryption React hook"
```

---

## Task 15: EncryptionGate Component

**Files:**
- Create: `src/components/EncryptionGate.tsx`

**Step 1: Create the re-auth prompt component**

```tsx
// src/components/EncryptionGate.tsx
'use client';

import { Shield, LogIn } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function EncryptionGate() {
  const pathname = usePathname();

  const handleReAuth = () => {
    window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-[rgba(94,106,210,0.1)] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7 text-[var(--accent-primary)]" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Krypteringsnøkkel utløpt
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          For å beskytte pasientdata kreves ny autentisering for å dekryptere notater.
        </p>
        <button
          onClick={handleReAuth}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--accent-primary)] hover:opacity-90 text-white font-medium transition-colors cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          Logg inn på nytt
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/EncryptionGate.tsx
git commit -m "feat: add EncryptionGate re-auth prompt component"
```

---

## Task 16: Clinical Notes API

**Files:**
- Create: `src/app/api/clinical-notes/route.ts`
- Create: `src/app/api/clinical-notes/[id]/route.ts`

**Step 1: Create the clinical notes CRUD endpoint**

```typescript
// src/app/api/clinical-notes/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth, isAuthResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { clinicalNoteCreateSchema } from '@/lib/validations';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const notes = await prisma.clinicalNote.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(notes);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = rateLimit(ip, 'clinical-notes-create', { limit: 30 });
  if (limited) return limited;

  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const body = await request.json();
  const parsed = clinicalNoteCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
      { status: 400 }
    );
  }

  const note = await prisma.clinicalNote.create({
    data: {
      userId: auth.user.id,
      ...parsed.data,
    },
  });

  return NextResponse.json(note, { status: 201 });
}
```

**Step 2: Create single-note operations**

```typescript
// src/app/api/clinical-notes/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth, isAuthResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { clinicalNoteUpdateSchema } from '@/lib/validations';
import { computeDeleteAfter } from '@/lib/retention';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const note = await prisma.clinicalNote.findFirst({
    where: { id, userId: auth.user.id },
  });

  if (!note) {
    return NextResponse.json({ error: 'Notat ikke funnet' }, { status: 404 });
  }

  return NextResponse.json(note);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const body = await request.json();
  const parsed = clinicalNoteUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
      { status: 400 }
    );
  }

  // If marking as EPJ-transferred, compute deleteAfter
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.epjTransferred) {
    const now = new Date();
    updateData.epjTransferredAt = now;

    // Get user's retention settings
    const settings = await prisma.retentionSettings.findUnique({
      where: { userId: auth.user.id },
    });
    const hours = settings?.textRetentionHours ?? 48;
    updateData.deleteAfter = computeDeleteAfter(now, hours);
    updateData.retentionHours = hours;
  }

  const note = await prisma.clinicalNote.updateMany({
    where: { id, userId: auth.user.id },
    data: updateData,
  });

  if (note.count === 0) {
    return NextResponse.json({ error: 'Notat ikke funnet' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const result = await prisma.clinicalNote.deleteMany({
    where: { id, userId: auth.user.id },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: 'Notat ikke funnet' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
```

**Step 3: Commit**

```bash
git add src/app/api/clinical-notes/
git commit -m "feat: add clinical notes CRUD API with retention support"
```

---

## Task 17: Retention Settings API

**Files:**
- Create: `src/app/api/retention/settings/route.ts`

**Step 1: Create the retention settings endpoint**

```typescript
// src/app/api/retention/settings/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth, isAuthResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { retentionSettingsSchema } from '@/lib/validations';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const settings = await prisma.retentionSettings.findUnique({
    where: { userId: auth.user.id },
  });

  return NextResponse.json(
    settings || { textRetentionHours: 48, autoDeleteEnabled: true }
  );
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const body = await request.json();
  const parsed = retentionSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
      { status: 400 }
    );
  }

  const settings = await prisma.retentionSettings.upsert({
    where: { userId: auth.user.id },
    update: parsed.data,
    create: {
      userId: auth.user.id,
      ...parsed.data,
    },
  });

  return NextResponse.json(settings);
}
```

**Step 2: Commit**

```bash
git add src/app/api/retention/settings/route.ts
git commit -m "feat: add retention settings API (GET/PUT)"
```

---

## Task 18: Retention Cleanup Endpoint (Cron)

**Files:**
- Create: `src/app/api/retention/cleanup/route.ts`

**Step 1: Create the cron-triggered cleanup endpoint**

```typescript
// src/app/api/retention/cleanup/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Ugyldig autorisasjon' }, { status: 401 });
  }

  const now = new Date();

  // Find expired notes (only those that have been transferred to EPJ)
  const expiredNotes = await prisma.clinicalNote.findMany({
    where: {
      epjTransferred: true,
      deleteAfter: { lte: now },
    },
    select: { id: true, userId: true },
  });

  if (expiredNotes.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  // Delete in batch
  const result = await prisma.clinicalNote.deleteMany({
    where: {
      id: { in: expiredNotes.map((n) => n.id) },
    },
  });

  // Create audit log entries for each deletion
  for (const note of expiredNotes) {
    try {
      await createAuditLog({
        userId: note.userId,
        entityType: 'auto_delete',
        entityId: note.id,
        action: 'auto_delete',
        changes: { reason: 'retention_policy_expired', deletedAt: now.toISOString() },
      });
    } catch (err) {
      console.error(`Failed to create audit log for auto-delete of note ${note.id}:`, err);
    }
  }

  return NextResponse.json({ deleted: result.count });
}
```

**Step 2: Commit**

```bash
git add src/app/api/retention/cleanup/route.ts
git commit -m "feat: add retention cleanup endpoint for cron-triggered auto-delete"
```

---

## Task 19: Encryption Salt API

**Files:**
- Create: `src/app/api/user/encryption-salt/route.ts`

**Step 1: Create the encryption salt endpoint**

```typescript
// src/app/api/user/encryption-salt/route.ts
import { NextResponse } from 'next/server';
import { requireAuth, isAuthResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { encryptionSalt: true },
  });

  return NextResponse.json({ salt: user?.encryptionSalt || null });
}

export async function POST() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  // Generate salt on server for storage, but the actual crypto happens client-side
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = Buffer.from(saltBytes).toString('base64');

  await prisma.user.update({
    where: { id: auth.user.id },
    data: { encryptionSalt: salt },
  });

  return NextResponse.json({ salt });
}
```

**Step 2: Commit**

```bash
git add src/app/api/user/encryption-salt/route.ts
git commit -m "feat: add encryption salt API for E2E key derivation"
```

---

## Task 20: Security Page (`/sikkerhet`)

**Files:**
- Create: `src/app/sikkerhet/page.tsx`

Reference: Follow layout/styling from `src/app/personvern/page.tsx` exactly.

**Step 1: Create the public security page**

```tsx
// src/app/sikkerhet/page.tsx
import Link from "next/link";
import {
  Mic,
  ArrowLeft,
  Shield,
  Lock,
  Clock,
  FileCheck,
  Brain,
  Server,
  BadgeCheck,
  KeyRound,
} from "lucide-react";

export const metadata = {
  title: "Sikkerhet og Tillit | Vocura AI",
  description:
    "Les om hvordan Vocura AI beskytter pasientdata med BankID-autentisering, ende-til-ende-kryptering, automatisk datasletting og Normen-etterlevelse.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="bg-[#111111]/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#5E6AD2]">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-[#EDEDED]">Vocura</span>
          </div>
          <Link
            href="/"
            className="text-[#8B8B8B] hover:text-[#EDEDED] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-3 py-2 transition-colors text-sm inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Tilbake
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[rgba(94,106,210,0.1)] text-[#5E6AD2] text-sm font-medium gap-2 mb-6">
            <Shield className="w-4 h-4" />
            <span>Sikkerhet</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-[#EDEDED]">
            Sikkerhet og Tillit
          </h1>
          <p className="text-[#8B8B8B]">
            Sist oppdatert:{" "}
            {new Date().toLocaleDateString("nb-NO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="max-w-none space-y-10">
          {/* 1. BankID */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <KeyRound className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              1. BankID/Buypass-autentisering
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-3">
              Vocura bruker BankID og Buypass for sterk identifisering av helsepersonell. Dette gir sikkerhetsniv&aring; 4 — det h&oslash;yeste niv&aring;et i norsk eID-infrastruktur.
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-1 text-sm">
              <li>Sikkerhetsniv&aring; 4 (h&oslash;yeste norske eID-niv&aring;)</li>
              <li>Integrert via Criipto OIDC-leverand&oslash;r</li>
              <li>E-post/passord tilgjengelig som alternativ innloggingsmetode</li>
            </ul>
          </section>

          {/* 2. E2E Encryption */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Lock className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              2. Ende-til-ende-kryptering
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-3">
              Alle kliniske notater krypteres p&aring; din enhet f&oslash;r de sendes til serveren. Kun du kan dekryptere innholdet — selv ikke Vocura har tilgang.
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-1 text-sm">
              <li>AES-256-GCM kryptering (militær standard)</li>
              <li>N&oslash;kkel utledet fra din autentisering via PBKDF2</li>
              <li>Serveren lagrer kun kryptert data</li>
              <li>Krypteringsn&oslash;kkel slettes fra minnet ved inaktivitet</li>
            </ul>
          </section>

          {/* 3. Auto-delete */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Clock className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              3. Automatisk datasletting
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-3">
              Vocura er et f&oslash;lgeverkt&oslash;y — ikke et journalsystem. Etter overf&oslash;ring til EPJ slettes data automatisk.
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-1 text-sm">
              <li>Lydopptak: slettes umiddelbart etter transkripsjon</li>
              <li>Notater: slettes automatisk innen 48 timer etter EPJ-overf&oslash;ring</li>
              <li>Konfigurerbart: velg 24 eller 48 timers oppbevaringstid</li>
              <li>Ikke-overf&oslash;rte notater slettes aldri automatisk</li>
            </ul>
          </section>

          {/* 4. Normen */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <FileCheck className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              4. Normen-etterlevelse
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-3">
              Vocura f&oslash;lger Norm for informasjonssikkerhet og personvern i helse- og omsorgssektoren (Normen) og Helsedirektoratets anbefalinger.
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-1 text-sm">
              <li>Tilgangskontroll: kun autentisert helsepersonell</li>
              <li>Revisjonslogg: alle handlinger logges med tidsstempel</li>
              <li>Automatisk sesjonsutl&oslash;p etter 15 minutters inaktivitet</li>
              <li>Dataminimering: kun n&oslash;dvendig informasjon behandles</li>
              <li>Kryptering i transit (TLS) og i hvile (AES-256)</li>
            </ul>
          </section>

          {/* 5. AI Pledge */}
          <section className="bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.15)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Brain className="w-6 h-6 shrink-0 text-[#F59E0B]" />
              5. AI-treningsgaranti
            </h2>
            <div className="bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-lg p-4 mb-3">
              <p className="text-[#F59E0B] font-semibold text-lg">
                Vi bruker IKKE pasientdata til AI-trening.
              </p>
            </div>
            <p className="leading-relaxed text-[#8B8B8B]">
              Data sendt til OpenAI via Vocura brukes kun for &aring; generere svar i sanntid. OpenAI lagrer ikke data fra API-kall for modelltrening. Vocura har en egen databehandleravtale med OpenAI som sikrer dette.
            </p>
          </section>

          {/* 6. Infrastructure */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Server className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              6. Infrastruktur og sikkerhetstiltak
            </h2>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-1 text-sm">
              <li>HTTPS overalt med HSTS og preload</li>
              <li>Content Security Policy (CSP) for XSS-beskyttelse</li>
              <li>Forsp&oslash;rselsbegrensning (rate limiting) p&aring; alle API-ruter</li>
              <li>Automatisk sesjonsutl&oslash;p etter 15 minutter</li>
              <li>Database hostet i EU (Supabase)</li>
              <li>Inputvalidering p&aring; alle skjemaer (Zod)</li>
              <li>Referrer-Policy: strict-origin-when-cross-origin</li>
            </ul>
          </section>

          {/* 7. Trust Badges */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <BadgeCheck className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              7. Sertifiseringer og tillit
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'GDPR', desc: 'Kompatibel' },
                { label: 'Normen', desc: 'Etterlevelse' },
                { label: 'BankID', desc: 'Verifisert' },
                { label: 'E2E', desc: 'Kryptert' },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex flex-col items-center gap-1 p-4 rounded-lg bg-[rgba(94,106,210,0.05)] border border-[rgba(94,106,210,0.1)]"
                >
                  <Shield className="w-6 h-6 text-[#5E6AD2]" />
                  <span className="text-sm font-semibold text-[#EDEDED]">
                    {badge.label}
                  </span>
                  <span className="text-xs text-[#5C5C5C]">{badge.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Footer links */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-[rgba(255,255,255,0.06)]">
            <Link
              href="/personvern"
              className="text-sm text-[#5E6AD2] hover:underline"
            >
              Personvernerkl&aelig;ring
            </Link>
            <Link
              href="/vilkar"
              className="text-sm text-[#5E6AD2] hover:underline"
            >
              Vilk&aring;r for bruk
            </Link>
            <Link
              href="/databehandleravtale"
              className="text-sm text-[#5E6AD2] hover:underline"
            >
              Databehandleravtale
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
```

**Step 2: Verify the page renders**

Run: `cd /Users/daodilyas/SpeechToText && npx next dev`
Visit: `http://localhost:3000/sikkerhet`
Expected: Security page renders with all 7 sections, dark theme, matches `/personvern` layout style.

**Step 3: Commit**

```bash
git add src/app/sikkerhet/page.tsx
git commit -m "feat: add /sikkerhet public security page (Normen, E2E, BankID, auto-delete)"
```

---

## Task 21: SessionTimeout — Clear Encryption Key

**Files:**
- Modify: `src/components/SessionTimeout.tsx`

**Step 1: Import and call clearSessionKey when session locks**

Add import at top:
```typescript
import { clearSessionKey } from '@/lib/crypto/key-store';
```

In the `lockTimerRef.current = setTimeout(...)` callback (around line 57-60), add `clearSessionKey()` before `setShowLock(true)`:

```typescript
lockTimerRef.current = setTimeout(() => {
    setShowWarning(false);
    clearSessionKey();
    setShowLock(true);
}, IDLE_TIMEOUT);
```

**Step 2: Commit**

```bash
git add src/components/SessionTimeout.tsx
git commit -m "feat: clear encryption key on session timeout for security"
```

---

## Task 22: Settings Page — Add Retention Settings Section

**Files:**
- Modify: `src/app/settings/page.tsx`

**Step 1: Add retention settings state and UI section**

Add imports: `Clock` from lucide-react.

Add state after the existing delete modal state (around line 67):
```typescript
// Retention settings state
const [retentionHours, setRetentionHours] = useState(48);
const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(true);
const [retentionLoading, setRetentionLoading] = useState(true);
const [retentionSaving, setRetentionSaving] = useState(false);
```

Add a fetch effect (after the EPJ fetchEpjStatus effect):
```typescript
useEffect(() => {
    async function fetchRetention() {
        try {
            const res = await fetchWithTimeout('/api/retention/settings');
            if (res.ok) {
                const data = await res.json();
                setRetentionHours(data.textRetentionHours ?? 48);
                setAutoDeleteEnabled(data.autoDeleteEnabled ?? true);
            }
        } catch (err) {
            console.error('Kunne ikke hente oppbevaringsinnstillinger:', err);
        } finally {
            setRetentionLoading(false);
        }
    }
    fetchRetention();
}, []);
```

Add a save handler:
```typescript
const handleSaveRetention = async () => {
    setRetentionSaving(true);
    try {
        await fetchWithTimeout('/api/retention/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ textRetentionHours: retentionHours, autoDeleteEnabled }),
        });
    } catch (err) {
        console.error('Kunne ikke lagre oppbevaringsinnstillinger:', err);
    } finally {
        setRetentionSaving(false);
    }
};
```

Add a new section BEFORE the Personvern section (before `{/* Section 3: Personvern */}`):

```tsx
{/* Section 3: Dataoppbevaring */}
<section className="mb-8">
    <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-[var(--accent-primary)]" />
        <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">
            Dataoppbevaring
        </h2>
    </div>
    <div className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-6">
        {retentionLoading ? (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
            </div>
        ) : (
            <div className="space-y-5">
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    Etter overføring til EPJ slettes notater automatisk fra Vocura. Vocura er et følgeverktøy, ikke et journalsystem.
                </p>
                <div>
                    <label className="text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase block mb-1.5">
                        Oppbevaringstid etter EPJ-overføring
                    </label>
                    <select
                        value={retentionHours}
                        onChange={(e) => setRetentionHours(Number(e.target.value))}
                        className="w-full text-[13px] px-3 py-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                    >
                        <option value={24}>24 timer</option>
                        <option value={48}>48 timer</option>
                    </select>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[13px] font-medium text-[var(--text-primary)]">
                            Automatisk sletting
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                            Slett notater automatisk etter oppbevaringstiden
                        </p>
                    </div>
                    <button
                        onClick={() => setAutoDeleteEnabled(!autoDeleteEnabled)}
                        className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer',
                            autoDeleteEnabled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--surface-overlay)]'
                        )}
                    >
                        <span
                            className={cn(
                                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                autoDeleteEnabled ? 'translate-x-6' : 'translate-x-1'
                            )}
                        />
                    </button>
                </div>
                <button
                    onClick={handleSaveRetention}
                    disabled={retentionSaving}
                    className={cn(
                        'w-full flex items-center justify-center gap-2 text-sm font-medium py-2 px-4 rounded-md transition-colors cursor-pointer',
                        'bg-[var(--accent-primary)] hover:opacity-90 text-white',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    {retentionSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Lagre innstillinger
                </button>
            </div>
        )}
    </div>
</section>
```

Update the Personvern section comment to `{/* Section 4: Personvern */}` and add a link to `/sikkerhet`:

```tsx
<a
    href="/sikkerhet"
    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent-primary)] hover:underline"
>
    <ExternalLink className="w-3.5 h-3.5" />
    Sikkerhet og tillit
</a>
```

**Step 2: Verify the settings page renders**

Run dev server, visit `/settings`.
Expected: New "Dataoppbevaring" section with dropdown and toggle, plus security link.

**Step 3: Commit**

```bash
git add src/app/settings/page.tsx
git commit -m "feat: add retention settings section to settings page"
```

---

## Task 23: pg_cron Migration for Auto-Cleanup

**Files:**
- Create: `supabase/migrations/20260224_retention_cleanup_cron.sql`

**Step 1: Create the SQL migration**

```sql
-- Enable pg_cron extension (must be done by superuser/Supabase dashboard)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- NOTE: This migration should be applied manually in the Supabase Dashboard SQL Editor
-- because pg_cron requires superuser privileges.

-- Schedule hourly cleanup of expired clinical notes
-- Replace YOUR_APP_URL and YOUR_CRON_SECRET with actual values
/*
SELECT cron.schedule(
  'cleanup-expired-clinical-notes',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_APP_URL/api/retention/cleanup',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR_CRON_SECRET', 'Content-Type', 'application/json'),
    body := '{}'
  );
  $$
);
*/

-- Alternative: Direct SQL cleanup (simpler, no HTTP call needed)
-- Uncomment and schedule via Supabase Dashboard > Database > Extensions > pg_cron
/*
SELECT cron.schedule(
  'cleanup-expired-clinical-notes',
  '0 * * * *',
  $$
  DELETE FROM clinical_notes
  WHERE epj_transferred = true
    AND delete_after IS NOT NULL
    AND delete_after < NOW();
  $$
);
*/
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260224_retention_cleanup_cron.sql
git commit -m "feat: add pg_cron migration for auto-cleanup of expired notes"
```

---

## Task 24: Update .env.example

**Files:**
- Modify: `.env.example` (or create if doesn't exist)

**Step 1: Add new environment variables**

```bash
# BankID/Buypass via Criipto OIDC
CRIIPTO_ISSUER_URL=https://YOUR_DOMAIN.criipto.id
CRIIPTO_CLIENT_ID=
CRIIPTO_CLIENT_SECRET=

# Retention cleanup cron
CRON_SECRET=
```

**Step 2: Commit**

```bash
git add .env.example
git commit -m "feat: add BankID and cron env vars to .env.example"
```

---

## Task 25: Link Security Page from Personvern and Login

**Files:**
- Modify: `src/app/personvern/page.tsx` (add link to /sikkerhet at bottom)
- Modify: `src/app/login/page.tsx` (add link alongside personvern link)

**Step 1: Add security link to personvern page**

At the bottom of the personvern page, alongside existing footer links, add:

```tsx
<Link
    href="/sikkerhet"
    className="text-sm text-[#5E6AD2] hover:underline"
>
    Sikkerhet og tillit
</Link>
```

**Step 2: Add security link to login page**

Below the existing "Les om personvern og databehandling" link in the login page, add:

```tsx
<div className="mt-2 text-center">
    <Link
        href="/sikkerhet"
        className="text-xs text-[#5C5C5C] hover:text-[#8B8B8B] cursor-pointer transition-colors"
    >
        Sikkerhet og tillit
    </Link>
</div>
```

**Step 3: Commit**

```bash
git add src/app/personvern/page.tsx src/app/login/page.tsx
git commit -m "feat: link to /sikkerhet from personvern and login pages"
```

---

## Task 26: Final Verification

**Step 1: Run the dev server and verify all pages**

```bash
cd /Users/daodilyas/SpeechToText && npx next dev
```

**Checks:**
1. `/login` — BankID button visible, email form works, security link visible
2. `/sikkerhet` — All 7 sections render, dark theme, links work
3. `/settings` — Retention settings section visible with dropdown and toggle
4. `/dashboard` — Still works (middleware doesn't break authenticated routes)
5. `/` — Public, accessible without auth
6. Unauthenticated user visiting `/dashboard` → redirected to `/login`

**Step 2: Run TypeScript check**

```bash
cd /Users/daodilyas/SpeechToText && npx tsc --noEmit
```

Expected: No type errors.

**Step 3: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address any issues found during final verification"
```

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Root middleware | `src/middleware.ts` |
| 2 | Shared API auth | `src/lib/api-auth.ts` |
| 3 | CSP for BankID | `next.config.ts` |
| 4 | DB schema | `prisma/schema.prisma` |
| 5 | BankID helpers | `src/lib/auth/bankid.ts` |
| 6 | Login BankID button | `src/app/login/page.tsx` |
| 7 | Auth callback | `src/app/auth/callback/route.ts` |
| 8 | Audit log types | `src/lib/audit.ts` |
| 9 | Validation schemas | `src/lib/validations.ts` |
| 10 | Retention logic | `src/lib/retention.ts` |
| 11 | RetentionBadge | `src/components/RetentionBadge.tsx` |
| 12 | Crypto encryption | `src/lib/crypto/encryption.ts` |
| 13 | Crypto key store | `src/lib/crypto/key-store.ts` |
| 14 | useEncryption hook | `src/hooks/useEncryption.ts` |
| 15 | EncryptionGate | `src/components/EncryptionGate.tsx` |
| 16 | Clinical notes API | `src/app/api/clinical-notes/` |
| 17 | Retention settings API | `src/app/api/retention/settings/route.ts` |
| 18 | Cleanup endpoint | `src/app/api/retention/cleanup/route.ts` |
| 19 | Encryption salt API | `src/app/api/user/encryption-salt/route.ts` |
| 20 | Security page | `src/app/sikkerhet/page.tsx` |
| 21 | Session timeout key clear | `src/components/SessionTimeout.tsx` |
| 22 | Settings retention UI | `src/app/settings/page.tsx` |
| 23 | pg_cron migration | `supabase/migrations/` |
| 24 | Env vars | `.env.example` |
| 25 | Cross-linking | `personvern`, `login` pages |
| 26 | Final verification | All |
