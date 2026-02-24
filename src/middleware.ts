// src/middleware.ts
import { updateSession } from '@/lib/supabase/middleware';
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

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

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
