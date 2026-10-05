'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { ReportTab } from '@/components/report/ReportTab';

export default function LaporanPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/masuk?redirect=/laporan');
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || (!user && !isAuthLoading)) {
    return (
      <div className="space-y-3 py-4 animate-pulse">
        <div className="h-6 w-36 bg-muted/60 rounded-lg"></div>
        <div className="h-28 bg-muted/60 rounded-2xl"></div>
        <div className="h-28 bg-muted/60 rounded-2xl"></div>
      </div>
    );
  }

  return <ReportTab lastUpdated={Date.now()} />;
}
