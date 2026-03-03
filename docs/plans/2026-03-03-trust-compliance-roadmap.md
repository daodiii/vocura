# Trust & Compliance Roadmap — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Vocura from "we're secure, trust us" to "here's the evidence" — earn 100% trust from Norwegian GPs, clinic decision-makers, and patients within 3 months.

**Architecture:** Incremental additions to existing Next.js app. New Prisma models for auth events. New pages for patient info and accessibility. Enhanced existing pages (sikkerhet, databehandleravtale). New components (cookie banner, per-patient consent). Non-code deliverables (DPA PDF, DPIA, incident response plan, security whitepaper) tracked as tasks but written as markdown/content.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Prisma ORM, Supabase Auth, Vitest (new)

**Design doc:** `docs/plans/2026-03-03-trust-compliance-roadmap-design.md`

**Note:** Session timeout (15-min idle + 3-min warning) is ALREADY IMPLEMENTED in `src/components/SessionTimeout.tsx` and mounted in `src/app/layout.tsx:110`. No work needed.

---

## Task 1: Set Up Test Infrastructure (Vitest)

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `package.json` (add devDependencies + test script)
- Create: `src/test/helpers.ts`

**Step 1: Install Vitest and testing dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

**Step 2: Create Vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 3: Create test setup file**

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom/vitest'
```

**Step 4: Create test helpers**

Create `src/test/helpers.ts`:
```typescript
import { NextRequest } from 'next/server'

export function createMockRequest(
  method: string = 'GET',
  url: string = 'http://localhost:3000',
  options: { headers?: Record<string, string>; body?: unknown } = {}
): NextRequest {
  const init: RequestInit = { method }
  if (options.headers) {
    init.headers = new Headers(options.headers)
  }
  if (options.body) {
    init.body = JSON.stringify(options.body)
  }
  return new NextRequest(new URL(url), init)
}

export function mockPrismaClient() {
  return {
    authEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    consentLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  }
}
```

**Step 5: Add test script to package.json**

Add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 6: Run to verify setup works**

```bash
npm run test
```

Expected: "No test files found" (no errors about config).

**Step 7: Commit**

```bash
git add vitest.config.ts src/test/ package.json package-lock.json
git commit -m "chore: add Vitest test infrastructure"
```

---

## Task 2: Auth Event Logging — Prisma Model

**Files:**
- Modify: `prisma/schema.prisma` (add AuthEvent model after line ~67)
- Create: `src/lib/auth-events.ts`
- Create: `src/lib/__tests__/auth-events.test.ts`

**Step 1: Write the failing test**

Create `src/lib/__tests__/auth-events.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { createAuthEvent, AuthEventType } from '../auth-events'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    authEvent: {
      create: vi.fn().mockResolvedValue({ id: 'test-id' }),
      count: vi.fn().mockResolvedValue(0),
    },
  },
}))

describe('createAuthEvent', () => {
  it('creates a login event with required fields', async () => {
    const { prisma } = await import('@/lib/prisma')

    await createAuthEvent({
      userId: 'user-123',
      eventType: AuthEventType.LOGIN,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    })

    expect(prisma.authEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-123',
        eventType: 'login',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        success: true,
      }),
    })
  })

  it('creates a failed login event', async () => {
    const { prisma } = await import('@/lib/prisma')

    await createAuthEvent({
      userId: null,
      eventType: AuthEventType.LOGIN_FAILED,
      ipAddress: '10.0.0.1',
      userAgent: 'curl/7.0',
      success: false,
      metadata: { reason: 'invalid_credentials' },
    })

    expect(prisma.authEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventType: 'login_failed',
        success: false,
      }),
    })
  })
})

