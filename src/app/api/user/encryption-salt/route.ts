// src/app/api/user/encryption-salt/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth, isAuthResponse } from '@/lib/api-auth';
import { rateLimit, rateLimitByUser, getClientIp } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  // Rate limiting
  const ip = getClientIp(request);
  const ipLimited = await rateLimit(ip, 'encryption-salt:get', { limit: 60 });
  if (ipLimited) return ipLimited;
  const userLimited = await rateLimitByUser(auth.user.id, 'encryption-salt:get', { limit: 60 });
  if (userLimited) return userLimited;

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { encryptionSalt: true },
  });

  return NextResponse.json({ salt: user?.encryptionSalt || null });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  // Rate limiting — strict limit: regenerating salt makes previously encrypted data inaccessible
  const ip = getClientIp(request);
  const ipLimited = await rateLimit(ip, 'encryption-salt:post', { limit: 3, windowMs: 3_600_000 });
  if (ipLimited) return ipLimited;
  const userLimited = await rateLimitByUser(auth.user.id, 'encryption-salt:post', { limit: 3, windowMs: 3_600_000 });
  if (userLimited) return userLimited;

  // Generate salt on server for storage, but the actual crypto happens client-side
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = Buffer.from(saltBytes).toString('base64');

  await prisma.user.update({
    where: { id: auth.user.id },
    data: { encryptionSalt: salt },
  });

  return NextResponse.json({ salt });
}
