export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, rateLimitByUser, getClientIp } from '@/lib/rate-limit';
import { epjIntegrationSchema } from '@/lib/validations';
import { encryptCredentials, LeyrAdapter } from '@/lib/epj';
import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    const limited = await rateLimit(getClientIp(req), 'epj-integration:get', { limit: 30 });
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

        const userLimited = await rateLimitByUser(user.id, 'epj-integration:get', { limit: 30 });
        if (userLimited) return userLimited;

        const integration = await prisma.epjIntegration.findUnique({
            where: { userId: user.id },
        });

        if (!integration) {
            return NextResponse.json({ isConnected: false });
        }

        return NextResponse.json({
            isConnected: integration.isActive,
            epjSystem: integration.epjSystem,
            careUnitId: integration.careUnitId,
            connectedAt: integration.connectedAt,
            lastTestedAt: integration.lastTestedAt,
            testOk: integration.testOk,
        });
    } catch (error: unknown) {
        console.error('EPJ integration GET error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke hente integrasjonsstatus. Pr\u00f8v igjen senere.' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const limited = await rateLimit(getClientIp(req), 'epj-integration:post', { limit: 10 });
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

        const userLimited = await rateLimitByUser(user.id, 'epj-integration:post', { limit: 10 });
        if (userLimited) return userLimited;

        const body = await req.json();
        const parsed = epjIntegrationSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const { clientId, clientSecret, careUnitId, epjSystem } = parsed.data;

        const encryptedCredentials = encryptCredentials({
            clientId,
            clientSecret,
            careUnitId,
            epjSystem,
        });

        // Test connection before saving
        const tempAdapter = new LeyrAdapter({
            clientId,
            clientSecret,
            careUnitId,
            epjSystem,
        });
        const testResult = await tempAdapter.testConnection();

        const now = new Date();

        await prisma.epjIntegration.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                epjSystem,
                careUnitId,
                encryptedCredentials,
                isActive: testResult.ok,
                connectedAt: now,
                lastTestedAt: now,
                testOk: testResult.ok,
            },
            update: {
                epjSystem,
                careUnitId,
                encryptedCredentials,
                isActive: testResult.ok,
                lastTestedAt: now,
                testOk: testResult.ok,
            },
        });

        await createAuditLog({
            userId: user.id,
            entityType: 'epj_integration',
            action: 'create',
            entityId: user.id,
            ipAddress: getClientIp(req),
        });

        return NextResponse.json({
            success: true,
            isConnected: testResult.ok,
            testOk: testResult.ok,
            ...(testResult.error ? { testError: testResult.error } : {}),
        });
    } catch (error: unknown) {
        console.error('EPJ integration POST error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke opprette EPJ-integrasjon. Pr\u00f8v igjen senere.' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    const limited = await rateLimit(getClientIp(req), 'epj-integration:delete', { limit: 10 });
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

        const userLimited = await rateLimitByUser(user.id, 'epj-integration:delete', { limit: 10 });
        if (userLimited) return userLimited;

        const existing = await prisma.epjIntegration.findUnique({
            where: { userId: user.id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Ingen EPJ-integrasjon funnet' },
                { status: 404 }
            );
        }

        await prisma.epjIntegration.delete({
            where: { userId: user.id },
        });

        await createAuditLog({
            userId: user.id,
            entityType: 'epj_integration',
            action: 'delete',
            entityId: user.id,
            ipAddress: getClientIp(req),
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('EPJ integration DELETE error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke slette EPJ-integrasjon. Pr\u00f8v igjen senere.' },
            { status: 500 }
        );
    }
}
