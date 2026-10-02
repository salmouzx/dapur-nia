'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CustomerTab } from '@/components/customer/CustomerTab';
import { Customer } from '@/lib/types';
import { getCustomers } from '@/lib/services/customerService';

export default function PelangganPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Gagal mengambil data pelanggan:', err);
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
        <div className="h-6 w-36 bg-muted/60 rounded-lg"></div>
        <div className="h-20 bg-muted/60 rounded-2xl"></div>
        <div className="h-20 bg-muted/60 rounded-2xl"></div>
      </div>
    );
  }

  return <CustomerTab customers={customers} onRefresh={loadData} />;
}
