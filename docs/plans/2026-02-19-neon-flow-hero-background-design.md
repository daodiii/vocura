# Neon Flow Hero Background — Design Doc

**Date:** 2026-02-19
**Branch:** feature/aurelius-redesign
**Status:** Approved

## Goal

Integrate the `TubesBackground` (neon-flow) Three.js animated tubes effect as a subtle, ambient background layer in the Vocura landing page hero section. Colors adapted to Vocura's indigo palette at low opacity to preserve professional clinical branding.

## Approach

**Approach A selected:** Adapt the CDN-based `TubesBackground` component for Next.js using `next/script` with `strategy="lazyOnload"`, with graceful degradation if the CDN fails.

## Files

### New
- `src/components/ui/neon-flow.tsx` — Adapted `TubesBackground` component (Next.js compatible)

### Modified
- `src/components/HeroSection.tsx` — Add `TubesBackground` as absolute background layer

### Backups
- `src/components/HeroSection.tubes-backup.tsx` — Copy of current `HeroSection.tsx` before changes
- `src/components/HeroSection.backup.tsx` — Existing GradientMesh backup (untouched)

## Component Design: `neon-flow.tsx`

### CDN Loading Strategy
- Use `next/script` with `strategy="lazyOnload"` to load `threejs-components@0.0.19` from jsDelivr
- Canvas initialized in a `useEffect` that listens for script load via `window.__tubesReady` callback pattern
- Script sets a global flag; effect polls or uses `onLoad` callback to attach the Three.js tubes to canvas

### Colors (Vocura indigo palette)
```
tubes.colors: ["#5E6AD2", "#7C6FD4", "#3B4FD4"]
lights.colors: ["#6366F1", "#8B5CF6", "#4F46E5", "#4338CA"]
lights.intensity: 150
```

### Opacity
- Canvas container: `opacity-[0.15]` — ambient/subtle, not distracting

### Interaction
- `enableClickInteraction: false` by default — no color randomization (professional feel)

### Degradation
- `try/catch` wraps initialization; on failure sets `loadFailed: true`
- If `loadFailed`, canvas div is hidden (`display: none`) — hero looks normal

### Framer Motion
- `framer-motion` installed but unused imports stripped from `neon-flow.tsx`
- Available for future use across the project

## Hero Integration

Layer order in `HeroSection.tsx`:
```
<section>
  ├── radial shade div (existing, aria-hidden)
  ├── outer border lines div (existing, aria-hidden)
  ├── [NEW] TubesBackground — absolute inset-0, z-0
  └── main content div (existing, z-10, pointer-events intact)
</section>
```

No layout, typography, spacing, or CTA changes.

## Dependencies

| Package | Version | Reason |
|---------|---------|--------|
| `framer-motion` | latest | Required by original component spec |
| `threejs-components` | `0.0.19` (CDN pinned) | Three.js tubes effect |

## Risk Notes

- **CDN availability:** jsDelivr is highly reliable with CDN redundancy. Pinned version `@0.0.19` ensures stability.
- **CSP headers:** If `next.config.ts` has strict CSP, the external script tag may need a nonce or hash. Not currently configured — no action needed now.
- **Performance:** Three.js loads ~600KB. `lazyOnload` strategy defers until after page is interactive.
- **Reduced motion:** `prefers-reduced-motion` should be respected — canvas hidden if user has this preference.
