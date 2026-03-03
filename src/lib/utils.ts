import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { csrfHeaders } from './csrf-client';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 15000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  // Auto-include CSRF token header for state-changing requests
  const method = (options.method ?? 'GET').toUpperCase();
  let headers = options.headers;
  if (STATE_CHANGING_METHODS.includes(method)) {
    const csrf = csrfHeaders();
    headers = headers instanceof Headers
      ? (() => { Object.entries(csrf).forEach(([k, v]) => (headers as Headers).set(k, v)); return headers; })()
      : { ...csrf, ...(headers as Record<string, string> | undefined) };
  }

  try {
    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export function validateFnr(fnr: string): string | null {
  if (!fnr) return null;
  if (!/^\d{11}$/.test(fnr)) return 'Fødselsnummer må være nøyaktig 11 siffer';
  return null;
}
