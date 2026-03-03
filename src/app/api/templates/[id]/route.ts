export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, rateLimitByUser, getClientIp } from '@/lib/rate-limit';
import { templateUpdateSchema } from '@/lib/validations';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const limited = await rateLimit(getClientIp(req), 'templates:get', { limit: 60 });
    if (limited) return limited;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
        }

        const userLimited = await rateLimitByUser(user.id, 'template-id:get', { limit: 60 });
        if (userLimited) return userLimited;

        const { id } = await params;

        const template = await prisma.template.findFirst({
            where: {
                id,
                OR: [
                    { isDefault: true, userId: null },
                    { userId: user.id },
                ],
            },
        });

        if (!template) {
            return NextResponse.json(
                { error: 'Mal ikke funnet' },
                { status: 404 }
            );
        }

        return NextResponse.json(template);
    } catch (error: unknown) {
        console.error('Template fetch error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke hente mal' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const limited = await rateLimit(getClientIp(req), 'templates:patch', { limit: 30 });
    if (limited) return limited;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
        }

        const userLimited = await rateLimitByUser(user.id, 'template-id:patch', { limit: 30 });
        if (userLimited) return userLimited;

        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const incrementUsage = searchParams.get('incrementUsage') === 'true';

        const template = await prisma.template.findFirst({
            where: {
                id,
                OR: [
                    { isDefault: true, userId: null },
                    { userId: user.id },
                ],
            },
        });

        if (!template) {
            return NextResponse.json(
                { error: 'Mal ikke funnet' },
                { status: 404 }
            );
        }

        // If incrementing usage, just do that and return
        if (incrementUsage) {
            const updated = await prisma.template.update({
                where: { id },
                data: { usageCount: { increment: 1 } },
            });
            return NextResponse.json(updated);
        }

        const body = await req.json();

        // Default templates: only allow updating isFavorite
        if (template.isDefault && template.userId === null) {
            if (Object.keys(body).length === 1 && 'isFavorite' in body) {
                const updated = await prisma.template.update({
                    where: { id },
                    data: { isFavorite: body.isFavorite },
                });
                return NextResponse.json(updated);
            }
            return NextResponse.json(
                { error: 'Kan ikke redigere standardmaler' },
                { status: 403 }
            );
        }

        // User-owned templates: allow specified fields
        if (template.userId !== user.id) {
            return NextResponse.json(
                { error: 'Ikke autorisert til å redigere denne malen' },
                { status: 403 }
            );
        }

        const parsed = templateUpdateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const updated = await prisma.template.update({
            where: { id },
            data: parsed.data,
        });

        return NextResponse.json(updated);
    } catch (error: unknown) {
        console.error('Template update error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke oppdatere mal' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const limited = await rateLimit(getClientIp(req), 'templates:delete', { limit: 10 });
    if (limited) return limited;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
        }

        const userLimited = await rateLimitByUser(user.id, 'template-id:delete', { limit: 10 });
        if (userLimited) return userLimited;

        const { id } = await params;

        const template = await prisma.template.findFirst({
            where: { id, userId: user.id },
        });

        if (!template) {
            return NextResponse.json(
                { error: 'Mal ikke funnet' },
                { status: 404 }
            );
        }

        if (template.isDefault) {
            return NextResponse.json(
                { error: 'Kan ikke slette standardmaler' },
                { status: 403 }
            );
        }

        await prisma.template.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Template delete error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke slette mal' },
            { status: 500 }
        );
    }
}
