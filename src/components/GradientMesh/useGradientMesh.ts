'use client';

import { useEffect, useRef } from 'react';
import { vertexShader } from './shaders/gradient.vert';
import { fragmentShader } from './shaders/gradient.frag';
import type { GPUTier } from './useDeviceCapability';

interface GradientMeshOptions {
  colors: [string, string, string, string];
  speed: number;
  tier: GPUTier;
}

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function compileShader(
  gl: WebGLRenderingContext,
  source: string,
  type: number
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vs: WebGLShader,
  fs: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function useGradientMesh(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: GradientMeshOptions
) {
  const rafId = useRef<number>(0);
  const isVisible = useRef(true);
  const mouseTarget = useRef({ x: 0.5, y: 0.5 });
  const mouseCurrent = useRef({ x: 0.5, y: 0.5 });
  const timeRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || options.tier === 'low') return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    }) as WebGLRenderingContext | null;

    if (!gl) return;

    // Compile shaders and create program
    const vs = compileShader(gl, vertexShader, gl.VERTEX_SHADER);
    const fs = compileShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = createProgram(gl, vs, fs);
    if (!program) return;

    gl.useProgram(program);

    // Full-screen triangle (covers viewport with a single triangle)
    const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const uniforms = {
      u_time: gl.getUniformLocation(program, 'u_time'),
      u_mouse: gl.getUniformLocation(program, 'u_mouse'),
      u_resolution: gl.getUniformLocation(program, 'u_resolution'),
      u_color1: gl.getUniformLocation(program, 'u_color1'),
      u_color2: gl.getUniformLocation(program, 'u_color2'),
      u_color3: gl.getUniformLocation(program, 'u_color3'),
      u_color4: gl.getUniformLocation(program, 'u_color4'),
      u_speed: gl.getUniformLocation(program, 'u_speed'),
    };

    // Set static color uniforms
    const [c1, c2, c3, c4] = options.colors.map(hexToVec3);
    gl.uniform3f(uniforms.u_color1, ...c1);
    gl.uniform3f(uniforms.u_color2, ...c2);
    gl.uniform3f(uniforms.u_color3, ...c3);
    gl.uniform3f(uniforms.u_color4, ...c4);
    gl.uniform1f(uniforms.u_speed, options.speed);

    // Resize handler
    const dprCap = options.tier === 'medium' ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width * dprCap;
      const h = rect.height * dprCap;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl!.viewport(0, 0, w, h);
        gl!.uniform2f(uniforms.u_resolution, w, h);
      }
    }

    resize();

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(canvas);

    // Intersection observer - pause when not visible
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { threshold: 0.01 }
    );
    intersectionObserver.observe(canvas);

    // Mouse tracking (only on high tier)
    const handleMouseMove =
      options.tier === 'high'
        ? (e: MouseEvent) => {
            const rect = canvas!.getBoundingClientRect();
            mouseTarget.current = {
              x: (e.clientX - rect.left) / rect.width,
              y: 1.0 - (e.clientY - rect.top) / rect.height,
            };
          }
        : null;

    if (handleMouseMove) {
      const hero = canvas.parentElement;
      hero?.addEventListener('mousemove', handleMouseMove);
    }

    // Animation loop
    function animate(timestamp: number) {
      if (!gl) return;

      if (document.hidden || !isVisible.current) {
        lastTimeRef.current = timestamp;
        rafId.current = requestAnimationFrame(animate);
        return;
      }

      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const delta = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;
      timeRef.current += delta;

      // Smooth mouse interpolation
      const lerp = 0.05;
      mouseCurrent.current.x +=
        (mouseTarget.current.x - mouseCurrent.current.x) * lerp;
      mouseCurrent.current.y +=
        (mouseTarget.current.y - mouseCurrent.current.y) * lerp;

      gl.uniform1f(uniforms.u_time, timeRef.current);
      gl.uniform2f(
        uniforms.u_mouse,
        mouseCurrent.current.x,
        mouseCurrent.current.y
      );

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafId.current = requestAnimationFrame(animate);
    }

    rafId.current = requestAnimationFrame(animate);

    // Context loss handling
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(rafId.current);
    };

    const handleContextRestored = () => {
      // Re-init would be complex; just reload the effect by re-mounting
      // The component will unmount/remount via React error boundary or state change
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId.current);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      if (handleMouseMove) {
        canvas.parentElement?.removeEventListener('mousemove', handleMouseMove);
      }
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, [canvasRef, options.colors, options.speed, options.tier]);
}
