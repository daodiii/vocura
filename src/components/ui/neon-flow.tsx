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
