'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MenuTab } from '@/components/menu/MenuTab';
import { MenuItem } from '@/lib/types';
import { getMenus } from '@/lib/services/menuService';
import { useAuth } from '@/lib/context/AuthContext';
import { ChefHat, ShieldCheck, LogIn, ArrowRight } from 'lucide-react';

export default function MenuPage() {
  const { user } = useAuth();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMenus();
      setMenus(data);
    } catch (err) {
      console.error('Gagal mengambil data menu:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="space-y-3 py-4 animate-pulse">
        <div className="h-6 w-32 bg-muted/60 rounded-lg"></div>
        <div className="h-24 bg-muted/60 rounded-2xl"></div>
        <div className="h-24 bg-muted/60 rounded-2xl"></div>
        <div className="h-24 bg-muted/60 rounded-2xl"></div>
      </div>
    );
  }

  const userName =
    user?.displayName ||
    user?.email?.split('@')[0] ||
    'Pemilik';

  return (
    <div className="space-y-4">
      {/* Banner Status Pemilik (hanya tampil jika sudah masuk) */}
      {user && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">
                Halo, {userName}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                Sesi pemilik aktif
              </p>
            </div>
          </div>
          <Link
            href="/kelola-menu"
            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl shadow-xs hover:opacity-95 active:scale-95 transition-all shrink-0"
          >
            <span>Kelola Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Tampilan Daftar Menu (Tamu tetap bisa melihat Daftar Menu tanpa masuk) */}
      <MenuTab menus={menus} onRefresh={loadData} isReadOnly={true} />
    </div>
  );
}

