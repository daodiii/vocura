/**
 * Client-side CSRF token helper.
 * Reads the CSRF token from the cookie and provides it for API requests.
 */

const CSRF_COOKIE = 'vocura_csrf';
const CSRF_HEADER = 'x-csrf-token';

/**
 * Read the CSRF token from the cookie.
 */
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Get headers object containing the CSRF token for use with fetch().
 * Usage: fetch('/api/...', { method: 'POST', headers: { ...csrfHeaders(), 'Content-Type': 'application/json' } })
 */
export function csrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  return token ? { [CSRF_HEADER]: token } : {};
}

/**
 * Wrapper around fetch that automatically includes the CSRF token header
 * on state-changing requests (POST, PUT, PATCH, DELETE).
 */
export async function csrfFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method ?? 'GET').toUpperCase();
  const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (needsCsrf) {
    const headers = new Headers(init?.headers);
    const token = getCsrfToken();
    if (token) {
      headers.set(CSRF_HEADER, token);
    }
    return fetch(input, { ...init, headers });
  }

  return fetch(input, init);
}
