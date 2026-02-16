export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { profileUpdateSchema } from '@/lib/validations';

export async function GET(req: Request) {
    const limited = rateLimit(getClientIp(req), 'profile:get', { limit: 60 });
    if (limited) return limited;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
        }

        const profile = await prisma.user.findUnique({
            where: { id: user.id },
        });

        if (!profile) {
            // Fallback: return basic info from Supabase auth
            return NextResponse.json({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || user.email || 'Bruker',
                role: 'lege',
                hprNumber: null,
                address: null,
            });
        }

        return NextResponse.json(profile);
    } catch (error: unknown) {
        console.error('Profile fetch error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke hente profil' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    const limited = rateLimit(getClientIp(req), 'profile:patch', { limit: 20 });
    if (limited) return limited;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
        }

        const updates = await req.json();
        const parsed = profileUpdateSchema.safeParse(updates);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const profile = await prisma.user.update({
            where: { id: user.id },
            data: parsed.data,
        });

        return NextResponse.json(profile);
    } catch (error: unknown) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke oppdatere profil' },
            { status: 500 }
        );
    }
}
