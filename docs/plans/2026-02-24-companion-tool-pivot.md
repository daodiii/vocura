# Companion Tool Pivot — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Pivot Vocura from a standalone journal storage system to a companion tool that pushes notes to existing EPJ systems via Leyr API.

**Architecture:** EPJ adapter pattern with pluggable backends (LeyrAdapter, ManualExportAdapter). Patient data flows through browser memory only — never stored in Vocura's database. Leyr credentials stored AES-256-GCM encrypted per user.

**Tech Stack:** Next.js 16 + React 19 + TypeScript 5 + Prisma + Supabase Auth + Zod + Node.js crypto

---

## Task 1: Add EpjIntegration Prisma Model

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Add EpjIntegration model and User relation**

In `prisma/schema.prisma`, add to the `User` model (after the `templates` relation on line 23):

```prisma
  epjIntegration EpjIntegration?
```

Then add this new model after the `AuditLog` model (after line 152):

```prisma
model EpjIntegration {
  id                    String    @id @default(uuid())
  userId                String    @unique @map("user_id")
  epjSystem             String    @map("epj_system")
  careUnitId            String    @map("care_unit_id")
  encryptedCredentials  String    @map("encrypted_credentials")
  isActive              Boolean   @default(true) @map("is_active")
  connectedAt           DateTime  @default(now()) @map("connected_at")
  lastTestedAt          DateTime? @map("last_tested_at")
  testOk                Boolean?  @map("test_ok")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("epj_integrations")
}
```

**Step 2: Run the migration**

Run: `npx prisma migrate dev --name add_epj_integration`
Expected: Migration succeeds, `epj_integrations` table created.

**Step 3: Verify Prisma client generates correctly**

Run: `npx prisma generate`
Expected: No errors. `prisma.epjIntegration` available in TypeScript.

**Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add EpjIntegration model for EPJ companion tool pivot"
```

---

## Task 2: Create EPJ Adapter Types

**Files:**
- Create: `src/lib/epj/types.ts`

**Step 1: Write the type definitions**

```typescript
// src/lib/epj/types.ts

export interface PatientContext {
  epjPatientId: string;
  displayName: string;
  birthYear?: number;
  encounterId?: string;
}

export interface EPJNote {
  patientId: string;
  patientDisplayName: string;
  content: string;
  title: string;
  diagnosisCodes?: Array<{
    code: string;
    system: 'ICPC-2' | 'ICD-10';
    label: string;
  }>;
  encounterType?: string;
  authorHprNumber?: string;
  templateType?: string;
  createdAt: string;
}

export interface EPJPushResult {
  success: boolean;
  epjNoteId?: string;
  epjUrl?: string;
  error?: string;
}

export interface EPJAdapter {
  readonly adapterType: 'leyr' | 'manual-export';
  testConnection(): Promise<{ ok: boolean; error?: string }>;
  searchPatients(query: string): Promise<PatientContext[]>;
  fetchPatientContext(epjPatientId: string): Promise<PatientContext>;
  pushNote(note: EPJNote): Promise<EPJPushResult>;
  pushFormDocument(
    formType: string,
    formData: Record<string, unknown>,
    patientId: string
  ): Promise<EPJPushResult>;
}

export interface LeyrCredentials {
  clientId: string;
  clientSecret: string;
  careUnitId: string;
  epjSystem: 'dips' | 'eg-pasientsky' | 'pridok';
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --strict src/lib/epj/types.ts 2>&1 || echo 'Check for errors'`
Expected: No errors (standalone type file, no imports).

**Step 3: Commit**

```bash
git add src/lib/epj/types.ts
git commit -m "feat: add EPJ adapter TypeScript interfaces"
```

---

## Task 3: Create Credential Encryption Utility

**Files:**
- Create: `src/lib/epj/credentials.ts`
- Modify: `.env.example`

**Step 1: Write the encryption module**

```typescript
// src/lib/epj/credentials.ts

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import type { LeyrCredentials } from './types';

const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
  const hex = process.env.EPJ_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
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
  // Format: iv (12) + authTag (16) + ciphertext
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptCredentials(stored: string): LeyrCredentials {
  const key = getKey();
  const buf = Buffer.from(stored, 'base64');
  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString('utf8'));
}
```

**Step 2: Add environment variables to .env.example**

Append to `.env.example`:

```
# EPJ Integration (Leyr)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
EPJ_ENCRYPTION_KEY=
LEYR_BASE_URL=https://api.leyr.io
```

**Step 3: Commit**

```bash
git add src/lib/epj/credentials.ts .env.example
git commit -m "feat: add AES-256-GCM credential encryption for EPJ integration"
```

---

## Task 4: Create ManualExportAdapter

**Files:**
- Create: `src/lib/epj/ManualExportAdapter.ts`

**Step 1: Write the fallback adapter**

```typescript
// src/lib/epj/ManualExportAdapter.ts

import type { EPJAdapter, PatientContext, EPJNote, EPJPushResult } from './types';

