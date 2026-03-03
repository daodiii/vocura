export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, rateLimitByUser, getClientIp } from '@/lib/rate-limit';
import { createProfileSchema } from '@/lib/validations';

export async function POST(req: Request) {
    const limited = await rateLimit(getClientIp(req), 'create-profile:post', { limit: 5 });
    if (limited) return limited;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
        }

        const userLimited = await rateLimitByUser(user.id, 'create-profile:post', { limit: 5 });
        if (userLimited) return userLimited;

        const body = await req.json();
        const parsed = createProfileSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const { userId, email, name } = parsed.data;

        // Verify the request is for the authenticated user
        if (userId !== user.id) {
            return NextResponse.json({ error: 'Ingen tilgang' }, { status: 403 });
        }

        // Check if profile already exists
        const existing = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (existing) {
            return NextResponse.json({ success: true, profile: existing });
        }

        const profile = await prisma.user.create({
            data: {
                id: userId,
                email,
                name,
                role: 'lege',
            },
        });

        return NextResponse.json({ success: true, profile });
    } catch (error: unknown) {
        console.error('Profile creation error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke opprette profil. Prøv igjen senere.' },
            { status: 500 }
        );
    }
}