describe('AuthEventType', () => {
  it('has all required event types', () => {
    expect(AuthEventType.LOGIN).toBe('login')
    expect(AuthEventType.LOGOUT).toBe('logout')
    expect(AuthEventType.LOGIN_FAILED).toBe('login_failed')
    expect(AuthEventType.SESSION_TIMEOUT).toBe('session_timeout')
    expect(AuthEventType.MFA_CHALLENGE).toBe('mfa_challenge')
    expect(AuthEventType.MFA_SUCCESS).toBe('mfa_success')
    expect(AuthEventType.MFA_FAILED).toBe('mfa_failed')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/auth-events.test.ts
```

Expected: FAIL — module not found.

**Step 3: Add AuthEvent model to Prisma schema**

Add after the AuditLog model (~line 67) in `prisma/schema.prisma`:
```prisma
model AuthEvent {
  id        String   @id @default(uuid())
  userId    String?
  eventType String
  ipAddress String?
  userAgent String?
  success   Boolean  @default(true)
  metadata  Json?
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([eventType])
  @@index([createdAt])
  @@index([ipAddress, eventType])
}
```

Also add `authEvents AuthEvent[]` to the User model's relations.

**Step 4: Write auth-events.ts implementation**

Create `src/lib/auth-events.ts`:
```typescript
import { prisma } from '@/lib/prisma'

export enum AuthEventType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  SESSION_TIMEOUT = 'session_timeout',
  MFA_CHALLENGE = 'mfa_challenge',
  MFA_SUCCESS = 'mfa_success',
  MFA_FAILED = 'mfa_failed',
}

interface AuthEventParams {
  userId: string | null
  eventType: AuthEventType
  ipAddress: string | null
  userAgent: string | null
  success?: boolean
  metadata?: Record<string, unknown>
}

export async function createAuthEvent(params: AuthEventParams): Promise<void> {
  const { userId, eventType, ipAddress, userAgent, success = true, metadata } = params

  try {
    await prisma.authEvent.create({
      data: {
        userId,
        eventType,
        ipAddress,
        userAgent,
        success,
        metadata: metadata ?? undefined,
      },
    })
  } catch (error) {
    // Fallback: log to console for external aggregators (same pattern as audit.ts)
    console.error(JSON.stringify({
      level: 'error',
      message: 'Failed to write auth event to database',
      authEvent: { userId, eventType, ipAddress, success },
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }))
  }
}

export async function getFailedLoginCount(
  ipAddress: string,
  windowMinutes: number = 15
): Promise<number> {
  const since = new Date(Date.now() - windowMinutes * 60_000)

  return prisma.authEvent.count({
    where: {
      ipAddress,
      eventType: AuthEventType.LOGIN_FAILED,
      createdAt: { gte: since },
    },
  })
}
```

**Step 5: Run tests to verify they pass**

```bash
npx vitest run src/lib/__tests__/auth-events.test.ts
```

Expected: PASS

**Step 6: Run Prisma migration**

```bash
npx prisma migrate dev --name add-auth-events
```

**Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/ src/lib/auth-events.ts src/lib/__tests__/auth-events.test.ts
git commit -m "feat: add auth event logging model and service"
```

---

## Task 3: Integrate Auth Events into Auth Callback

**Files:**
- Modify: `src/app/auth/callback/route.ts` (add login event logging)
- Modify: `src/lib/supabase/middleware.ts` (add session expiry detection)

**Step 1: Read existing auth callback**

Read `src/app/auth/callback/route.ts` to understand the current flow.

**Step 2: Add login event logging to auth callback**

After successful auth exchange, add:
```typescript
import { createAuthEvent, AuthEventType } from '@/lib/auth-events'
import { getClientIp } from '@/lib/rate-limit'

// After successful session creation:
await createAuthEvent({
  userId: user.id,
  eventType: AuthEventType.LOGIN,
  ipAddress: getClientIp(request),
  userAgent: request.headers.get('user-agent'),
})
```

On auth failure, add:
```typescript
await createAuthEvent({
  userId: null,
  eventType: AuthEventType.LOGIN_FAILED,
  ipAddress: getClientIp(request),
  userAgent: request.headers.get('user-agent'),
  success: false,
  metadata: { error: error.message },
})
```

**Step 3: Add logout event logging**

Check if there's a logout route. If not, create `src/app/api/auth/logout/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAuthEvent, AuthEventType } from '@/lib/auth-events'
import { getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await createAuthEvent({
      userId: user.id,
      eventType: AuthEventType.LOGOUT,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent'),
    })
  }

  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', request.url))
}
```

**Step 4: Add session timeout event to SessionTimeout component**

Modify `src/components/SessionTimeout.tsx` — in the logout handler, fire a beacon:
```typescript
// Before redirecting on timeout:
navigator.sendBeacon('/api/auth/timeout-event', JSON.stringify({
  reason: 'session_timeout',
}))
```

Create `src/app/api/auth/timeout-event/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAuthEvent, AuthEventType } from '@/lib/auth-events'
import { getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await createAuthEvent({
      userId: user.id,
      eventType: AuthEventType.SESSION_TIMEOUT,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent'),
    })
  }

  return NextResponse.json({ ok: true })
}
```

**Step 5: Verify the build compiles**

```bash
npm run build
```

**Step 6: Commit**

```bash
git add src/app/auth/ src/app/api/auth/ src/components/SessionTimeout.tsx
git commit -m "feat: integrate auth event logging into login, logout, and session timeout"
```

---

## Task 4: Data Access Logging (Read Events)

**Files:**
- Modify: `src/lib/audit.ts` (add `view` action type)
- Modify: `src/app/api/clinical-notes/route.ts` (add read logging to GET)
- Create: `src/lib/__tests__/audit-read.test.ts`

**Step 1: Write the failing test**

Create `src/lib/__tests__/audit-read.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: 'test-id' }),
    },
  },
}))