export class ManualExportAdapter implements EPJAdapter {
  readonly adapterType = 'manual-export' as const;

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    return { ok: true };
  }

  async searchPatients(): Promise<PatientContext[]> {
    return [];
  }

  async fetchPatientContext(id: string): Promise<PatientContext> {
    return { epjPatientId: id, displayName: id };
  }

  async pushNote(_note: EPJNote): Promise<EPJPushResult> {
    return {
      success: false,
      error: 'Ingen EPJ-tilkobling konfigurert. Bruk PDF-eksport eller kopier tekst.',
    };
  }

  async pushFormDocument(): Promise<EPJPushResult> {
    return {
      success: false,
      error: 'Ingen EPJ-tilkobling konfigurert. Bruk PDF-eksport.',
    };
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/epj/ManualExportAdapter.ts
git commit -m "feat: add ManualExportAdapter fallback for unconnected EPJ"
```

---

## Task 5: Create LeyrAdapter

**Files:**
- Create: `src/lib/epj/LeyrAdapter.ts`

**Step 1: Write the Leyr API client**

```typescript
// src/lib/epj/LeyrAdapter.ts

import type {
  EPJAdapter,
  PatientContext,
  EPJNote,
  EPJPushResult,
  LeyrCredentials,
} from './types';

const LEYR_BASE_URL = process.env.LEYR_BASE_URL || 'https://api.leyr.io';
const TIMEOUT_MS = 15_000;

export class LeyrAdapter implements EPJAdapter {
  readonly adapterType = 'leyr' as const;
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor(private credentials: LeyrCredentials) {}

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 5-minute buffer)
    if (this.accessToken && Date.now() < this.tokenExpiry - 300_000) {
      return this.accessToken;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${LEYR_BASE_URL}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Leyr auth failed (${res.status}): ${body}`);
      }

      const data = await res.json();
      this.accessToken = data.access_token;
      // Default to 1 hour if expires_in not provided
      this.tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;
      return this.accessToken!;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    retry = true
  ): Promise<T> {
    const token = await this.getAccessToken();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${LEYR_BASE_URL}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Care-Unit-Id': this.credentials.careUnitId,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (res.status === 401 && retry) {
        // Token expired, refresh and retry once
        this.accessToken = null;
        this.tokenExpiry = 0;
        return this.request<T>(method, path, body, false);
      }

      if (res.status >= 500 && retry) {
        // Server error, wait 2s and retry once
        await new Promise((r) => setTimeout(r, 2000));
        return this.request<T>(method, path, body, false);
      }

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Leyr API error (${res.status}): ${errBody}`);
      }

      return res.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.getAccessToken();
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : 'Kunne ikke koble til EPJ-systemet',
      };
    }
  }

  async searchPatients(query: string): Promise<PatientContext[]> {
    try {
      const data = await this.request<{
        results: Array<{ id: string; name: string; birthYear?: number }>;
      }>('GET', `/patients?search=${encodeURIComponent(query)}`);

      return (data.results || []).map((p) => ({
        epjPatientId: p.id,
        displayName: p.name,
        birthYear: p.birthYear,
      }));
    } catch {
      return [];
    }
  }

  async fetchPatientContext(epjPatientId: string): Promise<PatientContext> {
    const data = await this.request<{
      id: string;
      name: string;
      birthYear?: number;
    }>('GET', `/patients/${encodeURIComponent(epjPatientId)}`);

    return {
      epjPatientId: data.id,
      displayName: data.name,
      birthYear: data.birthYear,
    };
  }

  async pushNote(note: EPJNote): Promise<EPJPushResult> {
    try {
      const data = await this.request<{ id: string; url?: string }>(
        'POST',
        '/medical-notes',
        {
          patientId: note.patientId,
          title: note.title,
          content: note.content,
          type: note.templateType || 'clinical-note',
          diagnosisCodes: note.diagnosisCodes,
          encounterType: note.encounterType,
          authorHprNumber: note.authorHprNumber,
          createdAt: note.createdAt,
        }
      );

      return {
        success: true,
        epjNoteId: data.id,
        epjUrl: data.url,
      };
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Kunne ikke sende notat til EPJ',
      };
    }
  }

  async pushFormDocument(
    formType: string,
    formData: Record<string, unknown>,
    patientId: string
  ): Promise<EPJPushResult> {
    // Convert form data to a readable text document
    const sections = Object.entries(formData)
      .filter(([, v]) => v !== '' && v !== null && v !== undefined)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    return this.pushNote({
      patientId,
      patientDisplayName: '',
      title: formType,
      content: sections,
      templateType: `form-${formType}`,
      createdAt: new Date().toISOString(),
    });
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/epj/LeyrAdapter.ts
git commit -m "feat: add LeyrAdapter with OAuth2 auth, retry logic, and timeout"
```

---

## Task 6: Create EPJ Adapter Factory

**Files:**
- Create: `src/lib/epj/factory.ts`

**Step 1: Write the factory**

```typescript
// src/lib/epj/factory.ts

import { prisma } from '@/lib/prisma';
import { decryptCredentials } from './credentials';
import { LeyrAdapter } from './LeyrAdapter';
import { ManualExportAdapter } from './ManualExportAdapter';
import type { EPJAdapter } from './types';

export async function getEPJAdapter(userId: string): Promise<EPJAdapter> {
  const integration = await prisma.epjIntegration.findUnique({
    where: { userId },
  });

  if (!integration || !integration.isActive) {
    return new ManualExportAdapter();
  }

  try {
    const credentials = decryptCredentials(integration.encryptedCredentials);
    return new LeyrAdapter(credentials);
  } catch {
    // Decryption failed — credentials corrupted or key changed
    return new ManualExportAdapter();
  }
}
```

**Step 2: Create barrel export**

Create `src/lib/epj/index.ts`:

```typescript
export type {
  EPJAdapter,
  EPJNote,
  EPJPushResult,
  PatientContext,
  LeyrCredentials,
} from './types';
export { LeyrAdapter } from './LeyrAdapter';
export { ManualExportAdapter } from './ManualExportAdapter';
export { getEPJAdapter } from './factory';
export { encryptCredentials, decryptCredentials } from './credentials';
```

**Step 3: Commit**

```bash
git add src/lib/epj/factory.ts src/lib/epj/index.ts
git commit -m "feat: add EPJ adapter factory and barrel export"
```

---

## Task 7: Add Zod Validation Schemas for EPJ Routes

**Files:**
- Modify: `src/lib/validations.ts`

**Step 1: Add EPJ schemas**

Append to `src/lib/validations.ts` (after the `felleskatalovenChatSchema` on line 151):

```typescript
// --- EPJ Integration ---
export const epjPushSchema = z.object({
  title: z.string().min(1, 'Tittel er påkrevd').max(500),
  content: z.string().min(1, 'Innhold er påkrevd').max(500_000),
  patientId: z.string().min(1, 'Pasient-ID er påkrevd').max(200),
  patientDisplayName: z.string().max(200).optional().default(''),
  diagnosisCodes: z
    .array(
      z.object({
        code: z.string().max(20),
        system: z.enum(['ICPC-2', 'ICD-10']),
        label: z.string().max(200),
      })
    )
    .optional(),
  encounterType: z.string().max(50).optional(),
  templateType: z.string().max(100).optional(),
});

export const epjIntegrationSchema = z.object({
  epjSystem: z.enum(['dips', 'eg-pasientsky', 'pridok'], {
    error: 'Ugyldig EPJ-system. Bruk: dips, eg-pasientsky, eller pridok',
  }),
  clientId: z.string().min(1, 'Client ID er påkrevd').max(500),
  clientSecret: z.string().min(1, 'Client Secret er påkrevd').max(500),
  careUnitId: z.string().min(1, 'Care Unit ID er påkrevd').max(200),
});
```

**Step 2: Commit**

```bash
git add src/lib/validations.ts
git commit -m "feat: add Zod schemas for EPJ push and integration endpoints"
```

---

## Task 8: Update Audit Log for EPJ Operations

**Files:**
- Modify: `src/lib/audit.ts`

**Step 1: Expand entity types and actions**

Replace the `AuditLogParams` interface (lines 4-12) with:

```typescript
interface AuditLogParams {
    userId: string;
    entityType: 'journal_entry' | 'form_submission' | 'patient' | 'recording' | 'epj_push' | 'patient_context_import' | 'epj_integration';
    entityId: string;
    action: 'create' | 'update' | 'delete' | 'approve' | 'push' | 'search';
    changes?: Record<string, unknown>;
    content?: string;
    ipAddress?: string;
}
```

**Step 2: Add 'push' to critical actions**

Update the `CRITICAL_ACTIONS` line (line 20) to:

```typescript
const CRITICAL_ACTIONS: AuditLogParams['action'][] = ['delete', 'approve', 'push'];
```

**Step 3: Commit**

```bash
git add src/lib/audit.ts
git commit -m "feat: expand audit log types for EPJ push and integration operations"
```

---

## Task 9: Create EPJ Push API Route

**Files:**
- Create: `src/app/api/export/epj/route.ts`

**Step 1: Write the route handler**

```typescript
// src/app/api/export/epj/route.ts

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { epjPushSchema } from '@/lib/validations';
import { getEPJAdapter } from '@/lib/epj';
import { createAuditLog, computeContentHash } from '@/lib/audit';

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), 'epj:push', { limit: 30 });
  if (limited) return limited;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = epjPushSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ugyldig data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const adapter = await getEPJAdapter(user.id);

    if (adapter.adapterType === 'manual-export') {
      return NextResponse.json(
        {
          success: false,
          error: 'Ingen EPJ-tilkobling konfigurert. Gå til Innstillinger for å koble til.',
        },
        { status: 422 }
      );
    }

    const result = await adapter.pushNote({
      patientId: parsed.data.patientId,
      patientDisplayName: parsed.data.patientDisplayName || '',
      title: parsed.data.title,
      content: parsed.data.content,
      diagnosisCodes: parsed.data.diagnosisCodes,
      encounterType: parsed.data.encounterType,
      templateType: parsed.data.templateType,
      createdAt: new Date().toISOString(),
    });

    // Audit log — content hash only, never content
    await createAuditLog({
      userId: user.id,
      entityType: 'epj_push',
      entityId: result.epjNoteId || 'unknown',
      action: 'push',
      changes: {
        epjSystem: adapter.adapterType,
        epjNoteId: result.epjNoteId,
        templateType: parsed.data.templateType,
        patientDisplayName: parsed.data.patientDisplayName,
        diagnosisCodeCount: parsed.data.diagnosisCodes?.length ?? 0,
      },
      content: parsed.data.content,
      ipAddress: getClientIp(req),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('EPJ push failed:', error);
    return NextResponse.json(
      { success: false, error: 'Intern feil ved sending til EPJ' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/export/epj/route.ts
git commit -m "feat: add POST /api/export/epj route for pushing notes to EPJ"
```

---

## Task 10: Create Patient Context Import API Route

**Files:**
- Create: `src/app/api/import/patient-context/route.ts`

**Step 1: Write the route handler**

```typescript
// src/app/api/import/patient-context/route.ts

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { getEPJAdapter } from '@/lib/epj';

export async function GET(req: Request) {
  const limited = rateLimit(getClientIp(req), 'epj:patient', { limit: 60 });
  if (limited) return limited;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const patientId = searchParams.get('patientId');

    const adapter = await getEPJAdapter(user.id);

    if (adapter.adapterType === 'manual-export') {
      return NextResponse.json({ patients: [], connected: false });
    }

    if (patientId) {
      const patient = await adapter.fetchPatientContext(patientId);
      return NextResponse.json({ patient, connected: true });
    }

    if (search && search.length >= 2) {
      const patients = await adapter.searchPatients(search);
      return NextResponse.json({ patients, connected: true });
    }

    return NextResponse.json({ patients: [], connected: true });
  } catch (error) {
    console.error('Patient context import failed:', error);
    return NextResponse.json(
      { patients: [], connected: false, error: 'Feil ved henting av pasientdata' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/import/patient-context/route.ts
git commit -m "feat: add GET /api/import/patient-context for EPJ patient search"
```

---

## Task 11: Create EPJ Integration Management API Route

**Files:**
- Create: `src/app/api/user/epj-integration/route.ts`

**Step 1: Write GET/POST/DELETE handlers**

```typescript
// src/app/api/user/epj-integration/route.ts

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { epjIntegrationSchema } from '@/lib/validations';
import { encryptCredentials } from '@/lib/epj';
import { LeyrAdapter } from '@/lib/epj/LeyrAdapter';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: Request) {
  const limited = rateLimit(getClientIp(req), 'epj-integration:get', { limit: 60 });
  if (limited) return limited;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const integration = await prisma.epjIntegration.findUnique({
      where: { userId: user.id },
    });

    if (!integration) {
      return NextResponse.json({ isConnected: false });
    }

    return NextResponse.json({
      isConnected: integration.isActive,
      epjSystem: integration.epjSystem,
      careUnitId: integration.careUnitId,
      connectedAt: integration.connectedAt,
      lastTestedAt: integration.lastTestedAt,
      testOk: integration.testOk,
    });
  } catch (error) {
    console.error('Failed to fetch EPJ integration:', error);
    return NextResponse.json({ error: 'Intern feil' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), 'epj-integration:post', { limit: 10 });
  if (limited) return limited;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = epjIntegrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ugyldig data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const credentials = {
      clientId: parsed.data.clientId,
      clientSecret: parsed.data.clientSecret,
      careUnitId: parsed.data.careUnitId,
      epjSystem: parsed.data.epjSystem,
    };

    // Test connection before saving
    const adapter = new LeyrAdapter(credentials);
    const testResult = await adapter.testConnection();

    const encrypted = encryptCredentials(credentials);

    const integration = await prisma.epjIntegration.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        epjSystem: parsed.data.epjSystem,
        careUnitId: parsed.data.careUnitId,
        encryptedCredentials: encrypted,
        isActive: testResult.ok,
        lastTestedAt: new Date(),
        testOk: testResult.ok,
      },
      update: {
        epjSystem: parsed.data.epjSystem,
        careUnitId: parsed.data.careUnitId,
        encryptedCredentials: encrypted,
        isActive: testResult.ok,
        lastTestedAt: new Date(),
        testOk: testResult.ok,
      },
    });

    await createAuditLog({
      userId: user.id,
      entityType: 'epj_integration',
      entityId: integration.id,
      action: 'create',
      changes: {
        epjSystem: parsed.data.epjSystem,
        careUnitId: parsed.data.careUnitId,
        testOk: testResult.ok,
      },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({
      isConnected: testResult.ok,
      epjSystem: parsed.data.epjSystem,
      careUnitId: parsed.data.careUnitId,
      testOk: testResult.ok,
      testError: testResult.error,
    });
  } catch (error) {
    console.error('Failed to save EPJ integration:', error);
    return NextResponse.json({ error: 'Intern feil' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const limited = rateLimit(getClientIp(req), 'epj-integration:delete', { limit: 10 });
  if (limited) return limited;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    await prisma.epjIntegration.deleteMany({
      where: { userId: user.id },
    });

    await createAuditLog({
      userId: user.id,
      entityType: 'epj_integration',
      entityId: user.id,
      action: 'delete',
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ isConnected: false });
  } catch (error) {
    console.error('Failed to delete EPJ integration:', error);
    return NextResponse.json({ error: 'Intern feil' }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/user/epj-integration/route.ts
git commit -m "feat: add EPJ integration management API (GET/POST/DELETE)"
```

---

## Task 12: Verify Phase 1 — TypeScript compilation

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No type errors. All new files compile cleanly.

**Step 2: Run dev server smoke test**

Run: `npm run dev` (briefly, then Ctrl+C)
Expected: No startup errors. Existing pages still work.

**Step 3: Commit any fixes if needed**

---

## Task 13: Update Editor — Replace Save/Approve with EPJ Push

**Files:**
- Modify: `src/app/editor/page.tsx`

This is the largest single file change. The key modifications are:

**Step 1: Add EPJ connection state and push handler**

Add these new state variables near the existing state declarations (around line 133):

```typescript
// EPJ connection state
const [epjConnected, setEpjConnected] = useState(false);
const [epjSystem, setEpjSystem] = useState('');
const [pushing, setPushing] = useState(false);
const [pushed, setPushed] = useState(false);
const [pushResult, setPushResult] = useState<{ epjNoteId?: string; epjUrl?: string } | null>(null);
const [showPushConfirm, setShowPushConfirm] = useState(false);
const [pushError, setPushError] = useState<string | null>(null);
```

Add EPJ connection check effect (after the existing useEffect hooks):

```typescript
// Check EPJ connection status on mount
useEffect(() => {
    fetchWithTimeout('/api/user/epj-integration')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (data) {
                setEpjConnected(data.isConnected || false);
                setEpjSystem(data.epjSystem || '');
            }
        })
        .catch(() => {});
}, []);
```

**Step 2: Replace handleSave with localStorage-only save**

Replace the existing `handleSave` (lines 330-379) with:

```typescript
const handleSaveLocal = useCallback(() => {
    if (!editor) return;
    try {
        const backup = {
            content: editor.getHTML(),
            template: activeTemplate,
            patientName,
            timestamp: Date.now(),
        };
        localStorage.setItem('vocura_editor_backup', JSON.stringify(backup));
        setHasUnsavedChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    } catch { /* localStorage full */ }
}, [editor, activeTemplate, patientName]);
```

**Step 3: Replace handleApprove with handlePushToEPJ**

Replace the existing `handleApprove` (lines 382-402) with:

```typescript
const handlePushToEPJ = useCallback(async () => {
    if (!editor) return;
    setPushing(true);
    setPushError(null);
    try {
        const res = await fetchWithTimeout('/api/export/epj', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: activeTemplate || 'Journalnotat',
                content: editor.getHTML(),
                patientId: patientName || 'unknown',
                patientDisplayName: patientName || '',
                diagnosisCodes: suggestedCodes
                    .filter(c => selectedCodes.includes(c.code))
                    .map(c => ({ code: c.code, system: c.system, label: c.label })),
                templateType: activeTemplate || undefined,
            }),
        });
        const data = await res.json();
        if (data.success) {
            setPushed(true);
            setPushResult({ epjNoteId: data.epjNoteId, epjUrl: data.epjUrl });
            localStorage.removeItem('vocura_editor_backup');
            setHasUnsavedChanges(false);
        } else {
            setPushError(data.error || 'Kunne ikke sende til EPJ');
        }
    } catch {
        setPushError('Nettverksfeil ved sending til EPJ');
    } finally {
        setPushing(false);
        setShowPushConfirm(false);
    }
}, [editor, activeTemplate, patientName, selectedCodes, suggestedCodes]);
```

**Step 4: Remove the 30-second auto-save to API**

In the auto-save useEffect (lines 433-506), remove the `autoSaveTimerRef.current = setTimeout(async () => { ... }, 30_000);` block. Keep only the localStorage backup part. The useEffect should look like:

```typescript
useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => {
        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
            return;
        }
        setHasUnsavedChanges(true);

        // Backup to localStorage immediately
        try {
            const backup = {
                content: editor.getHTML(),
                template: activeTemplate,
                patientName,
                timestamp: Date.now(),
            };
            localStorage.setItem('vocura_editor_backup', JSON.stringify(backup));
        } catch { /* localStorage full or unavailable */ }
    };
    editor.on('update', handleUpdate);
    return () => {
        editor.off('update', handleUpdate);
    };
}, [editor, activeTemplate, patientName]);
```

**Step 5: Update keyboard shortcuts**

Replace the keyboard shortcuts useEffect (lines 539-552) to use the new handlers:

```typescript
useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
            e.preventDefault();
            handleSaveLocal();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            if (epjConnected) {
                setShowPushConfirm(true);
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleSaveLocal, epjConnected]);
```

**Step 6: Update the action bar buttons (lines 629-701)**

Replace the action buttons section with:

```tsx
<div className="flex items-center gap-2">
    {/* FK toggle — stays */}
    <button
        onClick={() => setFkPanelOpen((o) => !o)}
        className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
            fkPanelOpen
                ? 'bg-[rgba(94,106,210,0.15)] text-[var(--accent-primary)]'
                : 'text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'
        )}
        title="Felleskatalogen (legemiddelassistent)"
    >
        <Bot className="w-3.5 h-3.5" />
        FK
    </button>

    {/* Unsaved indicator */}
    <div aria-live="polite" aria-atomic="true">
        {hasUnsavedChanges && (
            <span className="text-[11px] text-[#F59E0B] font-medium mr-1">Ulagret lokalt</span>
        )}
    </div>

    {/* Save locally */}
    <button
        onClick={handleSaveLocal}
        className="text-white hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-3 py-2 transition-colors duration-150 text-xs flex items-center gap-1.5 cursor-pointer"
        title="Lagre lokalt (Ctrl+S)"
    >
        {saved ? (
            <Check className="w-3.5 h-3.5 text-[#10B981]" />
        ) : (
            <Save className="w-3.5 h-3.5" />
        )}
        {saved ? 'Lagret!' : 'Lagre lokalt'}
    </button>

    {/* Send to EPJ — primary action */}
    <button
        onClick={() => epjConnected ? setShowPushConfirm(true) : undefined}
        disabled={pushing || !epjConnected}
        className={cn(
            "text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer rounded-lg font-medium transition-colors duration-150",
            pushed
                ? "bg-[#10B981] text-white font-semibold"
                : epjConnected
                    ? "bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white"
                    : "bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.3)] cursor-not-allowed"
        )}
        title={epjConnected ? "Send til EPJ (Ctrl+Enter)" : "Koble til EPJ i Innstillinger"}
    >
        {pushing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : pushed ? (
            <CheckCircle className="w-3.5 h-3.5" />
        ) : (
            <Send className="w-3.5 h-3.5" />
        )}
        {pushing ? 'Sender...' : pushed ? 'Sendt!' : 'Send til EPJ'}
    </button>

    {/* Copy */}
    <button
        onClick={handleCopy}
        className="border border-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 text-xs flex items-center gap-1.5 cursor-pointer"
        title="Kopier tekst"
    >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Kopiert!' : 'Kopier'}
    </button>

    {/* PDF Export */}
    <button
        onClick={handleExport}
        className="border border-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 text-xs flex items-center gap-1.5 cursor-pointer"
    >
        <Download className="w-3.5 h-3.5" /> PDF
    </button>
