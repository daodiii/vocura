'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { useDeviceCapability } from './useDeviceCapability';
import { useGradientMesh } from './useGradientMesh';

interface GradientMeshProps {
  colors?: [string, string, string, string];
  speed?: number;
  className?: string;
}

export function GradientMesh({
  colors = ['#7B2FBE', '#EC4899', '#F97316', '#5E6AD2'],
  speed = 0.4,
  className,
}: GradientMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tier = useDeviceCapability();

  useGradientMesh(canvasRef, { colors, speed, tier });

  // CSS fallback for low-tier devices / reduced motion
  if (tier === 'low') {
    return (
      <div className={cn('hero-gradient-bg', className)} aria-hidden="true">
        <div className="gradient-orb orb-pink" />
        <div className="gradient-orb orb-blue" />
        <div className="gradient-orb orb-purple" />
        <div className="gradient-orb orb-orange" />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none', className)}
      aria-hidden="true"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
