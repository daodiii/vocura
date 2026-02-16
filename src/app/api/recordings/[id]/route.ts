export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const limited = rateLimit(getClientIp(req), 'recording-id:get', { limit: 60 });
    if (limited) return limited;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
        }

        const { id } = await params;

        const recording = await prisma.recording.findFirst({
            where: { id, userId: user.id },
            include: { transcript: true },
        });

        if (!recording) {
            return NextResponse.json(
                { error: 'Opptak ikke funnet' },
                { status: 404 }
            );
        }

        return NextResponse.json(recording);
    } catch (error: unknown) {
        console.error('Recording fetch error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke hente opptak' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const limited = rateLimit(getClientIp(req), 'recording-id:delete', { limit: 10 });
    if (limited) return limited;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
        }

        const { id } = await params;

        const existing = await prisma.recording.findFirst({
            where: { id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Opptak ikke funnet' },
                { status: 404 }
            );
        }

        await prisma.recording.delete({ where: { id } });

        return NextResponse.json({ message: 'Opptak slettet' });
    } catch (error: unknown) {
        console.error('Recording delete error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke slette opptak' },
            { status: 500 }
        );
    }
}
