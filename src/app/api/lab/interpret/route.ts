export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { LAB_INTERPRET_PROMPT } from '@/lib/ai-prompts';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { labInterpretSchema } from '@/lib/validations';
import { lookupRange, classifyValue } from '@/lib/lab-reference-ranges';

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
  const limited = rateLimit(getClientIp(req), 'lab:interpret', { limit: 20 });
  if (limited) return limited;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

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

    const aiResult = JSON.parse(content) as {
      values: Array<{ name: string; rawName: string; value: number; unit: string; referenceKey: string }>;
      summary: { funn: string; kliniskKontekst: string; oppfolging: string };
    };

    // Enrich values with reference ranges and classification
    const enrichedValues: ParsedLabValue[] = (aiResult.values || []).map((v) => {
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
