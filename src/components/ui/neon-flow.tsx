'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TubesBackgroundProps {
  className?: string;
}

// Vocura indigo palette — subtle/ambient
const TUBE_COLORS = ['#5E6AD2', '#7C6FD4', '#3B4FD4'];
const LIGHT_COLORS = ['#6366F1', '#8B5CF6', '#4F46E5', '#4338CA'];

const CDN_URL = 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js';

export function TubesBackground({ className }: TubesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || initializedRef.current) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let mounted = true;
    let destroy: (() => void) | undefined;

    // The CDN script is a native ES module with a default export — use dynamic import()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — no types for CDN module
    import(/* webpackIgnore: true */ CDN_URL)
      .then((mod) => {
        if (!mounted || !canvasRef.current) return;
        const TubesCursor = mod.default;
        if (typeof TubesCursor !== 'function') {
          console.warn('[neon-flow] TubesCursor is not a function.');
          setLoadFailed(true);
          return;
        }
        try {
          const instance = TubesCursor(canvasRef.current, {
            tubes: {
              colors: TUBE_COLORS,
              lights: {
                intensity: 150,
                colors: LIGHT_COLORS,
              },
            },
          });
          if (instance && typeof instance.dispose === 'function') {
            destroy = () => instance.dispose();
          }
          initializedRef.current = true;
        } catch (err) {
          console.warn('[neon-flow] TubesCursor initialization failed:', err);
          if (mounted) setLoadFailed(true);
        }
      })
      .catch((err) => {
        console.warn('[neon-flow] Failed to load threejs-components from CDN:', err);
        if (mounted) setLoadFailed(true);
      });

    return () => {
      mounted = false;
      destroy?.();
      initializedRef.current = false;
    };
  }, []);

  return (
    <div
      className={cn(
        'tubes-bg pointer-events-none absolute inset-0 z-0 overflow-hidden',
        loadFailed && 'hidden',
        className
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0" style={{ mixBlendMode: 'screen' }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full"
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  );
}

export default TubesBackground;