describe('audit read-access logging', () => {
  it('accepts view as a valid action', async () => {
    const { createAuditLog } = await import('../audit')

    await createAuditLog({
      userId: 'user-123',
      entityType: 'clinical_note',
      entityId: 'note-456',
      action: 'view',
      ipAddress: '127.0.0.1',
    })

    const { prisma } = await import('@/lib/prisma')
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'view',
        entityType: 'clinical_note',
        entityId: 'note-456',
      }),
    })
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/audit-read.test.ts
```

Expected: May pass or fail depending on type checking — verify the `view` action is accepted.

**Step 3: Update audit.ts to include `view` action**

In `src/lib/audit.ts`, add `'view'` to the action type union in the `AuditLogParams` interface.

**Step 4: Add read-access logging to clinical notes GET**

In `src/app/api/clinical-notes/route.ts` GET handler, after fetching notes:
```typescript
import { createAuditLog } from '@/lib/audit'

// After fetching a specific note:
if (noteId) {
  // Fire and forget — don't block the response for read logging
  createAuditLog({
    userId: auth.user.id,
    entityType: 'clinical_note',
    entityId: noteId,
    action: 'view',
    ipAddress: getClientIp(request),
  }).catch(() => {}) // Silent fail for read events
}
```

**Step 5: Run tests**

```bash
npx vitest run
```

**Step 6: Commit**

```bash
git add src/lib/audit.ts src/lib/__tests__/audit-read.test.ts src/app/api/clinical-notes/route.ts
git commit -m "feat: add data access (view) logging for clinical notes"
```

---

## Task 5: Per-Patient Consent Workflow

**Files:**
- Modify: `src/app/dashboard/page.tsx` (~line 660-677, consent UI area)
- Modify: `src/app/api/consent/route.ts` (add `patient_ai_processing` consent type)
- Create: `src/lib/__tests__/patient-consent.test.ts`

**Step 1: Read the existing consent UI in dashboard**

Read `src/app/dashboard/page.tsx` lines 640-700 to understand the current consent toggle.

**Step 2: Add per-patient consent type to API**

In `src/app/api/consent/route.ts`, the existing consent types are `gdpr_data_processing`, `gdpr_audio_recording`, `gdpr_ai_processing`, `gdpr_data_retention`. Add validation to also accept `patient_ai_informed`.

**Step 3: Add per-patient consent checkbox to dashboard**

In `src/app/dashboard/page.tsx`, near the existing consent toggle (~line 660):

Add a new state:
```typescript
const [patientInformed, setPatientInformed] = useState(false)
```

Add a reset when patient context changes (when a new patient is loaded, reset the checkbox).

Add UI below the existing GDPR consent toggle:
```tsx
<div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
  <input
    type="checkbox"
    id="patient-informed"
    checked={patientInformed}
    onChange={(e) => setPatientInformed(e.target.checked)}
    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
  />
  <label htmlFor="patient-informed" className="text-sm text-amber-800 dark:text-amber-200">
    Pasienten er informert om at AI brukes til journalbehandling
  </label>
