export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { getCodeSuggestionPrompt } from '@/lib/ai-prompts';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { suggestCodesSchema } from '@/lib/validations';

export async function POST(req: Request) {
    const limited = rateLimit(getClientIp(req), 'suggest-codes:post', { limit: 10 });
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

        const body = await req.json();
        const parsed = suggestCodesSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const { text, profession } = parsed.data;

        const openai = new OpenAI();

        const completion = await openai.chat.completions.create({
            model: 'gpt-5-mini',
            temperature: 0.2,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: getCodeSuggestionPrompt(profession),
                },
                {
                    role: 'user',
                    content: text,
                },
            ],
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            return NextResponse.json(
                { error: 'Ingen respons fra AI-tjenesten' },
                { status: 500 }
            );
        }

        const result = JSON.parse(content);
        const codes = result.codes || [];

        return NextResponse.json({ codes });
    } catch (error: unknown) {
        console.error('Suggest codes error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke foreslå diagnosekoder. Prøv igjen senere.' },
            { status: 500 }
        );
    }
}
