import { NextResponse } from 'next/server';

interface RateLimitEntry {
    count: number;
    reset: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60_000; // 5 minutes
let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, entry] of store) {
        if (now > entry.reset) {
            store.delete(key);
        }
    }
}

/**
 * Extract client IP safely.
 * Prefers x-real-ip (set by Vercel/trusted proxies), then the rightmost
 * x-forwarded-for entry (added by the reverse proxy, not client-controllable).
 * Falls back to 127.0.0.1 for local development.
 */
export function getClientIp(req: Request): string {
    // x-real-ip is set by Vercel and trusted reverse proxies
    const realIp = req.headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }

    // Use the last entry in x-forwarded-for (added by the proxy, not the client)
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        const parts = forwarded.split(',');
        return parts[parts.length - 1].trim();
    }

    return '127.0.0.1';
}

interface RateLimitOptions {
    limit?: number;
    windowMs?: number;
}

/**
 * Check if a request should be rate-limited by IP.
 * Returns a NextResponse with 429 if rate-limited, or null if allowed.
 */
export function rateLimit(
    ip: string,
    route: string,
    options: RateLimitOptions = {}
): NextResponse | null {
    const { limit = 30, windowMs = 60_000 } = options;
    const key = `ip:${ip}:${route}`;
    const now = Date.now();

    cleanup();

    const entry = store.get(key);

    if (!entry || now > entry.reset) {
        store.set(key, { count: 1, reset: now + windowMs });
        return null;
    }

    entry.count++;

    if (entry.count > limit) {
        const retryAfter = Math.ceil((entry.reset - now) / 1000);
        return NextResponse.json(
            { error: 'For mange forespørsler. Vennligst vent litt.' },
            {
                status: 429,
                headers: { 'Retry-After': String(retryAfter) },
            }
        );
    }

    return null;
}

/**
 * Check if a request should be rate-limited by authenticated user ID.
 * Use this alongside IP-based rate limiting for defense-in-depth.
 * Returns a NextResponse with 429 if rate-limited, or null if allowed.
 */
export function rateLimitByUser(
    userId: string,
    route: string,
    options: RateLimitOptions = {}
): NextResponse | null {
    const { limit = 30, windowMs = 60_000 } = options;
    const key = `user:${userId}:${route}`;
    const now = Date.now();

    cleanup();

    const entry = store.get(key);

    if (!entry || now > entry.reset) {
        store.set(key, { count: 1, reset: now + windowMs });
        return null;
    }

    entry.count++;

    if (entry.count > limit) {
        const retryAfter = Math.ceil((entry.reset - now) / 1000);
        return NextResponse.json(
            { error: 'For mange forespørsler. Vennligst vent litt.' },
            {
                status: 429,
                headers: { 'Retry-After': String(retryAfter) },
            }
        );
    }

    return null;
}
