import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const PROTECTED_PREFIXES = [
    '/dashboard',
    '/dictation',
    '/editor',
    '/journal',
    '/forms',
    '/summary',
    '/templates',
    '/admin',
    '/lab',
    '/felleskatalogen',
];

export async function middleware(request: NextRequest) {
    const { supabaseResponse, user } = await updateSession(request);
    const pathname = request.nextUrl.pathname;

    const isProtected = PROTECTED_PREFIXES.some((prefix) =>
        pathname === prefix || pathname.startsWith(prefix + '/')
    );

    if (isProtected && !user) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // If logged-in user visits /login, redirect to dashboard
    if (pathname === '/login' && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)',
    ],
};
