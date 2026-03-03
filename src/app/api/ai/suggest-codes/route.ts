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

        // Validate profession against allowed list to prevent prompt injection
        const ALLOWED_PROFESSIONS = ['lege', 'tannlege', 'psykolog', 'fysioterapeut'];
        const safeProfession = profession && ALLOWED_PROFESSIONS.includes(profession) ? profession : undefined;

        const model = process.env.AI_MODEL_SUGGEST_CODES || 'gpt-4o';

        const completion = await openai.chat.completions.create({
            model,
            temperature: 0.2,
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: 'diagnosis_codes',
                    strict: true,
                    schema: {
                        type: 'object',
                        properties: {
                            codes: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        code: { type: 'string' },
                                        system: { type: 'string', enum: ['ICPC-2', 'ICD-10'] },
                                        label: { type: 'string' },
                                        confidence: { type: 'number' },
                                        reasoning: { type: 'string' },
                                        isPrimary: { type: 'boolean' },
                                    },
                                    required: ['code', 'system', 'label', 'confidence', 'reasoning', 'isPrimary'],
                                    additionalProperties: false,
                                },
                            },
                        },
                        required: ['codes'],
                        additionalProperties: false,
                    },
                },
            },
            messages: [
                {
                    role: 'system',
                    content: getCodeSuggestionPrompt(safeProfession),
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

        let result;
        try {
            result = JSON.parse(content);
        } catch {
            console.error('Failed to parse AI response as JSON:', content);
            return NextResponse.json({ codes: [], error: 'AI-tjenesten returnerte ugyldig format. Prøv igjen.' });
        }
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