</div>
```

**Step 7: Add push confirmation modal**

Add before the closing `</div>` of the main component (before the FK panel's closing tag area), add the confirmation modal:

```tsx
{/* EPJ Push Confirmation Modal */}
{showPushConfirm && (
    <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
        onClick={() => setShowPushConfirm(false)}
    >
        <div
            className="bg-[#1A1A1A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
        >
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#5E6AD2]" />
                Send til EPJ
            </h3>
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-[rgba(255,255,255,0.5)]">Pasient</span>
                    <span className="text-white font-medium">{patientName || 'Ikke angitt'}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-[rgba(255,255,255,0.5)]">Notat</span>
                    <span className="text-white font-medium">{activeTemplate || 'Journalnotat'}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-[rgba(255,255,255,0.5)]">Koder</span>
                    <span className="text-white font-medium">{selectedCodes.length > 0 ? selectedCodes.join(', ') : 'Ingen'}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-[rgba(255,255,255,0.5)]">EPJ-system</span>
                    <span className="text-white font-medium capitalize">{epjSystem || 'Ukjent'}</span>
                </div>
            </div>
            {pushError && (
                <div className="mb-4 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-sm text-[#EF4444]">
                    {pushError}
                </div>
            )}
            <div className="flex gap-3">
                <button
                    onClick={() => setShowPushConfirm(false)}
                    className="flex-1 text-sm font-medium py-2.5 px-4 rounded-lg border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer"
                >
                    Avbryt
                </button>
                <button
                    onClick={handlePushToEPJ}
                    disabled={pushing}
                    className="flex-1 bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                    {pushing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {pushing ? 'Sender...' : 'Bekreft sending'}
                </button>
            </div>
        </div>
    </div>
)}

