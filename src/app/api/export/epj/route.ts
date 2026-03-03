export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, rateLimitByUser, getClientIp } from '@/lib/rate-limit';
import { epjPushSchema } from '@/lib/validations';
import { getEPJAdapter } from '@/lib/epj';
import { createAuditLog } from '@/lib/audit';
import type { EPJNote } from '@/lib/epj';

export async function POST(req: Request) {
    const limited = await rateLimit(getClientIp(req), 'epj:push', { limit: 10 });
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

        const userLimited = await rateLimitByUser(user.id, 'export-epj:post', { limit: 10 });
        if (userLimited) return userLimited;

        const body = await req.json();
        const parsed = epjPushSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const adapter = await getEPJAdapter(user.id);

        const note: EPJNote = {
            patientId: parsed.data.patientId,
            patientDisplayName: parsed.data.patientDisplayName,
            title: parsed.data.title,
            content: parsed.data.content,
            diagnosisCodes: parsed.data.diagnosisCodes,
            encounterType: parsed.data.encounterType,
            templateType: parsed.data.templateType,
            createdAt: new Date().toISOString(),
        };

        const result = await adapter.pushNote(note);

        if (result.success) {
            await createAuditLog({
                userId: user.id,
                entityType: 'epj_push',
                action: 'push',
                entityId: result.epjNoteId || crypto.randomUUID(),
                content: parsed.data.content,
                ipAddress: getClientIp(req),
            });

            return NextResponse.json({
                success: true,
                epjNoteId: result.epjNoteId,
                epjUrl: result.epjUrl,
            });
        }

        return NextResponse.json(
            { success: false, error: result.error },
            { status: 502 }
        );
    } catch (error: unknown) {
        console.error('EPJ push error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke sende notat til EPJ. Pr\u00f8v igjen senere.' },
            { status: 500 }
        );
    }
}