</div>
```

**Step 4: Gate recording start on per-patient consent**

In the `startRecording` function (~line 254), add check:
```typescript
if (!patientInformed) {
  alert('Du må bekrefte at pasienten er informert om AI-behandling før opptak.')
  return
}
```

**Step 5: Log per-patient consent to API**

When checkbox is toggled on, log to consent API:
```typescript
const handlePatientInformedChange = async (checked: boolean) => {
  setPatientInformed(checked)
  if (checked) {
    await csrfFetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
      body: JSON.stringify({
        consentType: 'patient_ai_informed',
        granted: true,
        version: '1.0',
      }),
    })
  }
}
```

**Step 6: Reset patient consent when patient context changes**

Find where patient context is loaded/changed in the dashboard. Add:
```typescript
setPatientInformed(false) // Reset for each new patient
```

**Step 7: Verify the build compiles**

```bash
npm run build
```

**Step 8: Commit**

```bash
git add src/app/dashboard/page.tsx src/app/api/consent/route.ts
git commit -m "feat: add per-patient AI consent workflow in dashboard"
```

---

## Task 6: Security.txt + Cookie Consent Banner

**Files:**
- Create: `public/.well-known/security.txt`
- Create: `src/components/CookieBanner.tsx`
- Modify: `src/app/layout.tsx` (mount banner)

**Step 1: Create security.txt**

Create `public/.well-known/security.txt`:
```
Contact: mailto:sikkerhet@vocura.no
Contact: mailto:personvern@vocura.no
Preferred-Languages: no, en
Canonical: https://vocura.no/.well-known/security.txt
Policy: https://vocura.no/sikkerhet
Expires: 2027-03-03T00:00:00.000Z
```

**Step 2: Create CookieBanner component**

Create `src/components/CookieBanner.tsx`:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('vocura_cookie_banner_dismissed')
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem('vocura_cookie_banner_dismissed', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Vi bruker kun nødvendige informasjonskapsler for innlogging og sikkerhet. Ingen sporing eller analyse.{' '}
          <a href="/personvern" className="underline text-indigo-600 dark:text-indigo-400">
            Les mer
          </a>
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          aria-label="Lukk"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
```

**Step 3: Mount CookieBanner in layout.tsx**

In `src/app/layout.tsx`, import and add `<CookieBanner />` before the closing `</body>` tag. Only show on public pages (not inside the authenticated app).

**Step 4: Verify build**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add public/.well-known/security.txt src/components/CookieBanner.tsx src/app/layout.tsx
git commit -m "feat: add security.txt and cookie consent banner"
```

---

## Task 7: Patient Information Page (`/pasientinformasjon`)

**Files:**
- Create: `src/app/pasientinformasjon/page.tsx`

**Step 1: Create the page**

Create `src/app/pasientinformasjon/page.tsx` — a public-facing page in plain Norwegian (B1 reading level) explaining:

1. **Hva er Vocura?** — Vocura hjelper legen din med å skrive journal ved hjelp av kunstig intelligens.
2. **Hva skjer med opptaket?** — Lyden slettes umiddelbart etter at teksten er laget. Den lagres aldri.
3. **Hvem kan se journalen?** — Bare legen din. Journalen er kryptert slik at ingen andre kan lese den.
4. **Kan AI-selskapet se mine data?** — Nei. OpenAI, som leverer AI-tjenesten, har ingen tilgang til dine helseopplysninger. Data brukes ikke til trening.
5. **Dine rettigheter** — Du kan be om innsyn, sletting, eller klage til Datatilsynet.
6. **Kontakt** — personvern@vocura.no

Design: Simple, clean, large text. Include a "Skriv ut" (Print) button that calls `window.print()` so clinics can print it as a handout.

Add metadata:
```typescript
export const metadata = {
  title: 'Informasjon til pasienter — Vocura',
  description: 'Informasjon om hvordan Vocura behandler helseopplysninger på vegne av din lege.',
}
```

**Step 2: Add link to footer/legal links**

Add link to `/pasientinformasjon` in the landing page footer and on `/sikkerhet`.

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/app/pasientinformasjon/
git commit -m "feat: add patient information page (/pasientinformasjon)"
```

