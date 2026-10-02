'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MenuTab } from '@/components/menu/MenuTab';
import { MenuItem } from '@/lib/types';
import { getMenus } from '@/lib/services/menuService';

export default function MenuPage() {
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

  return <MenuTab menus={menus} onRefresh={loadData} />;
}
