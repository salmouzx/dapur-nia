'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { OrderTab } from '@/components/order/OrderTab';
import { OrderItem, MenuItem, Customer } from '@/lib/types';
import { getOrders } from '@/lib/services/orderService';
import { getMenus } from '@/lib/services/menuService';
import { getCustomers } from '@/lib/services/customerService';

export default function PesananPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    loadAll();
  }, [loadAll]);

  if (isLoading) {
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
