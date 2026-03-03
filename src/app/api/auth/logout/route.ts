export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAuthEvent, AuthEventType } from '@/lib/auth-events';
import { getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        await createAuthEvent({
            userId: user.id,
            eventType: AuthEventType.LOGOUT,
            ipAddress: getClientIp(request),
            userAgent: request.headers.get('user-agent'),
        });
    }

    await supabase.auth.signOut();
    return NextResponse.json({ ok: true });
}
