# Neon Flow Hero Background Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a subtle, ambient animated neon-tubes WebGL background to the Vocura landing page hero section using the `threejs-components` library loaded from jsDelivr CDN, adapted to Vocura's indigo color palette at low opacity.

**Architecture:** The `TubesBackground` component loads `threejs-components@0.0.19` via a `<Script>` tag (`next/script`, `strategy="lazyOnload"`). A canvas ref is initialized after the script loads via a `window.__onTubesScriptLoad` callback. The canvas sits as an absolute layer behind existing hero content. CSP headers in `next.config.ts` are updated to permit the jsDelivr CDN. Graceful degradation: if load fails, the canvas is hidden and the hero looks unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, `next/script`, `framer-motion` (installed, not used in this component), jsDelivr CDN (`threejs-components@0.0.19`)

---

## Task 1: Create backup of current HeroSection

**Files:**
- Read: `src/components/HeroSection.tsx`
- Create: `src/components/HeroSection.tubes-backup.tsx`

**Step 1: Copy current HeroSection to backup**

Create `src/components/HeroSection.tubes-backup.tsx` with the exact same content as `src/components/HeroSection.tsx`. This is the rollback point.

```tsx
// src/components/HeroSection.tubes-backup.tsx
// BACKUP: HeroSection before neon-flow integration (2026-02-19)
// To restore: copy this file's content back to HeroSection.tsx
'use client';

import Link from 'next/link';
import { ArrowRight, Rocket } from 'lucide-react';
import HeroCyclingWord from '@/components/HeroCyclingWord';

export default function HeroSection() {
  return (
    <section className="relative mx-auto w-full max-w-5xl overflow-visible">
      {/* Top radial gradient shade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 isolate hidden overflow-hidden lg:block"
      >
        <div className="absolute inset-0 -top-14 -z-10 hero-centered-shade" />
      </div>

      {/* Outer bold faded vertical borders (lg only) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mx-auto hidden min-h-[600px] w-full max-w-5xl lg:block"
      >
        <div className="hero-centered-outer-line hero-centered-outer-line--left" />
        <div className="hero-centered-outer-line hero-centered-outer-line--right" />
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center gap-5 px-4 pb-24 pt-32">
        {/* Inner decorative vertical border lines */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="hero-centered-inner-line hero-centered-inner-line--l1" />
          <div className="hero-centered-inner-line hero-centered-inner-line--r1" />
          <div className="hero-centered-inner-line hero-centered-inner-line--l2" />
          <div className="hero-centered-inner-line hero-centered-inner-line--r2" />
        </div>

        {/* Pill badge */}
        <a
          href="#produkt"
          className="hero-centered-badge hero-animate-badge"
        >
          <Rocket className="hero-centered-badge-icon" />
          <span className="hero-centered-badge-text">Ny funksjon lansert!</span>
          <span className="hero-centered-badge-divider" />
          <ArrowRight className="hero-centered-badge-arrow" />
        </a>

        {/* Headline */}
        <h1 className="hero-centered-headline hero-animate-headline">
          Fokuser på pasienten.
          <br />
          Vocura ordner bedre{' '}<HeroCyclingWord />
        </h1>

        {/* Subtitle */}
        <p className="hero-centered-subtitle hero-animate-subtitle">
          Ambient lytting og AI-automatisering for journalnotat,
          koding og klinisk dokumentasjon.
        </p>

        {/* CTA buttons */}
        <div className="hero-centered-ctas hero-animate-cta-1">
          <a href="mailto:hei@vocura.no" className="vocura-btn-cta-secondary rounded-full">
            Kontakt oss
          </a>
          <Link href="/login" className="vocura-btn-cta-primary rounded-full">
            Kom i gang
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/HeroSection.tubes-backup.tsx
git commit -m "chore: backup HeroSection before neon-flow integration"
```

---

## Task 2: Install framer-motion

**Files:**
- Modify: `package.json` (via npm)

