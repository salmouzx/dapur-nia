'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { validatePassword } from '@/lib/validation';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  UserPlus,
  ChefHat,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';

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

export default function DaftarPage() {
  const router = useRouter();
  const { user, register, loginWithGoogle, loginDemo, formatAuthError } = useAuth();

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Status validasi kata sandi real-time
  const pwdValidation = validatePassword(password);
  const isMatch = password.length > 0 && password === confirmPassword;

  // Jika sudah masuk, arahkan langsung ke halaman Kelola Menu
  useEffect(() => {
    if (user) {
      router.replace('/kelola-menu');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsConfigError(false);

    if (!nama.trim()) {
      setErrorMsg('Nama lengkap pengelola wajib diisi.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Alamat email wajib diisi.');
      return;
    }

    // Validasi aturan kata sandi: 8-12 karakter, kapital, angka, simbol
    if (!pwdValidation.isValid) {
      setErrorMsg(pwdValidation.message || 'Kata sandi belum memenuhi seluruh kriteria keamanan.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok dengan kata sandi.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(email.trim(), password, nama.trim());
      router.replace('/kelola-menu');
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

  const handleGoogleRegister = async () => {
    setErrorMsg(null);
    setIsConfigError(false);
    try {
      setIsGoogleSubmitting(true);
      await loginWithGoogle();
      router.replace('/kelola-menu');
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
    loginDemo(email || 'pemilik@dapurnia.com', nama || 'Pemilik Dapur Nia');
    router.replace('/kelola-menu');
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
        <h2 className="text-xl font-bold tracking-tight text-foreground">Daftar Akun Pengelola</h2>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Daftarkan akun untuk mengelola katalog menu katering Dapur Nia.
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
                <li>Buka console.firebase.google.com &gt; Proyek <strong>salma-bootcamp</strong></li>
                <li>Klik <strong>Build</strong> &gt; <strong>Authentication</strong> &gt; tombol <strong>Get Started</strong></li>
                <li>Pada tab <strong>Sign-in method</strong>, aktifkan <strong>Email/Password</strong> dan <strong>Google</strong></li>
              </ol>
              <button
                type="button"
                onClick={handleDemoBypass}
                className="w-full mt-2 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Lanjutkan dengan Mode Demo (Tanpa Firebase Console)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Card Pendaftaran */}
      <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
        {/* Tombol Daftar dengan Google */}
        <div>
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-background hover:bg-muted/80 text-foreground border border-border text-xs font-semibold rounded-xl shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isGoogleSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Mendaftarkan via Google...</span>
              </div>
            ) : (
              <>
                <GoogleIcon />
                <span>Daftar Cepat dengan Google</span>
              </>
            )}
          </button>
        </div>

        {/* Pemisah (Divider) */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-border/70 w-full" />
          <span className="bg-card px-2.5 text-[11px] uppercase tracking-wider text-muted-foreground shrink-0 font-medium">
            atau daftar dengan email
          </span>
          <div className="border-t border-border/70 w-full" />
        </div>

        {/* Form Pendaftaran Manual */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              Nama Pengelola / Pemilik <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Dina / Ibu Nia"
              autoComplete="name"
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              Alamat Email <span className="text-rose-500">*</span>
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                Kata Sandi <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-[10px] font-mono ${
                  password.length >= 8 && password.length <= 12
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-muted-foreground'
                }`}
              >
                {password.length}/12
              </span>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 - 12 karakter"
                autoComplete="new-password"
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

            {/* Indikator Aturan Kata Sandi: 8-12 kata, huruf kapital, angka, simbol */}
            <div className="mt-2 p-2.5 bg-muted/40 border border-border/70 rounded-xl space-y-1.5 text-[11px]">
              <p className="font-semibold text-foreground text-[10px] uppercase tracking-wider">
                Syarat Keamanan Kata Sandi:
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="flex items-center gap-1.5">
                  {pwdValidation.hasLength ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                  )}
                  <span className={pwdValidation.hasLength ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                    8 - 12 Karakter
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {pwdValidation.hasUppercase ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                  )}
                  <span className={pwdValidation.hasUppercase ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                    Huruf Kapital (A-Z)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {pwdValidation.hasNumber ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                  )}
                  <span className={pwdValidation.hasNumber ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                    Angka (0-9)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {pwdValidation.hasSymbol ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                  )}
                  <span className={pwdValidation.hasSymbol ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                    Simbol (!@#$ dll)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
              </span>
              {confirmPassword && (
                <span className={`text-[10px] font-medium ${isMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {isMatch ? '✓ Cocok' : '✗ Tidak cocok'}
                </span>
              )}
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang kata sandi di atas"
              autoComplete="new-password"
              required
              maxLength={12}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting || !pwdValidation.isValid || !isMatch}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground text-xs font-semibold rounded-xl shadow-md hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer mt-3"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Mendaftarkan...</span>
              </div>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Daftar Akun Pengelola</span>
              </>
            )}
          </button>

          <div className="pt-2 border-t border-border/60 text-center">
            <p className="text-xs text-muted-foreground">
              Sudah memiliki akun pengelola?{' '}
              <Link
                href="/masuk"
                className="font-semibold text-primary hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
