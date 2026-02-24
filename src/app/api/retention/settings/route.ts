// src/app/api/retention/settings/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth, isAuthResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { retentionSettingsSchema } from '@/lib/validations';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

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
