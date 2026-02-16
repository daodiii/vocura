export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { formSubmissionCreateSchema } from '@/lib/validations';

export async function GET(req: Request) {
    const limited = rateLimit(getClientIp(req), 'form-submissions:get', { limit: 60 });
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
        const formType = searchParams.get('formType');
        const status = searchParams.get('status');
        const patientId = searchParams.get('patientId');

        const where: Record<string, unknown> = { userId: user.id };

        if (formType) where.formType = formType;
        if (status) where.status = status;
        if (patientId) where.patientId = patientId;

        const submissions = await prisma.formSubmission.findMany({
            where,
            include: { patient: true },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(submissions);
    } catch (error: unknown) {
        console.error('Form submissions list error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke hente skjemainnsendinger' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const limited = rateLimit(getClientIp(req), 'form-submissions:post', { limit: 20 });
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
        const parsed = formSubmissionCreateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const { formType, data: formData, patientId, status, score } = parsed.data;

        const submission = await prisma.formSubmission.create({
            data: {
                userId: user.id,
                formType,
                data: formData as object,
                patientId: patientId || null,
                status: status || 'draft',
                score: score ?? null,
            },
            include: { patient: true },
        });

        return NextResponse.json(submission, { status: 201 });
    } catch (error: unknown) {
        console.error('Form submission create error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke opprette skjemainnsending' },
            { status: 500 }
        );
    }
}
