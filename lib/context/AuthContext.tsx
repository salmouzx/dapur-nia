'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  UserCredential,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  register: (email: string, pass: string, displayName?: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  loginDemo: (email?: string, displayName?: string) => void;
  formatAuthError: (error: unknown) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function formatAuthError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Terjadi kesalahan sistem yang tidak diketahui.';
  }

  const err = error as { code?: string; message?: string };
  const code = err.code || '';

  switch (code) {
    case 'auth/configuration-not-found':
      return 'Layanan Firebase Authentication belum diaktifkan di Firebase Console untuk proyek ini. Silakan buka Firebase Console > Build > Authentication > tab "Sign-in method" lalu aktifkan penyedia "Email/Password".';
    case 'auth/invalid-email':
      return 'Format alamat email tidak valid.';
    case 'auth/user-disabled':
      return 'Akun pengguna ini telah dinonaktifkan.';
    case 'auth/user-not-found':
      return 'Akun dengan email ini belum terdaftar.';
    case 'auth/wrong-password':
      return 'Kata sandi yang Anda masukkan salah.';
    case 'auth/invalid-credential':
      return 'Email atau kata sandi tidak cocok. Silakan periksa kembali.';
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Silakan langsung masuk atau gunakan email lain.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu pendek/lemah. Gunakan 8-12 karakter dengan huruf kapital, angka, dan simbol.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan masuk yang gagal. Silakan tunggu beberapa saat.';
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah. Periksa sambungan internet Anda.';
    case 'auth/popup-closed-by-user':
      return 'Jendela masuk Google ditutup sebelum proses selesai. Silakan coba lagi.';
    case 'auth/popup-blocked':
      return 'Jendela popup Google diblokir oleh peramban. Izinkan popup untuk situs ini lalu coba lagi.';
    case 'auth/cancelled-popup-request':
      return 'Permintaan masuk Google dibatalkan.';
    case 'auth/account-exists-with-different-credential':
      return 'Akun dengan email ini sudah terdaftar dengan metode lain. Silakan masuk menggunakan metode yang sesuai.';
    case 'auth/operation-not-allowed':
      return 'Metode masuk ini belum diaktifkan di tab "Sign-in method" Firebase Console.';
    default:
      return err.message || 'Gagal memproses autentikasi. Silakan coba lagi.';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Cek sesi demo di localStorage jika ada
    const savedDemoUser = typeof window !== 'undefined' ? localStorage.getItem('dapur_nia_demo_user') : null;
    if (savedDemoUser) {
      try {
        setUser(JSON.parse(savedDemoUser));
        setIsLoading(false);
        return;
      } catch {
        localStorage.removeItem('dapur_nia_demo_user');
      }
    }

    // 2. Listener Firebase Auth resmi
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Jika tidak ada demo user aktif, gunakan currentUser Firebase
      if (!localStorage.getItem('dapur_nia_demo_user')) {
        setUser(currentUser);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    localStorage.removeItem('dapur_nia_demo_user');
    return await signInWithEmailAndPassword(auth, email, pass);
  };

  const loginWithGoogle = async () => {
    localStorage.removeItem('dapur_nia_demo_user');
    return await signInWithPopup(auth, googleProvider);
  };

  const register = async (email: string, pass: string, displayName?: string) => {
    localStorage.removeItem('dapur_nia_demo_user');
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName && cred.user) {
      try {
        await updateProfile(cred.user, { displayName });
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName,
        });
      } catch (err) {
        console.warn('Gagal memperbarui displayName:', err);
      }
    }
    return cred;
  };

  const loginDemo = (email?: string, displayName?: string) => {
    const demoUser: AppUser = {
      uid: 'demo-pemilik-' + Date.now(),
      email: email || 'pemilik@dapurnia.com',
      displayName: displayName || 'Pemilik Dapur Nia',
    };
    localStorage.setItem('dapur_nia_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const logout = async () => {
    localStorage.removeItem('dapur_nia_demo_user');
    try {
      await signOut(auth);
    } catch {
      // Abaikan jika tidak ada session Firebase aktif
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        loginDemo,
        formatAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