{/* EPJ Push Success Banner */}
{pushed && pushResult && (
    <div className="fixed bottom-6 right-6 z-50 bg-[#10B981] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium">
        <CheckCircle className="w-5 h-5" />
        <div>
            <p>Notat sendt til EPJ</p>
            {pushResult.epjNoteId && (
                <p className="text-xs opacity-80">Ref: {pushResult.epjNoteId}</p>
            )}
        </div>
        {pushResult.epjUrl && (
            <a
                href={pushResult.epjUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 underline text-xs"
            >
                Åpne i EPJ <ExternalLink className="w-3 h-3 inline" />
            </a>
        )}
        <button onClick={() => setPushed(false)} className="ml-2 cursor-pointer">
            <X className="w-4 h-4" />
        </button>
    </div>
)}
```

**Step 8: Remove unused state variables and imports**

Remove these now-unused variables:
- `journalEntryId` and `setJournalEntryId`
- `autoSaveStatus` and `setAutoSaveStatus`
- `autoSaveTimerRef`
- `showSaveToast` and `setShowSaveToast`
- `showApproveToast` and `setShowApproveToast`

Remove the existing load-from-API useEffect that fetches `/api/journal/${entryId}` (lines 192-212) since journal entries no longer exist in the DB.

Remove unused `saving` and `setSaving` state (replaced by `pushing`).
Remove `approved` and `setApproved` state (replaced by `pushed`).

**Step 9: Commit**

```bash
git add src/app/editor/page.tsx
git commit -m "feat: replace editor save/approve with EPJ push flow and localStorage drafts"
```

---

## Task 14: Update useFormSubmission Hook

**Files:**
- Modify: `src/hooks/useFormSubmission.ts`

**Step 1: Rewrite the hook**

Replace the entire file content:

```typescript
'use client';

import { useState, useCallback, useEffect } from 'react';

interface UseFormSubmissionOptions {
    formType: string;
}

export function useFormSubmission({ formType }: UseFormSubmissionOptions) {
    const [pushing, setPushing] = useState(false);
    const [pushed, setPushed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [localDraft, setLocalDraft] = useState<Record<string, unknown> | null>(null);

    const draftKey = `vocura_form_draft_${formType}`;

    // Restore draft from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(draftKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.data && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    setLocalDraft(parsed.data);
                }
            }
        } catch { /* ignore */ }
    }, [draftKey]);

    const saveDraftLocally = useCallback((data: Record<string, unknown>) => {
        try {
            localStorage.setItem(
                draftKey,
                JSON.stringify({ data, timestamp: Date.now() })
            );
            setLocalDraft(data);
        } catch { /* localStorage full */ }
    }, [draftKey]);

    const clearDraft = useCallback(() => {
        localStorage.removeItem(draftKey);
        setLocalDraft(null);
    }, [draftKey]);

    const pushToEPJ = useCallback(async (
        data: Record<string, unknown>,
        patientId: string,
        title: string
    ) => {
        setPushing(true);
        setError(null);
        try {
            // Build content from form data
            const content = Object.entries(data)
                .filter(([, v]) => v !== '' && v !== null && v !== undefined)
                .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
                .join('');

            const res = await fetch('/api/export/epj', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `${formType} - ${title}`,
                    content,
                    patientId: patientId || 'unknown',
                    templateType: formType,
                }),
            });

            const result = await res.json();
            if (result.success) {
                setPushed(true);
                clearDraft();
                return result;
            } else {
                setError(result.error || 'Kunne ikke sende til EPJ');
                return null;
            }
        } catch {
            setError('Nettverksfeil ved sending til EPJ');
            return null;
        } finally {
            setPushing(false);
        }
    }, [formType, clearDraft]);

    const exportPdf = useCallback(async (data: Record<string, unknown>, title: string, author: string) => {
        try {
            const sections = Object.entries(data)
                .filter(([, v]) => v !== '' && v !== null && v !== undefined)
                .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
                .join('');

            const res = await fetch('/api/export/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: sections,
                    title,
                    type: 'form',
                    author,
                }),
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${formType}-${new Date().toISOString().split('T')[0]}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Export failed:', err);
        }
    }, [formType]);

    return {
        pushing,
        pushed,
        error,
        localDraft,
        saveDraftLocally,
        clearDraft,
        pushToEPJ,
        exportPdf,
    };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useFormSubmission.ts
