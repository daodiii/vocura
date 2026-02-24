export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { extractIdentityLevel, hashNationalId, parseCriiptoClaims } from '@/lib/auth/bankid';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const redirect = requestUrl.searchParams.get('redirect') || '/dashboard';

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data?.user) {
            const metadata = data.user.user_metadata || {};
            const identityLevel = extractIdentityLevel(metadata);

            // If this is a BankID/Buypass login, update user profile
            if (identityLevel) {
                const claims = parseCriiptoClaims(metadata);
                const nationalIdHash = claims.pid ? hashNationalId(claims.pid) : null;

                try {
                    await prisma.user.upsert({
                        where: { id: data.user.id },
                        update: {
                            identityLevel,
                            authProvider: identityLevel,
                            ...(nationalIdHash ? { nationalIdHash } : {}),
                            ...(claims.name ? { name: claims.name } : {}),
                        },
                        create: {
                            id: data.user.id,
                            email: data.user.email || '',
                            name: claims.name || data.user.email || 'Ukjent',
                            identityLevel,
                            authProvider: identityLevel,
                            ...(nationalIdHash ? { nationalIdHash } : {}),
                        },
                    });
                } catch (err) {
                    console.error('Failed to update user profile after BankID auth:', err);
                }
            }
        }
    }

    return NextResponse.redirect(new URL(redirect, request.url));
}
