'use client';

import React, { useState } from 'react';
import { UserPlus, MessageCircle, MapPin, Edit2, Trash2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Customer } from '@/lib/types';
import { createCustomer, updateCustomer, deleteCustomer } from '@/lib/services/customerService';

interface CustomerTabProps {
  customers: Customer[];
  onRefresh: () => void;
}

export function CustomerTab({ customers, onRefresh }: CustomerTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Customer | null>(null);

  // Form State
  const [nama, setNama] = useState('');
  const [noWa, setNoWa] = useState('');
  const [alamat, setAlamat] = useState('');

  // Feedback State
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setNama('');
    setNoWa('');
    setAlamat('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Customer) => {
    setEditingItem(item);
    setNama(item.nama);
    setNoWa(item.no_whatsapp || item.no_wa);
    setAlamat(item.alamat);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validasi Skenario Uji Tembus PRD 4.2 & Skema Bagian 4
    if (!nama.trim()) {
      setFormError('Nama pelanggan tidak boleh kosong (1 sampai 60 karakter).');
      return;
    }
    if (nama.trim().length > 60) {
      setFormError('Nama pelanggan terlalu panjang (maksimal 60 karakter sesuai skema).');
      return;
    }

    const cleanWa = noWa.trim().replace(/[^0-9]/g, '');
    if (!cleanWa) {
      setFormError('Nomor WhatsApp tidak boleh kosong.');
      return;
    }
    if (!cleanWa.startsWith('08') || cleanWa.length < 10 || cleanWa.length > 13) {
      setFormError('Nomor WhatsApp harus diawali 08 dan memiliki total 10 sampai 13 angka (contoh: 081234567890).');
      return;
    }

    if (!alamat.trim()) {
      setFormError('Alamat pengiriman tidak boleh kosong (1 sampai 200 karakter).');
      return;
    }
    if (alamat.trim().length > 200) {
      setFormError('Alamat pengiriman terlalu panjang (maksimal 200 karakter sesuai skema).');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingItem) {
        await updateCustomer(editingItem.id, {
          nama: nama.trim(),
          alamat: alamat.trim(),
        });
        setSuccessToast(`Data pelanggan "${nama}" berhasil diperbarui di Firestore!`);
      } else {
        await createCustomer({
          nama: nama.trim(),
          no_wa: cleanWa,
          alamat: alamat.trim(),
        });
        setSuccessToast(`Pelanggan "${nama}" berhasil disimpan ke koleksi pelanggan Firestore!`);
      }
      setIsModalOpen(false);
      onRefresh();
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan data pelanggan.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Hapus pelanggan "${name}"?`)) {
      try {
        await deleteCustomer(id);
        setSuccessToast(`Pelanggan "${name}" dihapus.`);
        onRefresh();
        setTimeout(() => setSuccessToast(null), 3000);
      } catch (err) {
        alert('Gagal menghapus: ' + err);
      }
    }
  };

  const getWaLink = (phone: string) => {
    const clean = phone.replace(/^0/, '62').replace(/[^0-9]/g, '');
    return `https://wa.me/${clean}`;
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Daftar Pelanggan</h2>
          <p className="text-xs text-muted-foreground">Kelola kontak WhatsApp & alamat pengiriman</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl shadow-sm hover:opacity-95 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Pelanggan Baru
        </button>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Customer List Cards */}
      {customers.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed rounded-2xl bg-muted/20">
          <p className="font-semibold text-sm text-foreground">Belum ada data pelanggan</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tambahkan kontak pelanggan agar pesanan katering memiliki tujuan kirim yang jelas.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {customers.map((cust) => (
            <div
              key={cust.id}
              className="p-3.5 rounded-2xl border border-border/80 bg-card shadow-xs hover:border-primary/40 transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{cust.nama}</h3>
                  <a
                    href={getWaLink(cust.no_wa)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 mt-0.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{cust.no_wa}</span>
                  </a>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(cust)}
                    aria-label="Edit Pelanggan"
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cust.id, cust.nama)}
                    aria-label="Hapus Pelanggan"
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/30 p-2 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="line-clamp-2">{cust.alamat}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit Pelanggan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-background w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-border space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-foreground">
                {editingItem ? 'Ubah Data Pelanggan' : 'Daftarkan Pelanggan Baru'}
              </h3>
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

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1 flex items-center justify-between">
                  <span>Nama Lengkap <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] font-normal text-muted-foreground">{nama.length}/60</span>
                </label>
                <input
                  type="text"
                  value={nama}
                  maxLength={60}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1 flex items-center justify-between">
                  <span>Nomor WhatsApp <span className="text-rose-500">* (ID Dokumen)</span></span>
                  <span className="text-[10px] font-normal text-muted-foreground">{noWa.length}/13</span>
                </label>
                <input
                  type="tel"
                  value={noWa}
                  maxLength={13}
                  disabled={!!editingItem}
                  onChange={(e) => setNoWa(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className={`w-full text-xs px-3 py-2 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ${
                    editingItem ? 'opacity-60 cursor-not-allowed bg-muted/40' : ''
                  }`}
                  required
                />
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  {editingItem
                    ? 'Nomor WhatsApp merupakan ID dokumen unik dan tidak dapat diubah.'
                    : 'Diawali 08, total 10 sampai 13 angka (sebagai ID unik dokumen pelanggan).'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1 flex items-center justify-between">
                  <span>Alamat Pengiriman <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] font-normal text-muted-foreground">{alamat.length}/200</span>
                </label>
                <textarea
                  value={alamat}
                  maxLength={200}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                  rows={3}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
                  required
                />
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
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl shadow-xs hover:opacity-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pelanggan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
