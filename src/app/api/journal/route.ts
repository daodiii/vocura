export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { journalCreateSchema } from '@/lib/validations';
import { createAuditLog, computeContentHash } from '@/lib/audit';

export async function GET(req: Request) {
    const limited = rateLimit(getClientIp(req), 'journal:get', { limit: 60 });
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
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const patientId = searchParams.get('patientId');

        const where: Record<string, unknown> = { userId: user.id };

        if (status) {
            where.status = status;
        }

        if (patientId) {
            where.patientId = patientId;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { patientName: { contains: search, mode: 'insensitive' } },
            ];
        }

        const entries = await prisma.journalEntry.findMany({
            where,
            include: { patient: true },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json(entries);
    } catch (error: unknown) {
        console.error('Journal list error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke hente journaloppføringer' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const limited = rateLimit(getClientIp(req), 'journal:post', { limit: 30 });
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
        const parsed = journalCreateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const { title, content, patientId, patientName, template, status, diagnosisCodes, recordingId } = parsed.data;

        const contentHash = computeContentHash(content);

        const entry = await prisma.journalEntry.create({
            data: {
                userId: user.id,
                title,
                content,
                patientId: patientId || null,
                patientName: patientName || null,
                template: template || null,
                status: status || 'draft',
                diagnosisCodes: diagnosisCodes || null,
                recordingId: recordingId || null,
                contentHash,
            },
            include: { patient: true },
        });

        await createAuditLog({
            userId: user.id,
            entityType: 'journal_entry',
            entityId: entry.id,
            action: 'create',
            content,
            ipAddress: getClientIp(req),
        });

        return NextResponse.json(entry, { status: 201 });
    } catch (error: unknown) {
        console.error('Journal create error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke opprette journaloppføring' },
            { status: 500 }
        );
    }
}
