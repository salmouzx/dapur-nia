'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed, Users, ClipboardList, BarChart3, ChefHat, Database, ShieldAlert } from 'lucide-react';
import { isFirebaseConfigured } from '@/lib/firebase';
import { UjiTembusModal } from '@/components/testing/UjiTembusModal';

interface MobileShellProps {
  children: React.ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  const pathname = usePathname();
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const tabs = [
    { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
    { href: '/pelanggan', label: 'Pelanggan', icon: Users },
    { href: '/pesanan', label: 'Pesanan', icon: ClipboardList },
    { href: '/laporan', label: 'Laporan', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex justify-center py-0 sm:py-6 text-foreground font-sans">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-background min-h-screen sm:min-h-[844px] sm:max-h-[920px] sm:rounded-3xl sm:border border-border/80 shadow-2xl flex flex-col relative overflow-hidden">

        {/* Top Header */}
        <header className="px-4 pt-3.5 pb-2.5 border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-20 space-y-2">
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

            {/* Database indicator status */}
            <div className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full bg-secondary/80 border border-border">
              <Database className={`w-3 h-3 ${isFirebaseConfigured ? 'text-amber-500' : 'text-neutral-400'}`} />
              <span className="text-muted-foreground">
                {isFirebaseConfigured ? 'Cloud (salma-bootcamp)' : 'Mode Lokal'}
              </span>
            </div>
          </div>

          {/* Quick Access Bar: Uji Tembus PRD Suite */}
          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 px-2.5 py-1.5 rounded-xl">
            <button
              onClick={() => setIsTestModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline text-left"
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Uji Tembus 6 Skenario PRD</span>
            </button>
            <span className="text-[10px] text-primary/80 font-mono">Acceptance Criteria</span>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto px-4 py-3.5 pb-24">
          {children}
        </main>

        {/* Bottom Navigation Bar with Multi-Page URL Links */}
        <nav className="absolute bottom-0 left-0 right-0 border-t border-border/80 bg-background/95 backdrop-blur-md px-3 py-2 z-30">
          <div className="grid grid-cols-4 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href || (tab.href === '/menu' && pathname === '/');
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${isActive
                      ? 'text-primary font-semibold bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Icon className={`w-5 h-5 mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[11px] tracking-tight">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Uji Tembus Modal available from any URL route */}
        <UjiTembusModal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
        />
      </div>
    </div>
  );
}
