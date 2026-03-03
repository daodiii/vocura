export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, rateLimitByUser, getClientIp } from '@/lib/rate-limit';
import { requireAdmin } from '@/lib/rbac';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
  const limited = await rateLimit(getClientIp(req), 'admin-reindex:post', { limit: 1, windowMs: 600_000 });
  if (limited) return limited;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const userLimited = await rateLimitByUser(user.id, 'admin-reindex:post', { limit: 1, windowMs: 600_000 });
    if (userLimited) return userLimited;

    // Role-based admin authorization (DB role + env fallback)
    const denied = await requireAdmin(user.id, user.email ?? undefined);
    if (denied) return denied;

    // Parse and validate optional limit param
    const body = await req.json().catch(() => ({}));
    const limit: number | undefined = body.limit;

    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 1000)) {
      return NextResponse.json({ error: 'Ugyldig limit-parameter. Må være et heltall mellom 1 og 1000.' }, { status: 400 });
    }

    // Stream progress back as NDJSON
    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        const send = (msg: object) =>
          controller.enqueue(enc.encode(JSON.stringify(msg) + '\n'));

        const args = ['tsx', 'scripts/index-felleskatalogen.ts'];
        if (limit) args.push('--limit', String(limit));

        // Only pass necessary env vars to the subprocess — avoid leaking
        // secrets that the indexer script does not need.
        const allowedEnvKeys = [
          'SUPABASE_URL',
          'SUPABASE_SERVICE_ROLE_KEY',
          'OPENAI_API_KEY',
          'DATABASE_URL',
          'NODE_ENV',
          'PATH',
          'HOME',
        ];
        const filteredEnv: Record<string, string> = {};
        for (const key of allowedEnvKeys) {
          if (process.env[key]) {
            filteredEnv[key] = process.env[key] as string;
          }
        }

        const proc = spawn('npx', args, {
          cwd: path.resolve(process.cwd()),
          env: filteredEnv,
        });

        proc.stdout.on('data', (data: Buffer) => {
          send({ type: 'progress', message: data.toString().trim() });
        });
        proc.stderr.on('data', (data: Buffer) => {
          send({ type: 'log', message: data.toString().trim() });
        });
        proc.on('close', (code) => {
          send({ type: 'done', success: code === 0, exitCode: code });
          controller.close();
        });
        proc.on('error', (err) => {
          send({ type: 'error', message: err.message });
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Reindex error:', error);
    return NextResponse.json({ error: 'Reindeksering av Felleskatalogen feilet. Sjekk serverloggen for detaljer.' }, { status: 500 });
  }
}
