'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  ChefHat,
  Users,
  ClipboardList,
  BarChart3,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface MobileShellProps {
  children: React.ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const tabs = [
    { href: '/menu', label: 'Daftar', icon: UtensilsCrossed },
    { href: '/kelola-menu', label: 'Kelola', icon: ChefHat },
    { href: '/pelanggan', label: 'Pelanggan', icon: Users },
    { href: '/pesanan', label: 'Pesanan', icon: ClipboardList },
    { href: '/laporan', label: 'Laporan', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push('/menu');
    } catch (err) {
      console.error('Gagal keluar:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const userName =
    user?.displayName ||
    user?.email?.split('@')[0] ||
    'Pemilik';

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex justify-center py-0 sm:py-6 text-foreground font-sans">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-background min-h-screen sm:min-h-[844px] sm:max-h-[920px] sm:rounded-3xl sm:border border-border/80 shadow-2xl flex flex-col relative overflow-hidden">

        {/* Top Header */}
        <header className="px-4 py-3 border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                <ChefHat className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                  Dapur Nia
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                    v1.0
                  </span>
                </h1>
                <p className="text-[11px] text-muted-foreground">Katering Harian Rumahan</p>
              </div>
            </div>

            {/* Auth status & actions */}
            <div className="flex items-center gap-1.5">
              {user ? (
                <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full pl-2 pr-1 py-0.5">
                  <span className="text-[11px] font-semibold text-primary max-w-[85px] truncate">
                    {userName}
                  </span>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    title="Keluar dari akun dan kembali ke Beranda"
                    className="p-1 rounded-full text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/masuk"
                  className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground hover:opacity-95 shadow-2xs transition-all active:scale-95"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Masuk</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className={`flex-1 overflow-y-auto px-4 py-3.5 ${user ? 'pb-24' : 'pb-8'}`}>
          {children}
        </main>

        {/* Bottom Navigation Bar: Hanya muncul jika pengguna sudah masuk (Role Pemilik) */}
        {user && (
          <nav className="absolute bottom-0 left-0 right-0 border-t border-border/80 bg-background/95 backdrop-blur-md px-2 py-2 z-30 animate-in fade-in duration-200">
            <div className="grid grid-cols-5 gap-0.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive =
                  pathname === tab.href ||
                  (tab.href === '/menu' && pathname === '/') ||
                  (tab.href === '/kelola-menu' && pathname === '/menu/kelola');
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all ${
                      isActive
                        ? 'text-primary font-semibold bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                    <span className="text-[10px] tracking-tight">{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
