export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { getStructureNotePrompt } from '@/lib/ai-prompts';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { structureNoteSchema } from '@/lib/validations';

export async function POST(req: Request) {
    const limited = rateLimit(getClientIp(req), 'structure-note:post', { limit: 10 });
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
        const parsed = structureNoteSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
                { status: 400 }
            );
        }

        const { text, templateType, profession, patientName, encounterType } = parsed.data;

        const openai = new OpenAI();

        const systemPrompt = getStructureNotePrompt(templateType);

        // Build context additions
        const contextParts: string[] = [];
        if (profession) {
            contextParts.push(`Profesjon: ${profession}`);
        }
        if (patientName) {
            contextParts.push(`Pasientnavn: ${patientName}`);
        }
        if (encounterType) {
            contextParts.push(`Konsultasjonstype: ${encounterType}`);
        }

        const contextBlock = contextParts.length > 0
            ? `\n\nKontekst:\n${contextParts.join('\n')}`
            : '';

        const model = process.env.AI_MODEL_STRUCTURE_NOTE || 'gpt-5-mini';

        const completion = await openai.chat.completions.create({
            model,
            temperature: 0.3,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: `${contextBlock ? contextBlock + '\n\n' : ''}Diktering:\n${text}`,
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

        // Count words in the generated content (strip HTML tags)
        const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const wordCount = plainText.split(/\s+/).filter(Boolean).length;

        return NextResponse.json({
            content,
            metadata: {
                templateType,
                wordCount,
            },
        });
    } catch (error: unknown) {
        console.error('Structure note error:', error);
        return NextResponse.json(
            { error: 'Kunne ikke strukturere journalnotat. Prøv igjen senere.' },
            { status: 500 }
        );
    }
}
