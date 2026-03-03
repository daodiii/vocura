export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, rateLimitByUser, getClientIp } from '@/lib/rate-limit';
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
    const limited = await rateLimit(getClientIp(req), 'transcribe:post', { limit: 10 });
    if (limited) return limited;

    // Early request size validation via Content-Length header
    const contentLength = parseInt(req.headers.get('content-length') || '0');
    if (contentLength > 25 * 1024 * 1024) {
        return NextResponse.json({ error: 'Filen er for stor. Maks 25 MB.' }, { status: 413 });
    }

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

        const userLimited = await rateLimitByUser(user.id, 'transcribe:post', { limit: 10 });
        if (userLimited) return userLimited;

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

        // File type validation — reject files with missing or invalid MIME type
        if (!file.type || !ALLOWED_TYPES.includes(file.type)) {
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

            // Try gpt-4o-transcribe first, fall back to whisper-1 if unavailable
            let transcription;
            try {
                transcription = await openai.audio.transcriptions.create({
                    file: fs.createReadStream(tempFilePath),
                    model: 'gpt-4o-transcribe',
                    language: 'no',
                    prompt: whisperPrompt,
                });
                console.log('Transcription succeeded with gpt-4o-transcribe');
            } catch (modelError: unknown) {
                const isModelError = modelError instanceof Error &&
                    (modelError.message?.includes('model') ||
                     modelError.message?.includes('not found') ||
                     modelError.message?.includes('does not exist') ||
                     (modelError as any)?.status === 404);

                if (isModelError) {
                    console.warn('gpt-4o-transcribe not available, falling back to whisper-1');
                    transcription = await openai.audio.transcriptions.create({
                        file: fs.createReadStream(tempFilePath),
                        model: 'whisper-1',
                        language: 'no',
                        prompt: whisperPrompt,
                    });
                    console.log('Transcription succeeded with whisper-1 (fallback)');
                } else {
                    throw modelError;
                }
            }

            return NextResponse.json({ text: transcription.text });
        } finally {
            // Always clean up temp file
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }
    } catch (error: unknown) {
        // Detailed error logging
        const openaiError = error as any;
        const errorStatus = openaiError?.status || openaiError?.response?.status;
        const errorMessage = openaiError?.message || 'Unknown error';
        const errorType = openaiError?.type || openaiError?.error?.type;

        console.error('Transcription error details:', {
            status: errorStatus,
            message: errorMessage,
            type: errorType,
        });

        // Return specific error messages based on the error type
        if (errorStatus === 401 || errorMessage.includes('API key')) {
            return NextResponse.json(
                { error: 'OpenAI API-nøkkel er ugyldig. Kontakt administrator.' },
                { status: 500 }
            );
        }
        if (errorStatus === 429) {
            return NextResponse.json(
                { error: 'OpenAI API rate limit nådd. Vennligst vent litt og prøv igjen.' },
                { status: 429 }
            );
        }
        if (errorStatus === 413 || errorMessage.includes('too large')) {
            return NextResponse.json(
                { error: 'Lydfilen er for stor for OpenAI API. Prøv et kortere opptak.' },
                { status: 413 }
            );
        }

        return NextResponse.json(
            { error: 'Transkribering feilet. Prøv igjen senere.' },
            { status: 500 }
        );
    }
}
