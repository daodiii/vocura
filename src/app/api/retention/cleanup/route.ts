// src/app/api/retention/cleanup/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Ugyldig autorisasjon' }, { status: 401 });
  }

  const now = new Date();

  // Find expired notes (only those that have been transferred to EPJ)
  const expiredNotes = await prisma.clinicalNote.findMany({
    where: {
      epjTransferred: true,
      deleteAfter: { lte: now },
    },
    select: { id: true, userId: true },
  });

  if (expiredNotes.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  // Delete in batch
  const result = await prisma.clinicalNote.deleteMany({
    where: {
      id: { in: expiredNotes.map((n) => n.id) },
    },
  });

  // Create audit log entries for each deletion
  for (const note of expiredNotes) {
    try {
      await createAuditLog({
        userId: note.userId,
        entityType: 'auto_delete',
        entityId: note.id,
        action: 'auto_delete',
        changes: { reason: 'retention_policy_expired', deletedAt: now.toISOString() },
      });
    } catch (err) {
      console.error(`Failed to create audit log for auto-delete of note ${note.id}:`, err);
    }
  }

  return NextResponse.json({ deleted: result.count });
}
