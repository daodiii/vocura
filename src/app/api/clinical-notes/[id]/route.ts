// src/app/api/clinical-notes/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth, isAuthResponse } from '@/lib/api-auth';
import { rateLimit, rateLimitByUser, getClientIp } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { clinicalNoteUpdateSchema } from '@/lib/validations';
import { computeDeleteAfter } from '@/lib/retention';
import { createAuditLog } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  // Rate limiting
  const ip = getClientIp(request);
  const ipLimited = await rateLimit(ip, 'clinical-notes-id:get', { limit: 60 });
  if (ipLimited) return ipLimited;
  const userLimited = await rateLimitByUser(auth.user.id, 'clinical-notes-id:get', { limit: 60 });
  if (userLimited) return userLimited;

  const { id } = await params;
  const note = await prisma.clinicalNote.findFirst({
    where: { id, userId: auth.user.id },
  });

  if (!note) {
    return NextResponse.json({ error: 'Notat ikke funnet' }, { status: 404 });
  }

  // Fire-and-forget: log read access for Normen compliance (patient access audit trail)
  createAuditLog({
    userId: auth.user.id,
    entityType: 'clinical_note',
    entityId: id,
    action: 'view',
    ipAddress: ip,
  }).catch((err) => console.error('Audit log failed:', err))

  return NextResponse.json(note);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  // Rate limiting
  const ip = getClientIp(request);
  const ipLimited = await rateLimit(ip, 'clinical-notes-id:patch', { limit: 30 });
  if (ipLimited) return ipLimited;
  const userLimited = await rateLimitByUser(auth.user.id, 'clinical-notes-id:patch', { limit: 30 });
  if (userLimited) return userLimited;

  const { id } = await params;

  // Check if note is signed (finalized) — signed notes are immutable per Norwegian healthcare law
  const existingNote = await prisma.clinicalNote.findFirst({
    where: { id, userId: auth.user.id },
  });
  if (!existingNote) {
    return NextResponse.json({ error: 'Notat ikke funnet' }, { status: 404 });
  }
  if (existingNote.status === 'final') {
    return NextResponse.json(
      { error: 'Signerte notater kan ikke redigeres. Opprett et tilleggsnotat ved behov.' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = clinicalNoteUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
      { status: 400 }
    );
  }

  // If marking as EPJ-transferred, compute deleteAfter
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.epjTransferred) {
    const now = new Date();
    updateData.epjTransferredAt = now;

    // Get user's retention settings
    const settings = await prisma.retentionSettings.findUnique({
      where: { userId: auth.user.id },
    });
    const hours = settings?.textRetentionHours ?? 48;
    updateData.deleteAfter = computeDeleteAfter(now, hours);
    updateData.retentionHours = hours;
  }

  const note = await prisma.clinicalNote.updateMany({
    where: { id, userId: auth.user.id },
    data: updateData,
  });

  if (note.count === 0) {
    return NextResponse.json({ error: 'Notat ikke funnet' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  // Rate limiting
  const ip = getClientIp(request);
  const ipLimited = await rateLimit(ip, 'clinical-notes-id:delete', { limit: 10 });
  if (ipLimited) return ipLimited;
  const userLimited = await rateLimitByUser(auth.user.id, 'clinical-notes-id:delete', { limit: 10 });
  if (userLimited) return userLimited;

  const { id } = await params;

  // Check if note is signed (finalized) — signed notes cannot be deleted
  const noteToDelete = await prisma.clinicalNote.findFirst({
    where: { id, userId: auth.user.id },
  });
  if (!noteToDelete) {
    return NextResponse.json({ error: 'Notat ikke funnet' }, { status: 404 });
  }
  if (noteToDelete.status === 'final') {
    return NextResponse.json(
      { error: 'Signerte notater kan ikke slettes.' },
      { status: 403 }
    );
  }

  const result = await prisma.clinicalNote.deleteMany({
    where: { id, userId: auth.user.id },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: 'Notat ikke funnet' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
