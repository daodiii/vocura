// src/app/api/clinical-notes/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth, isAuthResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { clinicalNoteCreateSchema } from '@/lib/validations';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const notes = await prisma.clinicalNote.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(notes);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = rateLimit(ip, 'clinical-notes-create', { limit: 30 });
  if (limited) return limited;

  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

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
