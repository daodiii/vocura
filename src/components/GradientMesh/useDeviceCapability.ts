'use client';

import { useState, useEffect } from 'react';

export type GPUTier = 'high' | 'medium' | 'low';

function detectGPUTier(): GPUTier {
  if (typeof window === 'undefined') return 'low';

  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low';

  // Check WebGL availability
  const canvas = document.createElement('canvas');
  const gl =
    (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
    (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
  if (!gl) return 'low';

  // Check GPU renderer string for known low-tier indicators
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    const renderer = gl
      .getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      .toLowerCase();
    if (renderer.includes('swiftshader') || renderer.includes('llvmpipe'))
      return 'low';
    if (renderer.includes('mali-4') || renderer.includes('adreno 3'))
      return 'medium';
  }

  // Mobile detection via touch + screen size
  if ('ontouchstart' in window && window.innerWidth < 768) return 'medium';

  return 'high';
}

export function useDeviceCapability(): GPUTier {
  const [tier, setTier] = useState<GPUTier>('low'); // SSR-safe default

  useEffect(() => {
    setTier(detectGPUTier());
  }, []);

  return tier;
}
