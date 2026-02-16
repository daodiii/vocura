export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { SUMMARY_PROMPTS } from '@/lib/ai-prompts';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { summarizeSchema } from '@/lib/validations';

type Language = 'bokmal' | 'nynorsk' | 'enkel';

export async function POST(req: Request) {
    const limited = rateLimit(getClientIp(req), 'summarize:post', { limit: 10 });
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
        const parsed = summarizeSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const { text, language, patientName } = parsed.data;

        const openai = new OpenAI();

        const patientContext = patientName
            ? `Pasienten heter ${patientName}. Du kan bruke navnet i oppsummeringen.`
            : '';

        const completion = await openai.chat.completions.create({
            model: 'gpt-5-mini',
            temperature: 0.4,
            messages: [
                {
                    role: 'system',
                    content: `${SUMMARY_PROMPTS[language as Language]}

${patientContext}`,
                },
                {
                    role: 'user',
                    content: text,
                },
            ],
        });

        const summary = completion.choices[0]?.message?.content;

        if (!summary) {
            return NextResponse.json(
                { error: 'Ingen respons fra AI-tjenesten' },
                { status: 500 }
            );
        }

        return NextResponse.json({ summary });
    } catch (error: unknown) {
        console.error('Summarize error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke generere oppsummering. Prøv igjen senere.' },
            { status: 500 }
        );
    }
}
