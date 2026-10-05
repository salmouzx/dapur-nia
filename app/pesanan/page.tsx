'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { OrderTab } from '@/components/order/OrderTab';
import { OrderItem, MenuItem, Customer } from '@/lib/types';
import { getOrders } from '@/lib/services/orderService';
import { getMenus } from '@/lib/services/menuService';
import { getCustomers } from '@/lib/services/customerService';

export default function PesananPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Proteksi rute: Hanya untuk pengguna yang sudah masuk
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/masuk?redirect=/pesanan');
    }
  }, [user, isAuthLoading, router]);

  const loadAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ordData, menuData, custData] = await Promise.all([
        getOrders(),
        getMenus(),
        getCustomers(),
      ]);
      setOrders(ordData);
      setMenus(menuData);
      setCustomers(custData);
    } catch (err) {
      console.error('Gagal mengambil data pesanan:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadAll();
    }
  }, [user, loadAll]);

  if (isAuthLoading || (!user && !isAuthLoading) || isLoading) {
    return (
      <div className="space-y-3 py-4 animate-pulse">
        <div className="h-6 w-36 bg-muted/60 rounded-lg"></div>
        <div className="h-28 bg-muted/60 rounded-2xl"></div>
        <div className="h-28 bg-muted/60 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <OrderTab
      orders={orders}
      menus={menus}
      customers={customers}
      onRefresh={loadAll}
    />
  );
}
