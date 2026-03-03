export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { LAB_INTERPRET_PROMPT } from '@/lib/ai-prompts';
import { rateLimit, rateLimitByUser, getClientIp } from '@/lib/rate-limit';
import { labInterpretSchema } from '@/lib/validations';
import { lookupRange, classifyValue } from '@/lib/lab-reference-ranges';
import { z } from 'zod';

// Zod schema to validate AI-generated JSON output
const aiLabResultSchema = z.object({
  values: z.array(z.object({
    name: z.string().max(200),
    rawName: z.string().max(200),
    value: z.number(),
    unit: z.string().max(50),
    referenceKey: z.string().max(50).regex(/^[a-zA-Z0-9_æøåÆØÅ\-]+$/),
  })).max(100),
  summary: z.object({
    funn: z.string().max(5000),
    kliniskKontekst: z.string().max(5000),
    oppfolging: z.string().max(5000),
  }),
});

export interface ParsedLabValue {
  name: string;
  rawName: string;
  value: number;
  unit: string;
  referenceKey: string;
  referenceRange?: { low?: number; high?: number; unit: string };
  status: 'normal' | 'borderline_low' | 'borderline_high' | 'low' | 'high' | 'unknown';
}

export interface LabInterpretResponse {
  values: ParsedLabValue[];
  summary: {
    funn: string;
    kliniskKontekst: string;
    oppfolging: string;
  };
}

export async function POST(req: Request) {
  const limited = await rateLimit(getClientIp(req), 'lab:interpret', { limit: 20 });
  if (limited) return limited;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const userLimited = await rateLimitByUser(user.id, 'lab-interpret:post', { limit: 20 });
    if (userLimited) return userLimited;

    const body = await req.json();
    const parsed = labInterpretSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
        { status: 400 }
      );
    }

    const { rawText } = parsed.data;
    const openai = new OpenAI();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: LAB_INTERPRET_PROMPT },
        { role: 'user', content: rawText },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'Ingen respons fra AI' }, { status: 500 });
    }

    let aiResult;
    try {
      aiResult = aiLabResultSchema.parse(JSON.parse(content));
    } catch (parseError) {
      console.error('AI returned invalid lab result format:', parseError);
      return NextResponse.json(
        { error: 'AI-tjenesten returnerte et ugyldig format. Prøv igjen.' },
        { status: 502 }
      );
    }

    // Enrich values with reference ranges and classification
    const enrichedValues: ParsedLabValue[] = aiResult.values.map((v) => {
      const range = lookupRange(v.referenceKey);
      const status = range ? classifyValue(v.value, range) : 'unknown';
      return {
        ...v,
        referenceRange: range ? { low: range.low, high: range.high, unit: range.unit } : undefined,
        status,
      };
    });

    const response: LabInterpretResponse = {
      values: enrichedValues,
      summary: aiResult.summary || { funn: '', kliniskKontekst: '', oppfolging: '' },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Lab interpret error:', error);
    return NextResponse.json(
      { error: 'Kunne ikke analysere laboratorieverdier. Prøv igjen.' },
      { status: 500 }
    );
  }
}
