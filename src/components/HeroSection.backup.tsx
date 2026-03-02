'use client';

import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';
import { GradientMesh } from '@/components/GradientMesh';
import HeroCyclingWord from '@/components/HeroCyclingWord';

export default function HeroSection() {
  return (
    <section className="relative pt-24 pb-16 px-6 min-h-[70vh] flex items-center overflow-hidden">
      {/* Full-bleed WebGL gradient background */}
      <div className="absolute inset-0 hero-gradient-wrapper" aria-hidden="true">
        <GradientMesh
          colors={['#5E6AD2', '#EC4899', '#F97316', '#8B5CF6']}
          speed={0.4}
          className="absolute inset-0"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl">
          {/* Compliance badge */}
          <div className="hero-badge hero-animate-badge">
            <Shield className="w-3 h-3" />
            GDPR-kompatibel &amp; Norsk lovgivning
          </div>

          {/* Headline */}
          <h1 className="hero-headline text-left hero-animate-headline">
            AI-infrastruktur for
            <br />
            bedre <HeroCyclingWord />
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle text-left hero-animate-subtitle">
            Fang pasientsamtaler med ambient lytting. Automatiser journalnotater,
            koding og klinisk dokumentasjon med enestående presisjon.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start gap-3 mt-8">
            <Link href="/login" className="vocura-btn-cta-primary hero-animate-cta-1">
              Kom i gang
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a href="mailto:hei@vocura.no" className="vocura-btn-cta-secondary hero-animate-cta-2">
              Kontakt oss
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
