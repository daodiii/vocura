export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { patientCreateSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
    const limited = rateLimit(getClientIp(req), 'patients:get', { limit: 60 });
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

        const patients = await prisma.patient.findMany({
            where: {
                userId: user.id,
                ...(search
                    ? {
                          OR: [
                              { name: { contains: search, mode: 'insensitive' } },
                              { nationalId: { contains: search, mode: 'insensitive' } },
                          ],
                      }
                    : {}),
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(patients);
    } catch (error: unknown) {
        console.error('Patients list error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke hente pasienter' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const limited = rateLimit(getClientIp(req), 'patients:post', { limit: 20 });
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
        const parsed = patientCreateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const { name, birthDate, nationalId, gender, phone, email, address, notes } = parsed.data;

        const patient = await prisma.patient.create({
            data: {
                userId: user.id,
                name,
                birthDate: birthDate ? new Date(birthDate) : null,
                nationalId: nationalId || null,
                gender: gender || null,
                phone: phone || null,
                email: email || null,
                address: address || null,
                notes: notes || null,
            },
        });

        return NextResponse.json(patient, { status: 201 });
    } catch (error: unknown) {
        console.error('Patient create error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke opprette pasient' },
            { status: 500 }
        );
    }
}
