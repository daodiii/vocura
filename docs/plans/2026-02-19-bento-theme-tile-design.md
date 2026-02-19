# Bento Theme Tile Design

## Overview

Add an interactive "Tema" tile to the empty slot in the landing page BentoGrid (bottom row, column 3). The tile lets visitors switch accent colors and toggle dark/light mode, with a live mini-dashboard preview that updates in real-time.

## Grid Placement

Fill the empty `.` cell in the CSS grid:

```
Before: "gdpr  kryptering  .        sikkerlag"
After:  "gdpr  kryptering  tilpass  sikkerlag"
```

Grid area class: `.bento-area-tilpass`
Animation index: `data-bento-index="9"` (delay ~600ms)

Responsive breakpoints also updated to include `tilpass` in tablet/mobile layouts.

## Tile Content

- **Eyebrow:** "Tema" (colored label)
- **Title:** "Din stil"
- **Mini preview:** A small dashboard card mockup with accent-colored bar, skeleton lines, and a pill badge. Responds live to accent/theme changes.
- **Controls:**
  - 3 accent color gradient dots (purple, red, blue) — ~20px, clickable
  - Sun/Moon toggle icon for dark/light mode

## Component Architecture

### New File: `src/components/BentoThemeTile.tsx`

Client component (`'use client'`) that:
- Uses existing `useAccentTheme()` hook for accent color switching
- Manages dark mode via existing `localStorage('vocura_dark_mode')` + `.dark` class on `<html>`
- Renders mini-preview card + accent dots + dark mode toggle

### Modified Files

1. **`src/app/page.tsx`** — Import `BentoThemeTile`, add tile 9 inside `<BentoGrid>`
2. **`src/app/globals.css`** — Add `.bento-area-tilpass`, update `grid-template-areas` for all breakpoints, add `data-bento-index="9"` stagger delay, add tile variant styles (`.bento-tile--tilpass`)

### No Changes To

- `useAccentTheme.ts`
- `AccentThemeSelector.tsx`
- `BentoGrid.tsx`
- Any other existing component

## Interactions

1. Visitor clicks accent dot -> `setAccent()` fires -> `data-accent` attribute on `<html>` updates -> page + mini-preview both change color
2. Visitor clicks sun/moon toggle -> dark class toggled on `<html>` + localStorage updated -> page + mini-preview both change theme
3. Mini-preview transitions smoothly (CSS `transition-colors`)

## Visual Design

- Follows existing 1x1 tile pattern (like Felleskatalogen, Lab, Summary)
- Mini-preview uses the same skeleton line style as other mockups (`bg-[rgba(255,255,255,0.08)]` etc.)
- Accent dots use gradient backgrounds matching `AccentThemeSelector` colors
- Dark mode toggle uses Lucide `Sun`/`Moon` icons