**Step 1: Install the dependency**

```bash
npm install framer-motion
```

**Step 2: Verify installation**

```bash
node -e "require('framer-motion'); console.log('ok')"
```

Expected output: `ok`

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install framer-motion"
```

---

## Task 3: Update CSP to allow jsDelivr CDN

**Files:**
- Modify: `next.config.ts`

**Context:** The current `script-src` directive is `'self' 'unsafe-inline'`. Loading a `<script>` tag from `cdn.jsdelivr.net` requires adding that origin to `script-src` AND `connect-src` (Three.js makes worker requests).

**Step 1: Update `next.config.ts`**

Find the `cspDirectives` array and update two entries:

Change:
```ts
"script-src 'self' 'unsafe-inline'",
```
To:
```ts
"script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
```

Change:
```ts
"connect-src 'self' https://*.supabase.co https://api.openai.com",
```
To:
```ts
"connect-src 'self' https://*.supabase.co https://api.openai.com https://cdn.jsdelivr.net",
```

**Step 2: Verify the dev server restarts cleanly**

```bash
# If dev server is running, it will hot-reload. Otherwise:
npm run dev
```

Check terminal for no build errors.

**Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: allow jsDelivr CDN in CSP for neon-flow script"
```

---

## Task 4: Create the neon-flow component

**Files:**
- Create: `src/components/ui/neon-flow.tsx`

**Context:** The component uses `next/script` to load the CDN library. It sets `window.__onTubesScriptLoad` before the script tag mounts, so the script can call it when ready. The actual Three.js initialization happens inside a `useEffect` that runs after the canvas mounts. We use `window.__tubesScriptLoaded` as a flag in case the script loads before or after the effect runs.

**Step 1: Create `/src/components/ui/` directory and the component**

Create `src/components/ui/neon-flow.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { cn } from '@/lib/utils';

interface TubesBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

// Vocura indigo palette — subtle/ambient
const TUBE_COLORS = ['#5E6AD2', '#7C6FD4', '#3B4FD4'];
const LIGHT_COLORS = ['#6366F1', '#8B5CF6', '#4F46E5', '#4338CA'];

export function TubesBackground({ children, className }: TubesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const initializedRef = useRef(false);

  // When script loads, set state to trigger the init effect
  const handleScriptLoad = () => {
    setScriptReady(true);
  };

  const handleScriptError = () => {
    console.warn('[neon-flow] Failed to load threejs-components from CDN. Hero background disabled.');
    setLoadFailed(true);
  };

  useEffect(() => {
    if (!scriptReady || !canvasRef.current || initializedRef.current) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const TubesCursor = (window as any).TubesCursor;
    if (!TubesCursor) {
      console.warn('[neon-flow] TubesCursor not found on window after script load.');
      setLoadFailed(true);
      return;
    }

    try {
      TubesCursor(canvasRef.current, {
        tubes: {
          colors: TUBE_COLORS,
          lights: {
            intensity: 150,
            colors: LIGHT_COLORS,
          },
        },
      });
      initializedRef.current = true;
    } catch (err) {
      console.warn('[neon-flow] TubesCursor initialization failed:', err);
      setLoadFailed(true);
    }
  }, [scriptReady]);

  return (
    <>
      {!loadFailed && (
        <Script
          src="https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js"
          strategy="lazyOnload"
          onLoad={handleScriptLoad}
          onError={handleScriptError}
        />
      )}

      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-0 overflow-hidden',
          loadFailed && 'hidden',
          className
        )}
        aria-hidden="true"
      >
        <div className="absolute inset-0 opacity-[0.15]">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 block h-full w-full"
            style={{ touchAction: 'none' }}
          />
        </div>
      </div>

      {children}
    </>
  );
}

export default TubesBackground;
```

**Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors (or only pre-existing errors unrelated to this file).

**Step 3: Commit**

```bash
git add src/components/ui/neon-flow.tsx
git commit -m "feat: add TubesBackground neon-flow component"
```

