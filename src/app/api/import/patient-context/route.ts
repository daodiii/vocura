export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, rateLimitByUser, getClientIp } from '@/lib/rate-limit';
import { getEPJAdapter } from '@/lib/epj';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: Request) {
    const limited = await rateLimit(getClientIp(req), 'patient:search', { limit: 30 });
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

        const userLimited = await rateLimitByUser(user.id, 'import-patient-context:post', { limit: 30 });
        if (userLimited) return userLimited;

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const patientId = searchParams.get('patientId');

        if (!search && !patientId) {
            return NextResponse.json(
                { error: 'Enten search eller patientId m\u00e5 oppgis' },
                { status: 400 }
            );
        }

        const adapter = await getEPJAdapter(user.id);

        if (patientId) {
            const patient = await adapter.fetchPatientContext(patientId);

            await createAuditLog({
                userId: user.id,
                entityType: 'patient_context_import',
                action: 'search',
                entityId: patientId,
                ipAddress: getClientIp(req),
            });

            return NextResponse.json({ patient });
        }

        const patients = await adapter.searchPatients(search!);

        await createAuditLog({
            userId: user.id,
            entityType: 'patient_context_import',
            action: 'search',
            entityId: search!,
            ipAddress: getClientIp(req),
        });

        return NextResponse.json({ patients });
    } catch (error: unknown) {
        console.error('Patient context import error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke hente pasientkontekst. Pr\u00f8v igjen senere.' },
            { status: 500 }
        );
    }
}
