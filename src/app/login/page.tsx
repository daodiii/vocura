'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mic, Loader2, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/dashboard';

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push(redirect);
                router.refresh();
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { name },
                    },
                });
                if (error) throw error;

                if (data.user) {
                    // Create user profile in database
                    await fetch('/api/auth/create-profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: data.user.id,
                            email,
                            name,
                        }),
                    });
                    router.push(redirect);
                    router.refresh();
                }
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'En feil oppstod';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[#0A0A0A]">
            <div className="max-w-md w-full">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 cursor-pointer">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#5E6AD2]">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-semibold text-[#EDEDED]">
                            Vocura
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-[#EDEDED] mb-2">
                        {isLogin ? 'Logg inn' : 'Opprett konto'}
                    </h1>
                    <p className="text-sm text-[#5C5C5C]">
                        {isLogin
                            ? 'Velkommen tilbake til Vocura AI'
                            : 'Start din gratis prøveperiode'}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-2xl p-8">
                    {/* BankID Login */}
                    {isLogin && (
                      <div className="mb-6">
                        <button
                          type="button"
                          onClick={async () => {
                            setError('');
                            setLoading(true);
                            try {
                              const { error } = await supabase.auth.signInWithOAuth({
                                provider: 'keycloak' as any,
                                options: {
                                  redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
                                  scopes: 'openid profile',
                                },
                              });
                              if (error) throw error;
                            } catch (err: unknown) {
                              const message = err instanceof Error ? err.message : 'BankID-innlogging feilet';
                              setError(message);
                              setLoading(false);
                            }
                          }}
                          disabled={loading}
                          className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg bg-[#2B2D42] hover:bg-[#1E2036] text-white font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Shield className="w-4.5 h-4.5" />
                          Logg inn med BankID
                        </button>

                        <div className="relative my-6">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[rgba(255,255,255,0.06)]" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="px-3 bg-[#191919] text-xs text-[#5C5C5C]">
                              eller logg inn med e-post
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name (sign-up only) */}
                        {!isLogin && (
                            <div>
                                <label className="text-sm font-semibold text-[#8B8B8B] block mb-2">
                                    Fullt navn
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Dr. Ola Nordmann"
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg bg-[#0F1629] border border-[rgba(255,255,255,0.06)] text-[#EDEDED] placeholder-[#5C5C5C] outline-none focus:border-[#5E6AD2] transition-colors"
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="text-sm font-semibold text-[#8B8B8B] block mb-2">
                                E-post
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="din@epost.no"
                                required
                                className="w-full px-4 py-2.5 rounded-lg bg-[#0F1629] border border-[rgba(255,255,255,0.06)] text-[#EDEDED] placeholder-[#5C5C5C] outline-none focus:border-[#5E6AD2] transition-colors"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-sm font-semibold text-[#8B8B8B] block mb-2">
                                Passord
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minst 6 tegn"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-2.5 pr-10 rounded-lg bg-[#0F1629] border border-[rgba(255,255,255,0.06)] text-[#EDEDED] placeholder-[#5C5C5C] outline-none focus:border-[#5E6AD2] transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C5C5C] hover:text-[#8B8B8B] cursor-pointer transition-colors"
                                    aria-label={showPassword ? 'Skjul passord' : 'Vis passord'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2 p-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg">
                                <AlertCircle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
                                <p className="text-sm text-[#EF4444]">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {isLogin ? 'Logger inn...' : 'Oppretter konto...'}
                                </>
                            ) : (
                                isLogin ? 'Logg inn' : 'Opprett konto'
                            )}
                        </button>
                    </form>

                    {/* Toggle login/signup */}
                    <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.06)] text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-sm text-[#5E6AD2] hover:underline cursor-pointer"
                        >
                            {isLogin
                                ? 'Har du ikke konto? Opprett en her'
                                : 'Har du allerede konto? Logg inn'}
                        </button>
                    </div>

                    {/* Privacy link */}
                    <div className="mt-4 text-center">
                        <Link
                            href="/personvern"
                            className="text-xs text-[#5C5C5C] hover:text-[#8B8B8B] cursor-pointer transition-colors"
                        >
                            Les om personvern og databehandling
                        </Link>
                    </div>

                    <div className="mt-2 text-center">
                        <Link
                            href="/sikkerhet"
                            className="text-xs text-[#5C5C5C] hover:text-[#8B8B8B] cursor-pointer transition-colors"
                        >
                            Sikkerhet og tillit
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
