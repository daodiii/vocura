'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mic, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
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
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo & Title */}
                <div className="text-center mb-8 animate-fade-in">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 cursor-pointer">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center glow-teal" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))' }}>
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-semibold gradient-text">
                            MediScribe
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                        {isLogin ? 'Logg inn' : 'Opprett konto'}
                    </h1>
                    <p className="text-sm text-[var(--text-muted)]">
                        {isLogin
                            ? 'Velkommen tilbake til MediScribe AI'
                            : 'Start din gratis prøveperiode'}
                    </p>
                </div>

                {/* Form Card */}
                <div className="glass-card-elevated p-8 animate-slide-up stagger-1">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name (sign-up only) */}
                        {!isLogin && (
                            <div>
                                <label className="text-sm font-semibold text-[var(--text-secondary)] block mb-2">
                                    Fullt navn
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Dr. Ola Nordmann"
                                    required
                                    className="glass-input"
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="text-sm font-semibold text-[var(--text-secondary)] block mb-2">
                                E-post
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="din@epost.no"
                                required
                                className="glass-input"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-sm font-semibold text-[var(--text-secondary)] block mb-2">
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
                                    className="glass-input pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer transition-colors"
                                    aria-label={showPassword ? 'Skjul passord' : 'Vis passord'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2 p-3 bg-[var(--error-subtle)] border border-[rgba(239,68,68,0.2)] rounded-lg">
                                <AlertCircle className="w-4 h-4 text-[var(--error)] mt-0.5 shrink-0" />
                                <p className="text-sm text-[var(--error)]">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="glass-btn-primary w-full inline-flex items-center justify-center gap-2 !py-3 cursor-pointer"
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
                    <div className="mt-6 pt-6 border-t border-[var(--glass-border)] text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-sm text-[var(--primary-light)] hover:underline cursor-pointer"
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
                            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer transition-colors"
                        >
                            Les om personvern og databehandling
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