git commit -m "feat: rewrite useFormSubmission for EPJ push + localStorage drafts"
```

**Note:** The 17 form pages that use this hook will need minor updates to match the new API (e.g., `submitForm` → `pushToEPJ`, `saveAsDraft` → `saveDraftLocally`). These should be updated across all form pages to use the new return values. The compiler will surface the breaking changes.

---

## Task 15: Update Sidebar Navigation

**Files:**
- Modify: `src/components/AppSidebar.tsx`

**Step 1: Update NAV_SECTIONS**

Replace the `NAV_SECTIONS` constant (lines 28-53) with:

```typescript
const NAV_SECTIONS = [
    {
        label: 'Arbeidsflyt',
        items: [
            { href: '/dashboard', label: 'Oversikt', icon: LayoutDashboard },
            { href: '/dictation', label: 'Diktering', icon: Mic },
            { href: '/editor', label: 'Editor', icon: PenLine },
            { href: '/activity', label: 'EPJ-aktivitet', icon: Activity },
        ],
    },
    {
        label: 'Verktoy',
        items: [
            { href: '/forms', label: 'Skjemaer', icon: ClipboardList },
            { href: '/templates', label: 'Maler', icon: LayoutGrid },
            { href: '/summary', label: 'Oppsummering', icon: Sparkles },
        ],
    },
    {
        label: 'Referanse',
        items: [
            { href: '/lab', label: 'Laboratorium', icon: FlaskConical },
            { href: '/felleskatalogen', label: 'Felleskatalogen', icon: Bot },
        ],
    },
];
```

**Step 2: Add Settings link and import**

Add `Settings` to the lucide-react import (line 6-21). Add after the user profile section (around line 236, before the closing `</>` of `sidebarContent`):

```tsx
{/* Settings link */}
<div className="px-3 pb-2">
    <Link
        href="/settings"
        onClick={handleNavClick}
        className={cn(
            'group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150',
            pathname === '/settings'
                ? 'bg-[var(--surface-overlay)] text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]'
        )}
    >
        <Settings className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
        <span>Innstillinger</span>
    </Link>
