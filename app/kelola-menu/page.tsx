'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { MenuTab } from '@/components/menu/MenuTab';
import { MenuItem } from '@/lib/types';
import { getMenus } from '@/lib/services/menuService';
import { LogOut, UserCheck, ShieldCheck, Eye, ChefHat, Sparkles } from 'lucide-react';

export default function KelolaMenuPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, logout } = useAuth();

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // 1 & 2. Cek autentikasi: Jika belum masuk dan pengecekan selesai, arahkan ke halaman Masuk
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/masuk?redirect=/kelola-menu');
    }
  }, [user, isAuthLoading, router]);

  const loadData = useCallback(async () => {
    try {
      setIsDataLoading(true);
      const data = await getMenus();
      setMenus(data);
    } catch (err) {
      console.error('Gagal mengambil data menu:', err);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // 6. Tombol Keluar: Mengakhiri sesi dan kembali ke beranda (/menu)
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace('/menu');
    } catch (err) {
      console.error('Gagal keluar:', err);
      alert('Gagal mengakhiri sesi. Silakan coba lagi.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // State loading autentikasi agar sesi tetap terjaga saat refresh tanpa kedip redirect
  if (isAuthLoading || (!user && !isAuthLoading)) {
    return (
      <div className="space-y-4 py-8 animate-pulse text-center">
        <div className="w-12 h-12 bg-muted/60 rounded-2xl mx-auto" />
        <div className="h-5 w-44 bg-muted/60 rounded-lg mx-auto" />
        <div className="h-4 w-56 bg-muted/40 rounded-lg mx-auto" />
        <div className="space-y-3 pt-6">
          <div className="h-20 bg-muted/50 rounded-2xl" />
          <div className="h-20 bg-muted/50 rounded-2xl" />
          <div className="h-20 bg-muted/50 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Tentukan nama tampilan pengguna
  const userName =
    user?.displayName ||
    user?.email?.split('@')[0] ||
    'Pemilik Dapur Nia';

  return (
    <div className="space-y-4">
      {/* 4. Tampilkan nama pengguna di bagian atas & Tombol Keluar */}
      <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-primary/10 border border-primary/25 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-foreground truncate max-w-[150px] sm:max-w-[200px]">
                  {userName}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  Pemilik (Akses Menu)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          {/* Tombol Keluar */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
            title="Keluar dari akun dan kembali ke Beranda"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
          </button>
        </div>

        {/* Quick Links Navigasi Pemilik */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-primary/15 text-[11px]">
          <span className="text-muted-foreground flex items-center gap-1">
            <ChefHat className="w-3.5 h-3.5 text-primary" />
            Mode Pengelolaan Menu Aktif
          </span>
          <Link
            href="/menu"
            className="text-primary hover:underline font-semibold flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            Lihat Tampilan Tamu
          </Link>
        </div>
      </div>

      {/* 5. CRUD Menu: Semua pengguna yang sudah masuk boleh menambah, mengubah, dan menghapus menu */}
      {isDataLoading ? (
        <div className="space-y-3 py-2 animate-pulse">
          <div className="h-6 w-32 bg-muted/60 rounded-lg"></div>
          <div className="h-24 bg-muted/60 rounded-2xl"></div>
          <div className="h-24 bg-muted/60 rounded-2xl"></div>
          <div className="h-24 bg-muted/60 rounded-2xl"></div>
        </div>
      ) : (
        <MenuTab menus={menus} onRefresh={loadData} isReadOnly={false} />
      )}
    </div>
  );
}
