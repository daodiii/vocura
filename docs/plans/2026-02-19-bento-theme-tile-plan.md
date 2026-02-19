# Bento Theme Tile Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an interactive "Tema" bento tile to the landing page that lets visitors switch accent colors and dark/light mode with a live mini-dashboard preview.

**Architecture:** A new `BentoThemeTile` client component uses the existing `useAccentTheme()` hook and the existing dark-mode localStorage pattern from `ThemeToggle.tsx`. The component renders accent dots, a sun/moon toggle, and a mini-preview card that responds to theme changes via CSS variables. Grid CSS is updated to fill the empty bottom-row slot.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Lucide icons, existing `useAccentTheme` hook.

---

### Task 1: Add grid area and tile styles to CSS

**Files:**
- Modify: `src/app/globals.css:1061-1066` (desktop grid-template-areas)
- Modify: `src/app/globals.css:1073-1080` (tablet grid-template-areas)
- Modify: `src/app/globals.css:1087-1096` (mobile grid-template-areas)
- Modify: `src/app/globals.css:1138-1146` (grid area classes)
- Modify: `src/app/globals.css:1367-1375` (animation stagger delays)
- Modify: `src/app/globals.css:1148-1248` (tile gradient backgrounds)

**Step 1: Update desktop grid-template-areas**

In `src/app/globals.css`, find lines 1061-1066 and replace the `.` with `tilpass`:

```css
/* BEFORE */
  grid-template-areas:
    "diktering  diktering  journal    journal"
    "diktering  diktering  journal    journal"
    "skjemaer   skjemaer   felles     lab"
    "skjemaer   skjemaer   summary    sikkerlag"
    "gdpr       kryptering .          sikkerlag";

/* AFTER */
  grid-template-areas:
    "diktering  diktering  journal    journal"
    "diktering  diktering  journal    journal"
    "skjemaer   skjemaer   felles     lab"
    "skjemaer   skjemaer   summary    sikkerlag"
    "gdpr       kryptering tilpass    sikkerlag";
```

**Step 2: Update tablet grid-template-areas**

In the `@media (max-width: 1023px)` block (lines 1073-1080), add `tilpass` row:

```css
/* BEFORE */
    grid-template-areas:
      "diktering   diktering"
      "journal     journal"
      "skjemaer    skjemaer"
      "felles      felles"
      "lab         summary"
      "gdpr        kryptering"
      "sikkerlag   sikkerlag";

/* AFTER */
    grid-template-areas:
      "diktering   diktering"
      "journal     journal"
      "skjemaer    skjemaer"
      "felles      felles"
      "lab         summary"
      "gdpr        kryptering"
      "tilpass     sikkerlag";
```

**Step 3: Update mobile grid-template-areas**

In the `@media (max-width: 767px)` block (lines 1087-1096), add `tilpass`:

```css
/* BEFORE */
    grid-template-areas:
      "diktering"
      "journal"
      "skjemaer"
      "felles"
      "lab"
      "summary"
      "gdpr"
      "kryptering"
      "sikkerlag";

/* AFTER */
    grid-template-areas:
      "diktering"
      "journal"
      "skjemaer"
      "felles"
      "lab"
      "summary"
      "gdpr"
      "kryptering"
      "tilpass"
      "sikkerlag";
```

**Step 4: Add grid area class**

After line 1146 (`.bento-area-sikkerlag`), add:

```css
.bento-area-tilpass   { grid-area: tilpass; }
```

**Step 5: Add animation stagger delay**

After line 1375 (`.bento-tile--visible[data-bento-index="8"]`), add:

```css
.bento-tile--visible[data-bento-index="9"] { animation-delay: 600ms; }
```

**Step 6: Add tile gradient backgrounds**

After the `.dark .landing-page .bento-tile--security:hover` block (line 1197) and before the light-mode section comment, add dark-mode styles. Then after `.landing-page .bento-tile--security:hover` (line 1248), add light-mode styles:

