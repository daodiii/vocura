// src/app/api/user/encryption-salt/route.ts
import { NextResponse } from 'next/server';
import { requireAuth, isAuthResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { encryptionSalt: true },
  });

  return NextResponse.json({ salt: user?.encryptionSalt || null });
}

export async function POST() {
  const auth = await requireAuth();
  if (isAuthResponse(auth)) return auth;

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
