export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { FELLESKATALOGEN_SYSTEM_PROMPT } from '@/lib/ai-prompts';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { felleskatalovenChatSchema } from '@/lib/validations';

interface SearchResult {
  id: string;
  drug_name: string;
  atc_code: string | null;
  section: string;
  content: string;
  source_url: string;
  similarity: number;
}

async function searchChunks(
  supabase: Awaited<ReturnType<typeof createClient>>,
  openai: OpenAI,
  query: string
): Promise<SearchResult[]> {
  const embeddingRes = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  const embedding = embeddingRes.data[0].embedding;

  const { data, error } = await supabase.rpc('search_felleskatalogen', {
    query_embedding: embedding,
    match_count: 5,
  });

  if (error) {
    console.error('Vector search error:', error);
    return [];
  }
  return (data as SearchResult[]) || [];
}

function buildContextBlock(chunks: SearchResult[]): string {
  if (chunks.length === 0) return 'Ingen relevante legemiddeldata funnet i databasen.';
  return chunks
    .map((c) => `--- ${c.drug_name} (${c.section}) ---\n${c.content}\nKilde: ${c.source_url}`)
    .join('\n\n');
}

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), 'felleskatalogen:chat', { limit: 30 });
  if (limited) return limited;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = felleskatalovenChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
        { status: 400 }
      );
    }

    const { message, history } = parsed.data;
    const openai = new OpenAI();

    // Retrieve relevant chunks via semantic search
    const chunks = await searchChunks(supabase, openai, message);
    const contextBlock = buildContextBlock(chunks);

    // Build messages for chat completion
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `${FELLESKATALOGEN_SYSTEM_PROMPT}\n\n== FELLESKATALOGEN KONTEKST ==\n${contextBlock}`,
      },
      ...history.map((h) => ({ role: h.role, content: h.content } as OpenAI.Chat.ChatCompletionMessageParam)),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      messages,
    });

    const answer = completion.choices[0]?.message?.content || '';

    // Return source references for UI display
    const sources = chunks.map((c) => ({
      drugName: c.drug_name,
      section: c.section,
      url: c.source_url,
      similarity: Math.round(c.similarity * 100),
    }));

    return NextResponse.json({ answer, sources });
  } catch (error) {
    console.error('Felleskatalogen chat error:', error);
    return NextResponse.json(
      { error: 'Kunne ikke svare på spørsmålet. Prøv igjen.' },
      { status: 500 }
    );
  }
}
