export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { formSubmissionUpdateSchema } from '@/lib/validations';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const limited = rateLimit(getClientIp(req), 'form-submission-id:get', { limit: 60 });
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

        const submission = await prisma.formSubmission.findFirst({
            where: { id, userId: user.id },
            include: { patient: true },
        });

        if (!submission) {
            return NextResponse.json(
                { error: 'Skjemainnsending ikke funnet' },
                { status: 404 }
            );
        }

        return NextResponse.json(submission);
    } catch (error: unknown) {
        console.error('Form submission fetch error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke hente skjemainnsending' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const limited = rateLimit(getClientIp(req), 'form-submission-id:patch', { limit: 30 });
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

        const existing = await prisma.formSubmission.findFirst({
            where: { id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Skjemainnsending ikke funnet' },
                { status: 404 }
            );
        }

        const body = await req.json();
        const parsed = formSubmissionUpdateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const updateData = { ...parsed.data } as Record<string, unknown>;
        if (updateData.data) {
            updateData.data = updateData.data as object;
        }

        const submission = await prisma.formSubmission.update({
            where: { id },
            data: updateData,
            include: { patient: true },
        });

        return NextResponse.json(submission);
    } catch (error: unknown) {
        console.error('Form submission update error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke oppdatere skjemainnsending' },
            { status: 500 }
        );
    }
}
