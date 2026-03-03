export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, rateLimitByUser, getClientIp } from '@/lib/rate-limit';
import { templateCreateSchema } from '@/lib/validations';

export async function GET(req: Request) {
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

        const userLimited = await rateLimitByUser(user.id, 'templates:get', { limit: 60 });
        if (userLimited) return userLimited;

        const { searchParams } = new URL(req.url);
        const profession = searchParams.get('profession');
        const search = searchParams.get('search');
        const sort = searchParams.get('sort');
        const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '50')), 500);
        const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

        const where: Record<string, unknown> = {
            OR: [
                { isDefault: true, userId: null },
                { userId: user.id },
            ],
        };

        if (profession) {
            where.profession = profession;
        }

        if (search) {
            where.AND = [
                {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { content: { contains: search, mode: 'insensitive' } },
                    ],
                },
            ];
        }

        let orderBy: Record<string, string>;
        switch (sort) {
            case 'recent':
                orderBy = { updatedAt: 'desc' };
                break;
            case 'favorite':
                orderBy = { isFavorite: 'desc' };
                break;
            case 'usage':
            default:
                orderBy = { usageCount: 'desc' };
                break;
        }

        const templates = await prisma.template.findMany({
            where,
            orderBy,
            take: limit,
            skip: offset,
        });

        return NextResponse.json(templates);
    } catch (error: unknown) {
        console.error('Templates list error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke hente maler' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const limited = await rateLimit(getClientIp(req), 'templates:post', { limit: 20 });
    if (limited) return limited;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
        }

        const userLimited = await rateLimitByUser(user.id, 'templates:post', { limit: 20 });
        if (userLimited) return userLimited;

        const body = await req.json();
        const parsed = templateCreateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const { name, profession, content: templateContent, category } = parsed.data;

        const template = await prisma.template.create({
            data: {
                userId: user.id,
                name,
                profession,
                content: templateContent,
                category,
            },
        });

        return NextResponse.json(template, { status: 201 });
    } catch (error: unknown) {
        console.error('Template create error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke opprette mal' },
            { status: 500 }
        );
    }
}
