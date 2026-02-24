export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';

const ALLOWED_ENTITY_TYPES = ['epj_push', 'patient_context_import', 'epj_integration'];

export async function GET(req: Request) {
    const limited = rateLimit(getClientIp(req), 'activity:get', { limit: 30 });
    if (limited) return limited;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Ikke autorisert' },
                { status: 401 }
            );
        }

        const url = new URL(req.url);
        const limitParam = parseInt(url.searchParams.get('limit') || '50', 10);
        const limit = Math.min(Math.max(limitParam, 1), 100);

        const activities = await prisma.auditLog.findMany({
            where: {
                userId: user.id,
                entityType: {
                    in: ALLOWED_ENTITY_TYPES,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
            select: {
                id: true,
                entityType: true,
                entityId: true,
                action: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ activities });
    } catch (error: unknown) {
        console.error('Activity GET error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke hente aktivitetslogg. Prøv igjen senere.' },
            { status: 500 }
        );
    }
}
