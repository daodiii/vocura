export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { journalUpdateSchema } from '@/lib/validations';
import { createAuditLog, computeContentHash } from '@/lib/audit';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const limited = rateLimit(getClientIp(req), 'journal-id:get', { limit: 60 });
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

        const entry = await prisma.journalEntry.findFirst({
            where: { id, userId: user.id },
            include: { patient: true },
        });

        if (!entry) {
            return NextResponse.json(
                { error: 'Journaloppføring ikke funnet' },
                { status: 404 }
            );
        }

        return NextResponse.json(entry);
    } catch (error: unknown) {
        console.error('Journal fetch error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke hente journaloppføring' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const limited = rateLimit(getClientIp(req), 'journal-id:patch', { limit: 30 });
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

        const existing = await prisma.journalEntry.findFirst({
            where: { id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Journaloppføring ikke funnet' },
                { status: 404 }
            );
        }

        const body = await req.json();
        const parsed = journalUpdateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const updateData = { ...parsed.data } as Record<string, unknown>;

        // Compute content hash if content is being updated
        if (updateData.content && typeof updateData.content === 'string') {
            updateData.contentHash = computeContentHash(updateData.content as string);
        }

        const action = parsed.data.status === 'approved' ? 'approve' : 'update';

        const entry = await prisma.journalEntry.update({
            where: { id },
            data: updateData,
            include: { patient: true },
        });

        await createAuditLog({
            userId: user.id,
            entityType: 'journal_entry',
            entityId: id,
            action,
            changes: parsed.data,
            content: typeof updateData.content === 'string' ? updateData.content : undefined,
            ipAddress: getClientIp(req),
        });

        return NextResponse.json(entry);
    } catch (error: unknown) {
        console.error('Journal update error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke oppdatere journaloppføring' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const limited = rateLimit(getClientIp(req), 'journal-id:delete', { limit: 10 });
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

        const existing = await prisma.journalEntry.findFirst({
            where: { id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Journaloppføring ikke funnet' },
                { status: 404 }
            );
        }

        // Log the deletion before actually deleting
        await createAuditLog({
            userId: user.id,
            entityType: 'journal_entry',
            entityId: id,
            action: 'delete',
            changes: { title: existing.title, status: existing.status },
            content: existing.content,
            ipAddress: getClientIp(req),
        });

        await prisma.journalEntry.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Journal delete error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke slette journaloppføring' },
            { status: 500 }
        );
    }
}
