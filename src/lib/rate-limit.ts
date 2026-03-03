import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ---------------------------------------------------------------------------
// Upstash Redis rate limiter (production) — persistent across cold starts
// Falls back to in-memory Map when UPSTASH env vars are not set (local dev)
// ---------------------------------------------------------------------------

const useRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

let redis: Redis | null = null;
if (useRedis) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
}

// Cache Upstash Ratelimit instances by "limit:windowMs" so we reuse them
const upstashLimiters = new Map<string, Ratelimit>();

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit {
    const key = `${limit}:${windowMs}`;
    let limiter = upstashLimiters.get(key);
    if (!limiter) {
        const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
        limiter = new Ratelimit({
            redis: redis!,
            limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
            analytics: false,
            prefix: 'vocura_rl',
        });
        upstashLimiters.set(key, limiter);
    }
    return limiter;
}

// ---------------------------------------------------------------------------
// In-memory fallback (local dev / missing env vars)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
    count: number;
    reset: number;
}

const store = new Map<string, RateLimitEntry>();

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

function memoryRateLimit(key: string, limit: number, windowMs: number): NextResponse | null {
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

// ---------------------------------------------------------------------------
// Public API (unchanged signatures)
// ---------------------------------------------------------------------------

/**
 * Extract client IP safely.
 * Prefers x-real-ip (set by Vercel/trusted proxies), then the rightmost
 * x-forwarded-for entry (added by the reverse proxy, not client-controllable).
 * Falls back to 127.0.0.1 for local development.
 */
export function getClientIp(req: Request): string {
    const realIp = req.headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }

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
 * Uses Upstash Redis in production, in-memory Map locally.
 * Returns a NextResponse with 429 if rate-limited, or null if allowed.
 */
export async function rateLimit(
    ip: string,
    route: string,
    options: RateLimitOptions = {}
): Promise<NextResponse | null> {
    const { limit = 30, windowMs = 60_000 } = options;
    const key = `ip:${ip}:${route}`;

    if (useRedis) {
        const limiter = getUpstashLimiter(limit, windowMs);
        const { success, reset } = await limiter.limit(key);
        if (!success) {
            const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
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

    return memoryRateLimit(key, limit, windowMs);
}

/**
 * Check if a request should be rate-limited by authenticated user ID.
 * Use this alongside IP-based rate limiting for defense-in-depth.
 * Uses Upstash Redis in production, in-memory Map locally.
 * Returns a NextResponse with 429 if rate-limited, or null if allowed.
 */
export async function rateLimitByUser(
    userId: string,
    route: string,
    options: RateLimitOptions = {}
): Promise<NextResponse | null> {
    const { limit = 30, windowMs = 60_000 } = options;
    const key = `user:${userId}:${route}`;

    if (useRedis) {
        const limiter = getUpstashLimiter(limit, windowMs);
        const { success, reset } = await limiter.limit(key);
        if (!success) {
            const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
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

    return memoryRateLimit(key, limit, windowMs);
}
