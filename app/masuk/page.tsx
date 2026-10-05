'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { Lock, Mail, Eye, EyeOff, LogIn, ChefHat, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.15 0 9.99 0 12s.45 3.85 1.25 5.43l4.03-3.14z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

function MasukForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/kelola-menu';

  const { user, login, loginWithGoogle, loginDemo, formatAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Jika sudah masuk, langsung arahkan ke halaman Kelola Menu
  useEffect(() => {
    if (user) {
      router.replace(redirectPath);
    }
  }, [user, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsConfigError(false);

    if (!email.trim() || !password) {
      setErrorMsg('Mohon masukkan alamat email dan kata sandi Anda.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      router.replace(redirectPath);
    } catch (err: unknown) {
      const errObj = err as { code?: string };
      if (errObj?.code === 'auth/configuration-not-found') {
        setIsConfigError(true);
      }
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsConfigError(false);
    try {
      setIsGoogleSubmitting(true);
      await loginWithGoogle();
      router.replace(redirectPath);
    } catch (err: unknown) {
      const errObj = err as { code?: string };
      if (errObj?.code === 'auth/configuration-not-found') {
        setIsConfigError(true);
      }
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleDemoBypass = () => {
    loginDemo(email || 'pemilik@dapurnia.com', 'Pemilik Dapur Nia');
    router.replace(redirectPath);
  };

  return (
    <div className="space-y-4 py-2 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Tombol kembali ke daftar menu tamu */}
      <Link
        href="/menu"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Daftar Menu (Tamu)
      </Link>

      {/* Header Banner */}
      <div className="text-center space-y-1.5 pt-1">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-inner">
          <ChefHat className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Masuk Pemilik Menu</h2>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Masuk dengan akun Google atau Email & Kata Sandi untuk mengelola menu katering Dapur Nia.
        </p>
      </div>

      {/* Alert Error */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs space-y-2 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>

          {/* Panduan & Tombol Solusi jika auth/configuration-not-found */}
          {isConfigError && (
            <div className="pt-2 border-t border-rose-200/60 dark:border-rose-800/60 space-y-2 text-[11px]">
              <p className="font-semibold text-rose-900 dark:text-rose-100">
                Cara mengaktifkan di Firebase Console:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground dark:text-rose-200/90 pl-1">
                <li>Buka <strong>console.firebase.google.com</strong> &gt; Proyek <strong>salma-bootcamp</strong></li>
                <li>Pilih <strong>Build</strong> &gt; <strong>Authentication</strong> &gt; klik <strong>Get Started</strong></li>
                <li>Pada tab <strong>Sign-in method</strong>, aktifkan penyedia <strong>Email/Password</strong> dan <strong>Google</strong></li>
              </ol>
              <button
                type="button"
                onClick={handleDemoBypass}
                className="w-full mt-2 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Masuk Mode Demo Pengujian (Bypass)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Card Form Masuk */}
      <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
        {/* Tombol Masuk dengan Google */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-background hover:bg-muted/80 text-foreground border border-border text-xs font-semibold rounded-xl shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isGoogleSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Menghubungkan ke Google...</span>
              </div>
            ) : (
              <>
                <GoogleIcon />
                <span>Masuk dengan Google</span>
              </>
            )}
          </button>
        </div>

        {/* Pemisah (Divider) */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-border/70 w-full" />
          <span className="bg-card px-2.5 text-[11px] uppercase tracking-wider text-muted-foreground shrink-0 font-medium">
            atau dengan email
          </span>
          <div className="border-t border-border/70 w-full" />
        </div>

        {/* Form Email & Password */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              Alamat Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pemilik@dapurnia.com"
              autoComplete="email"
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                Kata Sandi
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 - 12 karakter"
                autoComplete="current-password"
                required
                maxLength={12}
                className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Lihat kata sandi"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground text-xs font-semibold rounded-xl shadow-md hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Memproses...</span>
              </div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </>
            )}
          </button>

          <div className="pt-2 border-t border-border/60 text-center">
            <p className="text-xs text-muted-foreground">
              Belum memiliki akun pengelola?{' '}
              <Link
                href="/daftar"
                className="font-semibold text-primary hover:underline"
              >
                Daftar di sini
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="p-3 bg-muted/40 border border-border/60 rounded-2xl text-[11px] text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Info Akses Pengelola
        </p>
        <p>
          Halaman Kelola Menu dilindungi oleh Firebase Authentication. Anda dapat masuk cepat dengan Google atau menggunakan Email &amp; Kata Sandi.
        </p>
      </div>
    </div>
  );
}

export default function MasukPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 py-8 animate-pulse text-center">
          <div className="w-12 h-12 bg-muted/70 rounded-2xl mx-auto" />
          <div className="h-6 w-36 bg-muted/70 rounded-lg mx-auto" />
          <div className="h-44 bg-muted/60 rounded-3xl" />
        </div>
      }
    >
      <MasukForm />
    </Suspense>
  );
}