</div>
```

**Step 3: Remove the Journal `BookOpen` import if no longer used**

Remove `BookOpen` from the lucide-react import.

**Step 4: Commit**

```bash
git add src/components/AppSidebar.tsx
git commit -m "feat: update sidebar - replace Journal with EPJ-aktivitet, add Innstillinger"
```

---

## Task 16: Create Settings Page

**Files:**
- Create: `src/app/settings/page.tsx`

**Step 1: Write the settings page**

This page has 3 sections: EPJ connection, profile, and privacy. It uses the `AppSidebar` layout and fetches/saves EPJ integration credentials.

Create `src/app/settings/page.tsx` with:
- EPJ system dropdown (DIPS, EG Pasientsky, Pridok)
- Client ID, Client Secret, Care Unit ID inputs
- "Test tilkobling" button that calls `POST /api/user/epj-integration`
- Connection status display with green/red indicator
- "Koble fra" button that calls `DELETE /api/user/epj-integration`

The page should follow the existing Vocura design patterns (dark theme, `var(--*)` CSS variables, similar to the admin page structure).

**Step 2: Add `/settings` to the middleware protected routes**

In `middleware.ts`, add `/settings` to the list of protected routes if not already covered by the pattern.

**Step 3: Commit**

```bash
git add src/app/settings/page.tsx
git commit -m "feat: add Settings page with EPJ connection configuration"
```

---

## Task 17: Create Activity Page (replaces Journal)

**Files:**
- Create: `src/app/activity/page.tsx`

**Step 1: Write the activity page**

Create a page that displays today's EPJ push activity from audit logs. It fetches `GET /api/audit-logs?entityType=epj_push` (or queries directly if no such route exists yet — in that case, create a simple server component that reads from Prisma directly).

Shows: timestamp, patient display name, EPJ system, note reference ID. No clinical content.

**Step 2: Commit**

```bash
git add src/app/activity/page.tsx
git commit -m "feat: add EPJ activity page showing push history"
```

---

## Task 18: Update Dashboard — EPJ Patient Search + Remove Recording Save

**Files:**
- Modify: `src/app/dashboard/page.tsx`

This is a significant file. The key changes are:

**Step 1: Add EPJ patient search**

Replace the patient name/ID input that searches `/api/patients` with a search that calls `/api/import/patient-context?search=`. Show results from EPJ if connected, otherwise keep as free-text input.

**Step 2: Remove recording save**

Find and remove the `POST /api/recordings` call that happens after transcription. The transcription result should stay in React state only.

**Step 3: Update quick action cards**

Replace "Lagre i Journal" with "Send til EPJ" action that routes to the editor.

**Step 4: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: update dashboard - EPJ patient search, remove recording persistence"
```