Dark mode (after line 1197):
```css
.dark .landing-page .bento-tile--tilpass {
  background: linear-gradient(145deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.04) 40%, #111111 100%);
}
.dark .landing-page .bento-tile--tilpass:hover {
  border-color: rgba(139, 92, 246, 0.18);
}
```

Light mode (after line 1248):
```css
.landing-page .bento-tile--tilpass {
  background: linear-gradient(145deg, rgba(139, 92, 246, 0.06) 0%, rgba(236, 72, 153, 0.03) 40%, #FFFFFF 100%);
}
.landing-page .bento-tile--tilpass:hover {
  border-color: rgba(139, 92, 246, 0.2);
}
```

**Step 7: Verify dev server compiles**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
Expected: `200`

**Step 8: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add bento grid area and styles for theme tile"
```

---

### Task 2: Create the BentoThemeTile component

**Files:**
- Create: `src/components/BentoThemeTile.tsx`

**Step 1: Create the component file**

Create `src/components/BentoThemeTile.tsx` with the full implementation:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAccentTheme, type AccentTheme } from '@/hooks/useAccentTheme';
import { cn } from '@/lib/utils';

const DARK_MODE_KEY = 'vocura_dark_mode';

const ACCENTS: { key: AccentTheme; label: string; colors: [string, string] }[] = [
  { key: 'purple', label: 'Lilla', colors: ['#8B5CF6', '#EC4899'] },
  { key: 'red', label: 'Rod', colors: ['#EC4899', '#F97316'] },
  { key: 'blue', label: 'Bla', colors: ['#06B6D4', '#3B82F6'] },
];

export default function BentoThemeTile() {
  const { accent, setAccent, mounted } = useAccentTheme();
  const [darkMode, setDarkMode] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const stored = localStorage.getItem(DARK_MODE_KEY);
    setDarkMode(stored === 'true');
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem(DARK_MODE_KEY, next.toString());
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted || !hasMounted) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Mini dashboard preview card */}
      <div
        className="rounded-lg border border-[rgba(255,255,255,0.06)] p-3 transition-all duration-300"
        style={{
          background: darkMode
            ? 'rgba(255,255,255,0.04)'
            : 'rgba(0,0,0,0.03)',
        }}
      >
        {/* Accent bar at top */}
        <div
          className="h-1.5 rounded-full mb-3 transition-all duration-300"
          style={{
            background: `linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))`,
          }}
        />
        {/* Skeleton text lines */}
        <div className="space-y-1.5">
          <div
            className="h-1.5 rounded w-full transition-colors duration-300"
            style={{
              background: darkMode
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.06)',
            }}
          />
          <div
            className="h-1.5 rounded w-3/4 transition-colors duration-300"
            style={{
              background: darkMode
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.04)',
            }}
          />
          <div
            className="h-1.5 rounded w-1/2 transition-colors duration-300"
            style={{
              background: darkMode
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(0,0,0,0.03)',
            }}
          />
        </div>
        {/* Accent pill badge */}
        <div className="mt-2.5 flex items-center gap-2">
          <span
            className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded transition-all duration-300"
            style={{
              background: 'var(--accent-bg)',
              color: 'var(--accent-text)',
            }}
          >
            Aktiv
          </span>
          <div
            className="h-1 rounded-full flex-1 transition-colors duration-300"
            style={{
              background: darkMode
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(0,0,0,0.03)',
            }}
          />
        </div>
      </div>

      {/* Controls row: accent dots + dark mode toggle */}
      <div className="flex items-center justify-between">
        {/* Accent color dots */}
        <div className="flex items-center gap-2" role="radiogroup" aria-label="Aksentfarge">
          {ACCENTS.map((a) => (
            <button
              key={a.key}
              role="radio"
              aria-checked={accent === a.key}
              aria-label={a.label}
              onClick={() => setAccent(a.key)}
              className={cn(
                'w-5 h-5 rounded-full cursor-pointer transition-all duration-200',
                accent === a.key
                  ? 'scale-110'
                  : 'opacity-40 hover:opacity-80'
              )}
              style={{
                background: `linear-gradient(135deg, ${a.colors[0]}, ${a.colors[1]})`,
                ...(accent === a.key
                  ? { boxShadow: `0 0 0 2px var(--surface-primary, #111), 0 0 0 4px ${a.colors[0]}` }
                  : {}),
              }}
              title={a.label}
            />
          ))}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer',
            darkMode
              ? 'bg-[rgba(255,255,255,0.08)] text-[#F59E0B] hover:bg-[rgba(255,255,255,0.12)]'
              : 'bg-[rgba(0,0,0,0.04)] text-[#5C5C5C] hover:bg-[rgba(0,0,0,0.08)]'
          )}
          title={darkMode ? 'Lyst modus' : 'Morkt modus'}
          aria-label={darkMode ? 'Bytt til lyst modus' : 'Bytt til morkt modus'}
        >
          {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Verify dev server compiles**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
Expected: `200`

**Step 3: Commit**

```bash
git add src/components/BentoThemeTile.tsx
git commit -m "feat: create BentoThemeTile interactive component"
```

---

### Task 3: Add the tile to the landing page

**Files:**
- Modify: `src/app/page.tsx:1-14` (imports)
- Modify: `src/app/page.tsx:512-526` (tile insertion before `</BentoGrid>`)

**Step 1: Add import**

In `src/app/page.tsx`, after the line `import BentoGrid from "@/components/BentoGrid";` (line 14), add:

```tsx
import BentoThemeTile from "@/components/BentoThemeTile";
```

**Step 2: Add tile markup**

In `src/app/page.tsx`, after the Tile 9 "Sikker lagring" closing `</div>` (line 525) and before `</BentoGrid>` (line 526), add:

```tsx
            {/* Tile 10: Tema (customization, 1×1) */}
            <div
              className="bento-tile bento-tile--tilpass bento-area-tilpass"
              data-bento-index="9"
            >
              <span className="bento-tile-eyebrow text-[#8B5CF6]">
                Tema
              </span>
              <h3 className="bento-tile-title-sm">Din stil</h3>
              <BentoThemeTile />
            </div>
```

**Step 3: Verify the page loads without errors**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
Expected: `200`

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add Tema tile to landing page bento grid"
```

---

### Task 4: Visual verification and polish

**Step 1: Visually verify the tile in the browser**

Open `http://localhost:3000` and scroll to the bento grid section. Verify:
1. The "Tema" tile appears in the bottom row, third column (between Kryptering and Sikker lagring)
2. The eyebrow says "Tema" in purple, title says "Din stil"
3. The mini-preview card shows an accent-colored gradient bar, skeleton lines, and an "Aktiv" pill badge
4. Clicking the 3 accent dots changes the accent color across the entire page AND the mini-preview
5. Clicking the sun/moon icon toggles dark/light mode across the entire page AND the mini-preview card background
6. The tile animates in with the stagger sequence when scrolled into view
7. On tablet (< 1024px), the tile appears correctly in the grid
8. On mobile (< 768px), the tile appears as a full-width row

**Step 2: Fix any visual issues found**

If the mini-preview looks off in light mode (e.g., border not visible), adjust the border color:
- Light mode border: `rgba(0,0,0,0.06)`
- Dark mode border: `rgba(255,255,255,0.06)` (already set)

The border in `BentoThemeTile.tsx` may need to be dynamic. If needed, update the mini-preview card's border style to:

```tsx
borderColor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
```

**Step 3: Commit any polish fixes**

```bash
git add -A
git commit -m "fix: polish bento theme tile visual appearance"
```

Only create this commit if changes were made. Skip if no fixes were needed.
