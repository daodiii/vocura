export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { WHISPER_PROMPTS } from '@/lib/ai-prompts';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB - Whisper API limit
const ALLOWED_TYPES = [
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/x-m4a',
    'audio/mp3',
    'audio/flac',
];

export async function POST(req: Request) {
    // Rate limiting
    const limited = rateLimit(getClientIp(req), 'transcribe:post', { limit: 10 });
    if (limited) return limited;

    try {
        // Authentication check
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Du må være logget inn for å bruke transkriberingstjenesten' },
                { status: 401 }
            );
        }

        // Check API key
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'Transkriberingstjenesten er ikke konfigurert' },
                { status: 503 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const profession = (formData.get('profession') as string) || 'default';

        if (!file) {
            return NextResponse.json(
                { error: 'Ingen fil lastet opp' },
                { status: 400 }
            );
        }

        // File size validation
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'Filen er for stor. Maksimal størrelse er 25MB.' },
                { status: 413 }
            );
        }

        // File type validation
        if (file.type && !ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Ugyldig filtype. Kun lydformater er støttet.' },
                { status: 415 }
            );
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Convert File to Buffer and write to temp
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const tempFilePath = path.join('/tmp', `upload_${uuidv4()}.webm`);
        fs.writeFileSync(tempFilePath, buffer);

        try {
            const whisperPrompt = WHISPER_PROMPTS[profession] || WHISPER_PROMPTS['default'];

            const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: 'gpt-4o-transcribe',
                language: 'no',
                prompt: whisperPrompt,
            });

            return NextResponse.json({ text: transcription.text });
        } finally {
            // Always clean up temp file
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }
    } catch (error: unknown) {
        console.error('Transcription error:', error);
        return NextResponse.json(
            { error: 'Transkribering feilet. Prøv igjen senere.' },
            { status: 500 }
        );
    }
}
