import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Defined application roles in ascending privilege order.
 */
export const ROLES = ['lege', 'tannlege', 'psykolog', 'fysioterapeut', 'admin'] as const;
export type Role = (typeof ROLES)[number];

/**
 * Check if a user has the required role.
 * Returns null if authorized, or a 403 NextResponse if not.
 */
export async function requireRole(
  userId: string,
  requiredRole: Role
): Promise<NextResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== requiredRole) {
    return NextResponse.json(
      { error: 'Ingen tilgang. Mangler nødvendig rolle.' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Check if a user is an admin.
 * Uses database role field as primary check, with env-based email fallback.
 * Returns null if authorized, or a 403 NextResponse if not.
 */
export async function requireAdmin(
  userId: string,
  userEmail?: string
): Promise<NextResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'Bruker ikke funnet.' },
      { status: 403 }
    );
  }

  // Primary: check database role
  if (user.role === 'admin') return null;

  // Fallback: check ADMIN_EMAILS env var (for bootstrapping first admin)
  const email = userEmail ?? user.email;
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  if (adminEmails.length > 0 && adminEmails.includes(email)) {
    return null;
  }

  return NextResponse.json(
    { error: 'Ingen admin-tilgang.' },
    { status: 403 }
  );
}
