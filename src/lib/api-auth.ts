// src/lib/api-auth.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface AuthResult {
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> };
  supabase: Awaited<ReturnType<typeof createClient>>;
}

type AuthResponse = AuthResult | NextResponse;

export async function requireAuth(): Promise<AuthResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: 'Ikke autentisert. Vennligst logg inn.' },
      { status: 401 }
    );
  }

  return { user, supabase };
}

export function isAuthResponse(result: AuthResponse): result is NextResponse {
  return result instanceof NextResponse;
}
