export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { recordingCreateSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
    const limited = rateLimit(getClientIp(req), 'recordings:get', { limit: 60 });
    if (limited) return limited;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const source = searchParams.get('source');
        const patientId = searchParams.get('patientId');

        const recordings = await prisma.recording.findMany({
            where: {
                userId: user.id,
                ...(source ? { source } : {}),
                ...(patientId ? { patientId } : {}),
            },
            include: {
                transcript: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(recordings);
    } catch (error: unknown) {
        console.error('Recordings list error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke hente opptak' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const limited = rateLimit(getClientIp(req), 'recordings:post', { limit: 20 });
    if (limited) return limited;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
        }

        const body = await req.json();
        const parsed = recordingCreateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const { filename, duration, fileSize, mimeType, source, patientId, transcriptText, language } = parsed.data;

        const result = await prisma.$transaction(async (tx) => {
            const recording = await tx.recording.create({
                data: {
                    userId: user.id,
                    filename,
                    duration,
                    fileSize,
                    mimeType,
                    source,
                    patientId: patientId || null,
                },
            });

            let transcript = null;
            if (transcriptText) {
                const wordCount = transcriptText.trim().split(/\s+/).filter(Boolean).length;
                transcript = await tx.transcript.create({
                    data: {
                        recordingId: recording.id,
                        text: transcriptText,
                        language,
                        wordCount,
                    },
                });
            }

            return { ...recording, transcript };
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error: unknown) {
        console.error('Recording create error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke opprette opptak' },
            { status: 500 }
        );
    }
}
