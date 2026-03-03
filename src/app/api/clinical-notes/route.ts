// src/app/api/clinical-notes/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth, isAuthResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { clinicalNoteCreateSchema } from '@/lib/validations';
import { rateLimit, rateLimitByUser, getClientIp } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const ip = getClientIp(request);

  const notes = await prisma.clinicalNote.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Fire-and-forget: log list access for Normen compliance (patient access audit trail)
  createAuditLog({
    userId: auth.user.id,
    entityType: 'clinical_note',
    entityId: '_list',
    action: 'view',
    ipAddress: ip,
  }).catch((err) => console.error('Audit log failed:', err))

  return NextResponse.json(notes);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = await rateLimit(ip, 'clinical-notes-create', { limit: 30 });
  if (limited) return limited;

  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const userLimited = await rateLimitByUser(auth.user.id, 'clinical-notes:post', { limit: 30 });
  if (userLimited) return userLimited;

  const body = await request.json();
  const parsed = clinicalNoteCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
      { status: 400 }
    );
  }

  const note = await prisma.clinicalNote.create({
    data: {
      userId: auth.user.id,
      ...parsed.data,
    },
  });

  return NextResponse.json(note, { status: 201 });
}
