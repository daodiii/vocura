// src/app/api/clinical-notes/[id]/sign/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth, isAuthResponse } from '@/lib/api-auth';
import { rateLimit, rateLimitByUser, getClientIp } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  // Rate limiting
  const ip = getClientIp(request);
  const ipLimited = await rateLimit(ip, 'clinical-notes-id:sign', { limit: 10 });
  if (ipLimited) return ipLimited;
  const userLimited = await rateLimitByUser(auth.user.id, 'clinical-notes-id:sign', { limit: 10 });
  if (userLimited) return userLimited;

  const { id } = await params;

  // Fetch the note and verify ownership
  const note = await prisma.clinicalNote.findFirst({
    where: { id, userId: auth.user.id },
  });

  if (!note) {
    return NextResponse.json({ error: 'Notat ikke funnet' }, { status: 404 });
  }

  // Cannot sign an already-signed note
  if (note.status === 'final') {
    return NextResponse.json(
      { error: 'Notatet er allerede signert og kan ikke signeres på nytt.' },
      { status: 409 }
    );
  }

  const now = new Date();

  // Create audit log entry for the sign action (critical — will throw on failure)
  await createAuditLog({
    userId: auth.user.id,
    entityType: 'clinical_note',
    entityId: id,
    action: 'sign',
    changes: { status: { from: note.status, to: 'final' } },
    content: note.contentEncrypted,
    ipAddress: ip,
  });

  // Update the note to finalized status
  const updated = await prisma.clinicalNote.update({
    where: { id },
    data: {
      status: 'final',
      signedAt: now,
      signedBy: auth.user.id,
    },
  });

  return NextResponse.json(updated);
}