---

## Task 8: Accessibility Statement Page (`/universell-utforming`)

**Files:**
- Create: `src/app/universell-utforming/page.tsx`

**Step 1: Create the page**

Create `src/app/universell-utforming/page.tsx` with:

1. **Status** — We strive for WCAG 2.1 AA compliance. This is our current self-assessment.
2. **What works** — Keyboard navigation, dark mode, semantic HTML, screen reader compatible forms.
3. **Known issues** — List any known gaps honestly (color contrast in some areas, missing alt text, etc.).
4. **Our plan** — Timeline for full WCAG audit and remediation.
5. **Report issues** — tilgjengelighet@vocura.no or personvern@vocura.no

Match the design of other legal pages (`/personvern`, `/vilkar`).

**Step 2: Add link to legal footer**

Add `/universell-utforming` link alongside other legal links.

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/app/universell-utforming/
git commit -m "feat: add accessibility statement page (/universell-utforming)"
```

---

## Task 9: Enhanced `/sikkerhet` Page

**Files:**
- Modify: `src/app/sikkerhet/page.tsx`

**Step 1: Read the current sikkerhet page**

Read `src/app/sikkerhet/page.tsx` fully.

**Step 2: Add data flow diagram section**

After the existing security pillars, add a visual data flow section:
- Microphone → Browser (encryption) → Supabase EU → Doctor only
- Show that audio is deleted immediately
- Show that OpenAI only receives transient API calls, no storage

Use a simple SVG or CSS-based diagram (no external dependencies).

**Step 3: Add sub-processor transparency section**

Add a table listing all sub-processors:

| Tjeneste | Formål | Databehandling | Region |
|----------|--------|----------------|--------|
| OpenAI | Transkripsjon, AI-strukturering | API-kall, ingen lagring | USA (EU SCCs) |
| Supabase | Database, autentisering | Kryptert lagring | EU (Frankfurt) |
| Criipto | BankID/Buypass | Identitetsverifisering | EU |
| Upstash | Hastighetsbegrensning | Kun tellere, ingen helsedata | EU |
| Sentry | Feilovervåking | Anonymisert, ingen PII | EU |

**Step 4: Add downloadable resources section**

Add a section with links to downloadable resources:
- Databehandleravtale (DPA) — link to `/databehandleravtale`
- Pasientinformasjon — link to `/pasientinformasjon`
- (Placeholder for security whitepaper PDF when ready)

**Step 5: Update trust badges**

Update the trust badges section to link to evidence:
- BankID badge → links to Criipto/BankID info
- GDPR badge → links to `/personvern`
- Normen badge → links to Normen self-assessment (when ready, use placeholder text)
- E2E badge → links to encryption section on same page

**Step 6: Verify build**

```bash
npm run build
```

**Step 7: Commit**

```bash
git add src/app/sikkerhet/page.tsx
git commit -m "feat: enhance security page with data flow, sub-processors, and resource links"
```

---

## Task 10: Upgrade DPA Page (`/databehandleravtale`)

**Files:**
- Modify: `src/app/databehandleravtale/page.tsx`

**Step 1: Read the current placeholder page**

Read `src/app/databehandleravtale/page.tsx`.

**Step 2: Replace placeholder with structured DPA content**

Replace the "under utvikling" placeholder with a full DPA page containing:

1. **Parter** — Vocura Technologies AS (databehandler) and the clinic (behandlingsansvarlig)
2. **Formål** — Processing of health data for journal documentation
3. **Kategorier av personopplysninger** — Health data (recordings, transcriptions, clinical notes), identity data (name, BankID), usage data
4. **Sikkerhetstiltak** — Reference to `/sikkerhet` page, encryption, access control, audit logging
5. **Underleverandører** — Same table as on `/sikkerhet`
6. **Varighet og sletting** — Default 48 hours after EPJ transfer, configurable
7. **Brudd** — Notification within 24 hours to clinic, 72 hours to Datatilsynet
8. **Kontakt** — personvern@vocura.no

Add a "Last ned som PDF" button (initially a placeholder that links to a future PDF).

Add a "Kontakt oss for å signere" CTA with mailto link.

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/app/databehandleravtale/page.tsx
git commit -m "feat: replace DPA placeholder with structured databehandleravtale content"
```

