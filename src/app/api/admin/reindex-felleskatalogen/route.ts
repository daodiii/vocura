export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    // Admin authorization check
    const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);
    if (adminEmails.length === 0 || !adminEmails.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Ingen admin-tilgang' }, { status: 403 });
    }

    // Parse optional limit param
    const body = await req.json().catch(() => ({}));
    const limit: number | undefined = body.limit;

    // Stream progress back as NDJSON
    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        const send = (msg: object) =>
          controller.enqueue(enc.encode(JSON.stringify(msg) + '\n'));

        const args = ['tsx', 'scripts/index-felleskatalogen.ts'];
        if (limit) args.push('--limit', String(limit));

        const proc = spawn('npx', args, {
          cwd: path.resolve(process.cwd()),
          env: { ...process.env },
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
    return NextResponse.json({ error: 'Reindeksering feilet' }, { status: 500 });
  }
}
