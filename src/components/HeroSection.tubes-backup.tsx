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
