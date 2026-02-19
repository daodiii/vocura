#!/usr/bin/env npx tsx
/**
 * Felleskatalogen indexer
 * Usage: npx tsx scripts/index-felleskatalogen.ts [--limit 50]
 *
 * Scrapes drug monographs from felleskatalogen.no, chunks content,
 * generates OpenAI embeddings, and upserts into Supabase pgvector.
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

const FELLESKATALOGEN_BASE = 'https://www.felleskatalogen.no';
const DRUG_LIST_URL = `${FELLESKATALOGEN_BASE}/medisin/finn-legemiddel`;
const CHUNK_SIZE = 500; // ~tokens
const CHUNK_OVERLAP = 50;
const BATCH_SIZE = 10; // embed N chunks at a time

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

interface DrugChunk {
  drug_name: string;
  atc_code: string | null;
  section: string;
  content: string;
  source_url: string;
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Vocura/1.0 (medisinsk oppslagsverk; kontakt@vocura.no)',
      'Accept-Language': 'no,nb;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

function chunkText(text: string, size: number, overlap: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    chunks.push(words.slice(i, i + size).join(' '));
    i += size - overlap;
  }
  return chunks.filter((c) => c.trim().length > 50);
}

async function getDrugUrls(limit?: number): Promise<string[]> {
  console.log('Fetching drug list...');
  const html = await fetchPage(DRUG_LIST_URL);
  const $ = cheerio.load(html);
  const urls: string[] = [];

  $('a[href*="/medisin/"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.match(/\/medisin\/[^/]+\/[^/]+/) && !href.includes('#')) {
      const full = href.startsWith('http') ? href : `${FELLESKATALOGEN_BASE}${href}`;
      if (!urls.includes(full)) urls.push(full);
    }
  });

  console.log(`Found ${urls.length} drug URLs`);
  return limit ? urls.slice(0, limit) : urls;
}

async function scrapeDrug(url: string): Promise<DrugChunk[]> {
  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  const drugName = $('h1').first().text().trim() || url.split('/').at(-2) || 'Ukjent';
  const atcMatch = $('*').text().match(/ATC[:\s]+([A-Z]\d{2}[A-Z]{2}\d{2})/);
  const atcCode = atcMatch?.[1] ?? null;

  const chunks: DrugChunk[] = [];

  // Try to extract named sections
  $('h2, h3').each((_, el) => {
    const section = $(el).text().trim();
    let content = '';
    let next = $(el).next();
    while (next.length && !next.is('h2, h3')) {
      content += ' ' + next.text();
      next = next.next();
    }
    content = content.trim().replace(/\s+/g, ' ');
    if (content.length < 30) return;

    for (const chunk of chunkText(content, CHUNK_SIZE, CHUNK_OVERLAP)) {
      chunks.push({ drug_name: drugName, atc_code: atcCode, section, content: chunk, source_url: url });
    }
  });

  // Fallback: chunk entire body text if no sections found
  if (chunks.length === 0) {
    const bodyText = $('main, article, .content, body').first().text().replace(/\s+/g, ' ').trim();
    for (const chunk of chunkText(bodyText, CHUNK_SIZE, CHUNK_OVERLAP)) {
      chunks.push({ drug_name: drugName, atc_code: atcCode, section: 'Generelt', content: chunk, source_url: url });
    }
  }

  return chunks;
}

async function embedAndUpsert(chunks: DrugChunk[]): Promise<void> {
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch.map((c) => c.content),
    });

    const rows = batch.map((chunk, j) => ({
      ...chunk,
      embedding: embeddingRes.data[j].embedding,
      indexed_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('felleskatalogen_chunks').upsert(rows, {
      onConflict: 'source_url,section',
    });
    if (error) console.warn('Upsert error:', error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.indexOf('--limit');
  const limit = limitArg !== -1 ? parseInt(args[limitArg + 1]) : undefined;

  const urls = await getDrugUrls(limit);
  let totalChunks = 0;
  let processed = 0;

  for (const url of urls) {
    try {
      const chunks = await scrapeDrug(url);
      await embedAndUpsert(chunks);
      totalChunks += chunks.length;
      processed++;
      if (processed % 10 === 0) {
        console.log(`Progress: ${processed}/${urls.length} drugs, ${totalChunks} chunks indexed`);
      }
      // Polite delay
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.warn(`Skipping ${url}:`, (err as Error).message);
    }
  }

  console.log(`\nDone! Indexed ${processed} drugs, ${totalChunks} chunks total.`);
}

main().catch(console.error);
