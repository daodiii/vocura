export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { patientUpdateSchema } from '@/lib/validations';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const limited = rateLimit(getClientIp(req), 'patient-id:get', { limit: 60 });
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

        const patient = await prisma.patient.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!patient) {
            return NextResponse.json(
                { error: 'Pasient ikke funnet' },
                { status: 404 }
            );
        }

        return NextResponse.json(patient);
    } catch (error: unknown) {
        console.error('Patient fetch error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke hente pasient' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const limited = rateLimit(getClientIp(req), 'patient-id:patch', { limit: 30 });
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

        const existing = await prisma.patient.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Pasient ikke funnet' },
                { status: 404 }
            );
        }

        const body = await req.json();
        const parsed = patientUpdateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const data = { ...parsed.data } as Record<string, unknown>;
        if (data.birthDate && typeof data.birthDate === 'string') {
            data.birthDate = new Date(data.birthDate as string);
        }

        const patient = await prisma.patient.update({
            where: { id },
            data,
        });

        return NextResponse.json(patient);
    } catch (error: unknown) {
        console.error('Patient update error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke oppdatere pasient' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const limited = rateLimit(getClientIp(req), 'patient-id:delete', { limit: 10 });
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

        const existing = await prisma.patient.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Pasient ikke funnet' },
                { status: 404 }
            );
        }

        await prisma.patient.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Pasient slettet' });
    } catch (error: unknown) {
        console.error('Patient delete error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke slette pasient' },
            { status: 500 }
        );
    }
}
