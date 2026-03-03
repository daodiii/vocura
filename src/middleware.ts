// src/middleware.ts
import { updateSession } from '@/lib/supabase/middleware';
import { csrfProtect } from '@/lib/csrf';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/personvern',
  '/vilkar',
  '/sikkerhet',
  '/databehandleravtale',
  '/docs',
];

function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://api.openai.com https://*.supabase.co https://*.criipto.id",
    "frame-src 'self' https://*.criipto.id",
    "media-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://*.criipto.id",
  ].join('; ');
}

export async function middleware(request: NextRequest) {
  // Generate per-request nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCsp(nonce);

  // Pass nonce to server components via request headers
  const extraHeaders = new Headers();
  extraHeaders.set('x-nonce', nonce);
  extraHeaders.set('Content-Security-Policy', csp);

  const { supabaseResponse, user } = await updateSession(request, extraHeaders);
  const path = request.nextUrl.pathname;

  // Set CSP on the response
  supabaseResponse.headers.set('Content-Security-Policy', csp);

  // CSRF protection (double-submit cookie pattern)
  const csrfError = csrfProtect(request, supabaseResponse);
  if (csrfError) return csrfError;

  // Allow public routes
  if (PUBLIC_ROUTES.some((r) => path === r || path.startsWith(r + '/'))) {
    return supabaseResponse;
  }

  // Allow API routes and auth callbacks (they handle their own auth)
  if (path.startsWith('/api/') || path.startsWith('/auth/')) {
    return supabaseResponse;
  }

  // Allow static assets
  if (path.startsWith('/_next/') || path.includes('.')) {
    return supabaseResponse;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
