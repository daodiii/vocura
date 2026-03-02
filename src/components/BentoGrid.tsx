'use client';

import { useEffect, useRef } from 'react';

export default function BentoGrid({ children }: { children: React.ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const tiles = grid.querySelectorAll<HTMLElement>('.bento-tile');

    if (prefersReducedMotion) {
      tiles.forEach((tile) => tile.classList.add('bento-tile--visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('bento-tile--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    tiles.forEach((tile) => observer.observe(tile));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={gridRef} className="bento-grid">
      {children}
    </div>
  );
}