---

## Task 5: Integrate TubesBackground into HeroSection

**Files:**
- Modify: `src/components/HeroSection.tsx`

**Context:** The `TubesBackground` renders as `position: absolute inset-0 z-0`. It must be inside the `<section>` which is already `position: relative`. The existing main content div is already `relative` — no z-index changes needed there. The component is `pointer-events-none` so it won't intercept clicks.

**Step 1: Add the import**

At the top of `src/components/HeroSection.tsx`, after the existing imports, add:

```tsx
import { TubesBackground } from '@/components/ui/neon-flow';
```

**Step 2: Insert the component**

Inside the `<section>` element, add `<TubesBackground />` after the outer border lines div and before the main content div:

The section should look like this after the change:

```tsx
<section className="relative mx-auto w-full max-w-5xl overflow-visible">
  {/* Top radial gradient shade */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 isolate hidden overflow-hidden lg:block"
  >
    <div className="absolute inset-0 -top-14 -z-10 hero-centered-shade" />
  </div>

  {/* Outer bold faded vertical borders (lg only) */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 mx-auto hidden min-h-[600px] w-full max-w-5xl lg:block"
  >
    <div className="hero-centered-outer-line hero-centered-outer-line--left" />
    <div className="hero-centered-outer-line hero-centered-outer-line--right" />
  </div>

  {/* Neon tubes ambient background */}
  <TubesBackground />

  {/* Main content */}
  <div className="relative flex flex-col items-center justify-center gap-5 px-4 pb-24 pt-32">
    {/* Inner decorative vertical border lines */}
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="hero-centered-inner-line hero-centered-inner-line--l1" />
      <div className="hero-centered-inner-line hero-centered-inner-line--r1" />
      <div className="hero-centered-inner-line hero-centered-inner-line--l2" />
      <div className="hero-centered-inner-line hero-centered-inner-line--r2" />
    </div>

    {/* Pill badge */}
    <a
      href="#produkt"
      className="hero-centered-badge hero-animate-badge"
    >
      <Rocket className="hero-centered-badge-icon" />
      <span className="hero-centered-badge-text">Ny funksjon lansert!</span>
      <span className="hero-centered-badge-divider" />
      <ArrowRight className="hero-centered-badge-arrow" />
    </a>

    {/* Headline */}
    <h1 className="hero-centered-headline hero-animate-headline">
      Fokuser på pasienten.
      <br />
      Vocura ordner bedre{' '}<HeroCyclingWord />
    </h1>

    {/* Subtitle */}
    <p className="hero-centered-subtitle hero-animate-subtitle">
      Ambient lytting og AI-automatisering for journalnotat,
      koding og klinisk dokumentasjon.
    </p>

    {/* CTA buttons */}
    <div className="hero-centered-ctas hero-animate-cta-1">
      <a href="mailto:hei@vocura.no" className="vocura-btn-cta-secondary rounded-full">
        Kontakt oss
      </a>
      <Link href="/login" className="vocura-btn-cta-primary rounded-full">
        Kom i gang
        <ArrowRight className="size-4" />
      </Link>
    </div>
  </div>
</section>
```

**Step 3: Check the browser**

Open http://localhost:3000. The hero should:
- Look identical to before (text, badge, CTAs unchanged)
- After ~2-3 seconds (lazyOnload), show subtle animated indigo tubes in the background

If the CDN fails (network issues, blocked), the hero should look completely normal — no broken elements.

**Step 4: Commit**

```bash
git add src/components/HeroSection.tsx
git commit -m "feat: integrate neon-flow TubesBackground into hero section"
```

---

## Rollback Instructions

If anything breaks, restore the backup:

```bash
cp src/components/HeroSection.tubes-backup.tsx src/components/HeroSection.tsx
```

To also remove the component and undo the CSP change:
```bash
git revert HEAD~1  # or manually revert next.config.ts and HeroSection.tsx
```