---

## Task 11: Incident Response Plan (Content Page)

**Files:**
- Create: `src/app/hendelseshaandtering/page.tsx`

**Step 1: Create incident response page**

Create a page at `/hendelseshaandtering` (incident handling) with:

1. **Varsling** — How incidents are detected (Sentry monitoring, audit log anomalies)
2. **Klassifisering** — Severity levels (kritisk, høy, middels, lav)
3. **Respons** — Steps: contain, assess, notify, remediate
4. **Varsling av kunder** — Clinics notified within 24 hours of confirmed breach
5. **Varsling av myndigheter** — Datatilsynet within 72 hours per GDPR Art. 33
6. **Kontakt** — sikkerhet@vocura.no for reporting security incidents

This is a public-facing summary. The detailed internal runbook is a non-code document.

**Step 2: Link from `/sikkerhet` page**

Add a link to `/hendelseshaandtering` from the security page.

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/app/hendelseshaandtering/
git commit -m "feat: add incident response plan page (/hendelseshaandtering)"
```

---

## Task 12: DPIA Summary Page

**Files:**
- Create: `src/app/dpia/page.tsx`

**Step 1: Create DPIA summary page**

Create `/dpia` page with a public-facing summary of the Data Protection Impact Assessment:

1. **Beskrivelse av behandlingen** — What data, why, legal basis (GDPR Art. 6(1)(b) + Art. 9(2)(h))
2. **Nødvendighet og proporsjonalitet** — Why AI processing is necessary, data minimization measures
3. **Risikovurdering** — Identified risks and mitigations (unauthorized access → encryption + BankID; data breach → auto-deletion + audit; AI errors → human review requirement)
4. **Tiltak** — Security measures implemented (reference `/sikkerhet`)
5. **Konklusjon** — Residual risk is acceptable given mitigations

**Step 2: Link from `/personvern` and `/sikkerhet`**

Add links to the DPIA from privacy policy and security pages.

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/app/dpia/
git commit -m "feat: add DPIA summary page (/dpia)"
```

---

## Task 13: AI Governance Documentation

**Files:**
- Create: `src/app/ai-styring/page.tsx`

**Step 1: Create AI governance page**

Create `/ai-styring` page explaining how Vocura uses AI responsibly:

1. **Bruk av AI** — Transcription (Whisper), note structuring (GPT-4o), diagnosis code suggestions (GPT-4o)
2. **Klinisk ansvar** — AI is a support tool. The doctor reviews, edits, and approves all output. The doctor retains full clinical and legal responsibility.
3. **Begrensninger** — AI can make errors. All suggestions must be verified by the clinician.
4. **Databehandling** — No patient data is used for model training. API calls are transient.
5. **Validering** — How we validate AI output quality (prompt engineering, temperature control, domain-specific prompts in Norwegian)
6. **Kontakt** — ai@vocura.no or personvern@vocura.no

**Step 2: Link from `/sikkerhet` and `/vilkar`**

Add links to AI governance from security and terms pages.

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/app/ai-styring/
git commit -m "feat: add AI governance page (/ai-styring)"
```

---

## Task 14: SLA Definition Page

**Files:**
- Create: `src/app/sla/page.tsx`

**Step 1: Create SLA page**

Create `/sla` page with:

1. **Tilgjengelighet** — 99.5% uptime target (measured monthly, excluding planned maintenance)
2. **Planlagt vedlikehold** — Announced 48 hours in advance, scheduled outside business hours (18:00-06:00 CET)
3. **Støtte** — Response times: 4 hours for critical/data incidents, 24 hours for non-critical
4. **Kommunikasjon** — Status page (future), email notifications for outages
5. **Kompensasjon** — Service credit policy (if applicable)

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/app/sla/
git commit -m "feat: add SLA definition page (/sla)"
```