---

## Task 19: Update Form Pages to Use New Hook API

**Files:**
- Modify: All 17 files in `src/app/forms/*/page.tsx`

**Step 1: Update hook usage across all form pages**

Each form page calls `useFormSubmission({ formType, patientId })`. Update to `useFormSubmission({ formType })` and replace:
- `submitForm(data)` → `pushToEPJ(data, patientId, title)`
- `saveAsDraft(data)` → `saveDraftLocally(data)`
- `submitting` → `pushing`
- `submitted` → `pushed`
- `saving` → removed (localStorage saves are synchronous)
- `saved` → removed

Add "Last ned PDF" as a visible fallback alongside the push button.

**Step 2: Commit**

```bash
git add src/app/forms/
git commit -m "feat: update all form pages to use EPJ push + localStorage drafts"
```

---

## Task 20: Verify Phase 2-4 — Full Build Check

**Step 1: TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 2: Build check**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Manual smoke test**

Run: `npm run dev`
- Visit `/editor` — "Send til EPJ" button appears (disabled if no EPJ configured)
- Visit `/settings` — EPJ connection form renders
- Visit `/activity` — activity page renders
- Visit `/forms` — forms load without errors
- Visit `/dashboard` — dashboard loads without errors

**Step 4: Commit any fixes**

