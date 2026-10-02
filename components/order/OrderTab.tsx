'use client';

import React, { useState } from 'react';
import {
  Plus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  X,
  ArrowRight,
  XCircle,
  Truck,
  CheckCheck,
  RotateCw,
} from 'lucide-react';
import { OrderItem, MenuItem, Customer, OrderStatus, ORDER_STATUS_LABELS, LEGAL_STATUS_TRANSITIONS } from '@/lib/types';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { createOrder, updateOrderStatus } from '@/lib/services/orderService';

interface OrderTabProps {
  orders: OrderItem[];
  menus: MenuItem[];
  customers: Customer[];
  onRefresh: () => void;
}

export function OrderTab({ orders, menus, customers, onRefresh }: OrderTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('semua');

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [jumlahPorsi, setJumlahPorsi] = useState<string>('1');
  const [ongkir, setOngkir] = useState<string>('10000');
  const [catatan, setCatatan] = useState('');

  // Feedback State
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Live calculation helpers
  const targetMenu = menus.find((m) => m.id === selectedMenuId);
  const porsiNum = Number(jumlahPorsi) || 0;
  const ongkirNum = Number(ongkir) || 0;
  const liveTotal = targetMenu ? (targetMenu.harga * porsiNum) + (ongkirNum >= 0 ? ongkirNum : 0) : 0;

  const openCreateModal = () => {
    setSelectedCustomerId(customers[0]?.id || '');
    // Pilih menu yang masih memiliki sisa porsi jika ada
    const firstAvailable = menus.find((m) => m.sisa_porsi > 0) || menus[0];
    setSelectedMenuId(firstAvailable?.id || '');
    setJumlahPorsi('1');
    setOngkir('10000');
    setCatatan('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer) {
      setFormError('Pilih pelanggan terlebih dahulu (atau daftarkan di tab Pelanggan).');
      return;
    }

    if (!targetMenu) {
      setFormError('Pilih menu yang valid.');
      return;
    }

    // Invariant 4.3 No 2: Porsi nol atau negatif ditolak
    if (porsiNum <= 0) {
      setFormError('Jumlah porsi harus minimal 1 porsi (tidak boleh nol atau negatif).');
      return;
    }

    // Invariant 4.3 No 2: Sisa porsi tidak mencukupi
    if (porsiNum > targetMenu.sisa_porsi) {
      setFormError(
        `Porsi melebihi sisa stok yang tersedia! Stok "${targetMenu.nama}" hanya tersisa ${targetMenu.sisa_porsi} porsi.`
      );
      return;
    }

    if (ongkirNum < 0) {
      setFormError('Ongkos kirim tidak boleh bernilai negatif.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createOrder({
        customerId: customer.id,
        customerNama: customer.nama,
        customerWa: customer.no_wa,
        customerAlamat: customer.alamat,
        menuId: targetMenu.id,
        jumlahPorsi: porsiNum,
        ongkir: ongkirNum,
        catatan,
      });

      setSuccessToast(`Pesanan untuk ${customer.nama} berhasil dibuat!`);
      setIsModalOpen(false);
      onRefresh();
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat pesanan.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransition = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
      setSuccessToast(`Status pesanan berhasil diperbarui ke "${ORDER_STATUS_LABELS[nextStatus].label}".`);
      onRefresh();
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui status.';
      alert(msg);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'semua') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Kelola Pesanan</h2>
          <p className="text-xs text-muted-foreground">Alur pesanan, tagihan, &amp; pembaruan status</p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={menus.length === 0 || customers.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl shadow-sm hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all"
        >
          <Plus className="w-4 h-4" />
          Pesanan Baru
        </button>
      </div>

      {/* Warnings if prerequisite data is missing */}
      {menus.length === 0 && (
        <div className="p-2.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Silakan tambah menu di tab <b>Menu</b> terlebih dahulu.</span>
        </div>
      )}
      {customers.length === 0 && (
        <div className="p-2.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Silakan daftarkan pelanggan di tab <b>Pelanggan</b> terlebih dahulu.</span>
        </div>
      )}

      {/* Status Filter Pills */}
      {/* Status Filter Pills sesuai Skema Bagian 5 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['semua', 'menunggu_bayar', 'dibayar', 'diproses', 'selesai', 'dibatalkan'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap border transition-all ${
              statusFilter === st
                ? 'bg-primary text-primary-foreground border-primary font-medium shadow-xs'
                : 'bg-card border-border/80 text-muted-foreground hover:text-foreground'
            }`}
          >
            {st === 'semua' ? 'Semua Pesanan' : ORDER_STATUS_LABELS[st as OrderStatus]?.label || st}
          </button>
        ))}
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed rounded-2xl bg-muted/20">
          <p className="font-semibold text-sm text-foreground">Tidak ada pesanan ditemukan</p>
          <p className="text-xs text-muted-foreground mt-1">
            {statusFilter !== 'semua'
              ? `Belum ada pesanan dengan status "${ORDER_STATUS_LABELS[statusFilter as OrderStatus]?.label || statusFilter}".`
              : 'Klik tombol "+ Pesanan Baru" untuk membuat pesanan katering harian.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((ord) => {
            const statusConfig = ORDER_STATUS_LABELS[ord.status];
            const allowedTransitions = LEGAL_STATUS_TRANSITIONS[ord.status];

            return (
              <div
                key={ord.id}
                className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3"
              >
                {/* Header Card: Pelanggan & Status Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{ord.customerNama}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{formatTanggal(ord.tanggalPesanan)}</span>
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusConfig.badgeClass}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>

                {/* Body Card: Detail Menu & Tagihan */}
                <div className="bg-muted/30 p-2.5 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span>
                      {ord.menuNama} ({ord.jumlahPorsi} porsi × {formatRupiah(ord.hargaSatuan)})
                    </span>
                    <span>{formatRupiah(ord.hargaSatuan * ord.jumlahPorsi)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Ongkos Kirim</span>
                    <span>{formatRupiah(ord.ongkir)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary pt-1 border-t border-border/40">
                    <span>Total Tagihan</span>
                    <span>{formatRupiah(ord.totalBayar)}</span>
                  </div>
                </div>

                {/* Alamat Pengiriman */}
                <p className="text-[11px] text-muted-foreground">
                  <b>Tujuan:</b> {ord.customerAlamat} ({ord.customerWa})
                </p>

                {/* State Machine Transition Actions (Strict Invariant 4.3 No 3 & Skema Bagian 5) */}
                {allowedTransitions.length > 0 && (
                  <div className="pt-1 flex items-center gap-2">
                    {(ord.status === 'menunggu_bayar' || ord.status === 'menunggu_konfirmasi') && (
                      <>
                        <button
                          onClick={() => handleTransition(ord.id, 'dibayar')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Konfirmasi Dibayar
                        </button>
                        <button
                          onClick={() => handleTransition(ord.id, 'dibatalkan')}
                          className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium hover:bg-rose-100 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Batalkan
                        </button>
                      </>
                    )}

                    {ord.status === 'dibayar' && (
                      <>
                        <button
                          onClick={() => handleTransition(ord.id, 'diproses')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 active:scale-95 transition-all"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          Mulai Diproses
                        </button>
                        <button
                          onClick={() => handleTransition(ord.id, 'dibatalkan')}
                          className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium hover:bg-rose-100 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Batalkan
                        </button>
                      </>
                    )}

                    {(ord.status === 'diproses' || ord.status === 'dikirim') && (
                      <button
                        onClick={() => handleTransition(ord.id, 'selesai')}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 active:scale-95 transition-all"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Pesanan Selesai (Diterima)
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Buat Pesanan Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-background w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-foreground">Buat Pesanan Katering Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="space-y-3">
              {/* Pilih Pelanggan */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Pilih Pelanggan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama} ({c.no_wa})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilih Menu */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Pilih Menu Katering <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedMenuId}
                  onChange={(e) => setSelectedMenuId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  required
                >
                  {menus.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.sisa_porsi === 0}>
                      {m.nama} - {formatRupiah(m.harga)} (Sisa: {m.sisa_porsi} porsi)
                      {m.sisa_porsi === 0 ? ' [HABIS]' : ''}
                    </option>
                  ))}
                </select>
                {targetMenu && targetMenu.sisa_porsi === 0 && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    Menu ini habis dan tidak dapat dipesan.
                  </p>
                )}
              </div>

              {/* Porsi & Ongkir Input */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Jumlah Porsi <span className="text-rose-500">* (&gt;= 1)</span>
                  </label>
                  <input
                    type="number"
                    value={jumlahPorsi}
                    onChange={(e) => setJumlahPorsi(e.target.value)}
                    placeholder="1"
                    min="1"
                    max={targetMenu?.sisa_porsi || 99}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    required
                  />
                  {targetMenu && (
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">
                      Maksimal: {targetMenu.sisa_porsi} porsi
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Ongkir (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={ongkir}
                    onChange={(e) => setOngkir(e.target.value)}
                    placeholder="10000"
                    min="0"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Catatan Khusus (Opsional)
                </label>
                <input
                  type="text"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Sambal dipisah, kirim jam 11 siang"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              {/* Live Preview Kalkulasi Tagihan */}
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 space-y-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal Menu:</span>
                  <span>
                    {targetMenu ? formatRupiah(targetMenu.harga * porsiNum) : 'Rp 0'}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Ongkos Kirim:</span>
                  <span>{formatRupiah(ongkirNum)}</span>
                </div>
                <div className="flex justify-between font-bold text-primary pt-1 border-t border-primary/20">
                  <span>Total Tagihan:</span>
                  <span className="text-sm">{formatRupiah(liveTotal)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !targetMenu || targetMenu.sisa_porsi === 0}
                  className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl shadow-xs hover:opacity-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : 'Simpan Pesanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
