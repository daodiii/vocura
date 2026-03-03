import { NextResponse, type NextRequest } from 'next/server';

const CSRF_COOKIE = 'vocura_csrf';
const CSRF_HEADER = 'x-csrf-token';
const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Internal/cron API routes that authenticate via Authorization bearer token
 * and are never called from a browser session. Only these paths are exempt
 * from CSRF validation.
 */
const BEARER_ONLY_PATHS = ['/api/retention/cleanup'];

/**
 * Generate a cryptographically random CSRF token.
 */
function generateToken(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
}

/**
 * CSRF middleware using the double-submit cookie pattern.
 * - Sets a CSRF token cookie on every response if not present.
 * - For state-changing requests (POST/PUT/PATCH/DELETE) to API routes,
 *   validates that the x-csrf-token header matches the cookie value.
 * - Only specific bearer-token-only routes (e.g. cron jobs) are exempt from CSRF.
 */
export function csrfProtect(
  request: NextRequest,
  response: NextResponse
): NextResponse | null {
  const method = request.method.toUpperCase();
  const existingToken = request.cookies.get(CSRF_COOKIE)?.value;

  // Ensure CSRF cookie is always set
  if (!existingToken) {
    const token = generateToken();
    response.cookies.set(CSRF_COOKIE, token, {
      httpOnly: false, // Client JS needs to read this to send as header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }

  // Only validate on state-changing methods to API routes
  if (!STATE_CHANGING_METHODS.includes(method)) return null;
  if (!request.nextUrl.pathname.startsWith('/api/')) return null;

  // Exempt only specific internal/cron endpoints that use bearer-token auth
  if (
    request.headers.get('authorization') &&
    BEARER_ONLY_PATHS.includes(request.nextUrl.pathname)
  ) {
    return null;
  }

  // Validate: header token must match cookie token
  if (!existingToken) {
    return NextResponse.json(
      { error: 'Manglende CSRF-token. Last siden på nytt og prøv igjen.' },
      { status: 403 }
    );
  }

  const headerToken = request.headers.get(CSRF_HEADER);
  if (!headerToken || headerToken !== existingToken) {
    return NextResponse.json(
      { error: 'Ugyldig CSRF-token. Last siden på nytt og prøv igjen.' },
      { status: 403 }
    );
  }

  return null; // Valid — proceed
}

/**
 * Name of the CSRF cookie (for client-side reading).
 */
export const CSRF_COOKIE_NAME = CSRF_COOKIE;

/**
 * Name of the CSRF header (for client-side sending).
 */
export const CSRF_HEADER_NAME = CSRF_HEADER;
