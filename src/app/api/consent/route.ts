import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, rateLimitByUser, getClientIp } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CONSENT_TYPES = [
  'gdpr_data_processing',
  'gdpr_audio_recording',
  'gdpr_ai_processing',
  'gdpr_data_retention',
] as const;

const consentSchema = z.object({
  consentType: z.enum(CONSENT_TYPES),
  granted: z.boolean(),
  version: z.string().max(20).default('1.0'),
});

export async function POST(req: Request) {
  const limited = await rateLimit(getClientIp(req), 'consent:post', { limit: 20 });
  if (limited) return limited;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 });
    }

    const userLimited = await rateLimitByUser(user.id, 'consent:post', { limit: 20 });
    if (userLimited) return userLimited;

    const body = await req.json();
    const parsed = consentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
        { status: 400 }
      );
    }

    const log = await prisma.consentLog.create({
      data: {
        userId: user.id,
        consentType: parsed.data.consentType,
        granted: parsed.data.granted,
        version: parsed.data.version,
        ipAddress: getClientIp(req),
        userAgent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
      },
    });

    return NextResponse.json({ id: log.id, recorded: true });
  } catch (error) {
    console.error('Consent log error:', error);
    return NextResponse.json(
      { error: 'Kunne ikke lagre samtykke.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const limited = await rateLimit(getClientIp(req), 'consent:get', { limit: 60 });
  if (limited) return limited;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 });
    }

    const userLimited = await rateLimitByUser(user.id, 'consent:get', { limit: 60 });
    if (userLimited) return userLimited;

    // Return latest consent per type
    const logs = await prisma.consentLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      distinct: ['consentType'],
      select: {
        consentType: true,
        granted: true,
        version: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ consents: logs });
  } catch (error) {
    console.error('Consent fetch error:', error);
    return NextResponse.json(
      { error: 'Kunne ikke hente samtykke-status.' },
      { status: 500 }
    );
  }
}