---

## Task 21: Database Backup (Phase 5 Prep)

**Step 1: Create pg_dump backup**

Run: `pg_dump $DATABASE_URL --format=custom -f vocura_backup_$(date +%Y%m%d).dump`
Expected: Backup file created.

**Step 2: Create NDJSON export script**

Create a one-off script `scripts/export-patient-data.ts` that exports all `patients`, `journal_entries`, `recordings`, `transcripts`, `form_submissions` as NDJSON.

**Step 3: Run the export**

Run: `npx tsx scripts/export-patient-data.ts`
Expected: NDJSON files created in `backups/` directory.

**Step 4: Commit the export script (not the data)**

```bash
git add scripts/export-patient-data.ts
git commit -m "chore: add patient data export script for backup before migration"
```

---

## Task 22: Drop Sensitive Tables (Phase 5)

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Remove models from schema**

Remove these models from `prisma/schema.prisma`:
- `Patient` (lines 28-48)
- `Recording` (lines 50-66)
- `Transcript` (lines 68-79)
- `JournalEntry` (lines 81-101)
- `FormSubmission` (lines 103-118)

Remove the corresponding relation fields from `User` model:
- `patients Patient[]`
- `recordings Recording[]`
- `journalEntries JournalEntry[]`
- `formSubmissions FormSubmission[]`

**Step 2: Run migration**

Run: `npx prisma migrate dev --name companion_pivot_drop_patient_tables`
Expected: Migration drops 5 tables successfully.

**Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: drop patient/journal/recording/transcript/form tables for companion pivot"
```

---

## Task 23: Delete Deprecated Routes and Pages

**Files:**
- Delete: `src/app/api/journal/route.ts`
- Delete: `src/app/api/journal/[id]/route.ts`
- Delete: `src/app/api/patients/route.ts`
- Delete: `src/app/journal/page.tsx`
- Delete any `src/app/api/recordings/` routes
- Delete any `src/app/api/forms/submissions/` routes

**Step 1: Delete the files**

Remove all deprecated files listed above.

**Step 2: Remove deprecated Zod schemas from validations.ts**

Remove from `src/lib/validations.ts`:
- `journalCreateSchema`, `journalUpdateSchema`
- `patientCreateSchema`, `patientUpdateSchema`
- `recordingCreateSchema`
- `formSubmissionCreateSchema`, `formSubmissionUpdateSchema`

**Step 3: Verify no remaining references**

Run: `grep -r "api/journal" src/ --include="*.ts" --include="*.tsx" -l`
Run: `grep -r "api/patients" src/ --include="*.ts" --include="*.tsx" -l`
Expected: No results (all references removed).

**Step 4: Full build check**

Run: `npm run build`
Expected: Clean build, no errors.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove deprecated journal/patient/recording routes and pages"
```

---

## Task 24: Final Verification

**Step 1: Full TypeScript check**

Run: `npx tsc --noEmit`
Expected: Zero errors.

**Step 2: Production build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Smoke test all routes**

Run: `npm run dev`
Test each route:
- `/` — landing page loads
- `/login` — login works
- `/dashboard` — recording flow works, no DB save errors
- `/editor` — "Send til EPJ" visible, copy/PDF export work
- `/settings` — EPJ connection form renders
- `/activity` — activity page loads
- `/forms` — form pages load, localStorage drafts work
- `/templates` — template management works
- `/summary` — patient summary generation works
- `/lab` — lab interpretation works
- `/felleskatalogen` — drug reference chat works

**Step 4: Final commit if needed**

```bash
git add -A
git commit -m "chore: companion tool pivot complete — final cleanup"
```