---

## Task 15: Vendor Risk Assessment Package

**Files:**
- Create: `src/app/sikkerhetsdokumentasjon/page.tsx`

**Step 1: Create security documentation landing page**

Create `/sikkerhetsdokumentasjon` as a hub page where clinic IT managers can find all compliance documentation:

1. **Databehandleravtale** → `/databehandleravtale`
2. **Personvernerklæring** → `/personvern`
3. **Sikkerhetstiltak** → `/sikkerhet`
4. **DPIA** → `/dpia`
5. **Hendelseshåndtering** → `/hendelseshaandtering`
6. **AI-styring** → `/ai-styring`
7. **SLA** → `/sla`
8. **Universell utforming** → `/universell-utforming`
9. **Pasientinformasjon** → `/pasientinformasjon`

Add a section: "Trenger du mer informasjon? Kontakt oss på sikkerhet@vocura.no for en komplett leverandørvurdering."

**Step 2: Link from `/sikkerhet` as primary resource hub**

Add prominent link from security page.

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/app/sikkerhetsdokumentasjon/
git commit -m "feat: add security documentation hub for vendor risk assessment"
```

---

## Task 16: Final Integration — Update Navigation & Legal Footer

**Files:**
- Modify: `src/app/page.tsx` (landing page footer links)
- Modify: `src/app/sikkerhet/page.tsx` (cross-links)
- Modify: `src/app/personvern/page.tsx` (DPIA link)
- Modify: `src/app/vilkar/page.tsx` (AI governance link)

**Step 1: Update landing page footer**

Add links to new pages in the footer:
- Sikkerhetsdokumentasjon
- Pasientinformasjon
- Universell utforming

**Step 2: Cross-link all new pages**

Ensure each new page links back to `/sikkerhet` and `/sikkerhetsdokumentasjon` as the hub.

**Step 3: Verify build and all links**

```bash
npm run build
```

**Step 4: Run all tests**

```bash
npm run test
```

**Step 5: Commit**

```bash
git add src/app/page.tsx src/app/sikkerhet/page.tsx src/app/personvern/page.tsx src/app/vilkar/page.tsx
git commit -m "feat: update navigation and cross-links for trust documentation pages"
```

---

## Summary

| Task | Type | Effort | Priority |
|------|------|--------|----------|
| 1. Test infrastructure | Code | 15 min | Foundation |
| 2. Auth event model | Code + DB | 30 min | Critical |
| 3. Auth event integration | Code | 30 min | Critical |
| 4. Data access logging | Code | 20 min | Critical |
| 5. Per-patient consent | Code + UI | 45 min | Critical |
| 6. Security.txt + cookie banner | Code + UI | 20 min | High |
| 7. Patient info page | Content + UI | 30 min | High |
| 8. Accessibility statement | Content + UI | 20 min | High |
| 9. Enhanced sikkerhet page | Content + UI | 45 min | High |
| 10. DPA page upgrade | Content + UI | 45 min | High |
| 11. Incident response plan | Content + UI | 30 min | High |
| 12. DPIA summary | Content + UI | 30 min | High |
| 13. AI governance | Content + UI | 30 min | High |
| 14. SLA definition | Content + UI | 20 min | Medium |
| 15. Vendor risk assessment hub | Content + UI | 20 min | Medium |
| 16. Navigation integration | Code + UI | 20 min | Final |

## Non-Code Deliverables (tracked separately)

These are essential but not implementable as code tasks:
- **Security whitepaper PDF** — 8-10 page document for decision-makers
- **DPA as signable PDF** — Professional legal document
- **Normen self-assessment** — Formal compliance documentation
- **Penetration test** — Commission third-party firm
- **Sub-processor DPAs** — Collect from OpenAI, Supabase, Criipto, Upstash, Sentry
- **WCAG audit** — Run axe + Lighthouse, document findings
- **MFA implementation** — Requires Supabase Auth Pro plan evaluation (separate task)
