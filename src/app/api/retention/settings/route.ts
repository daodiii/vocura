// src/app/api/retention/settings/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth, isAuthResponse } from '@/lib/api-auth';
import { rateLimit, rateLimitByUser, getClientIp } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { retentionSettingsSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  // Rate limiting
  const ip = getClientIp(request);
  const ipLimited = await rateLimit(ip, 'retention-settings:get', { limit: 60 });
  if (ipLimited) return ipLimited;
  const userLimited = await rateLimitByUser(auth.user.id, 'retention-settings:get', { limit: 60 });
  if (userLimited) return userLimited;

  const settings = await prisma.retentionSettings.findUnique({
    where: { userId: auth.user.id },
  });

  return NextResponse.json(
    settings || { textRetentionHours: 48, autoDeleteEnabled: true }
  );
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  // Rate limiting
  const ip = getClientIp(request);
  const ipLimited = await rateLimit(ip, 'retention-settings:put', { limit: 20 });
  if (ipLimited) return ipLimited;
  const userLimited = await rateLimitByUser(auth.user.id, 'retention-settings:put', { limit: 20 });
  if (userLimited) return userLimited;

  const body = await request.json();
  const parsed = retentionSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
      { status: 400 }
    );
  }

  const settings = await prisma.retentionSettings.upsert({
    where: { userId: auth.user.id },
    update: parsed.data,
    create: {
      userId: auth.user.id,
      ...parsed.data,
    },
  });

  return NextResponse.json(settings);
}
