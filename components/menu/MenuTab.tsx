'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, Utensils, CheckCircle2, X } from 'lucide-react';
import { MenuItem } from '@/lib/types';
import { formatRupiah } from '@/lib/format';
import { createMenu, updateMenu, deleteMenu } from '@/lib/services/menuService';

import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';

interface MenuTabProps {
  menus: MenuItem[];
  onRefresh: () => void;
  isReadOnly?: boolean;
}

export function MenuTab({ menus, onRefresh, isReadOnly = false }: MenuTabProps) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState<string>('');
  const [sisaPorsi, setSisaPorsi] = useState<string>('');
  const [tersedia, setTersedia] = useState<boolean>(true);
  const [kategori, setKategori] = useState('Makanan Utama');
  const [deskripsi, setDeskripsi] = useState('');

  // Feedback State
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setNama('');
    setHarga('');
    setSisaPorsi('');
    setTersedia(true);
    setKategori('Makanan Utama');
    setDeskripsi('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setNama(item.nama);
    setHarga(item.harga.toString());
    setSisaPorsi(item.sisa_porsi.toString());
    setTersedia(item.tersedia !== undefined ? item.tersedia : true);
    setKategori(item.kategori || 'Makanan Utama');
    setDeskripsi(item.deskripsi || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validasi Skenario Uji Tembus PRD & Skema (1-60 karakter)
    if (!nama.trim()) {
      setFormError('Nama menu wajib diisi (1 sampai 60 karakter).');
      return;
    }
    if (nama.trim().length > 60) {
      setFormError('Nama menu terlalu panjang (maksimal 60 karakter sesuai skema).');
      return;
    }

    const numHarga = Number(harga);
    if (isNaN(numHarga) || harga.trim() === '') {
      setFormError('Harga harus berupa angka valid.');
      return;
    }
    if (numHarga < 0) {
      setFormError('Harga tidak boleh bernilai negatif (Minimal Rp 0).');
      return;
    }

    const numPorsi = Number(sisaPorsi);
    if (isNaN(numPorsi) || sisaPorsi.trim() === '') {
      setFormError('Sisa porsi harus berupa angka.');
      return;
    }
    if (numPorsi < 0) {
      setFormError('Sisa porsi tidak boleh bernilai negatif.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingItem) {
        await updateMenu(editingItem.id, {
          nama: nama.trim(),
          harga: Math.round(numHarga),
          sisa_porsi: Math.floor(numPorsi),
          tersedia,
          kategori,
          deskripsi: deskripsi.trim(),
        });
        setSuccessToast(`Menu "${nama}" berhasil diperbarui di Firestore!`);
      } else {
        await createMenu({
          nama: nama.trim(),
          harga: Math.round(numHarga),
          sisa_porsi: Math.floor(numPorsi),
          tersedia,
          kategori,
          deskripsi: deskripsi.trim(),
        });
        setSuccessToast(`Menu "${nama}" berhasil ditambahkan ke koleksi menu Firestore!`);
      }
      setIsModalOpen(false);
      onRefresh();
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan menu.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus menu "${name}"?`)) {
      try {
        await deleteMenu(id);
        setSuccessToast(`Menu "${name}" dihapus.`);
        onRefresh();
        setTimeout(() => setSuccessToast(null), 3000);
      } catch (err) {
        alert('Gagal menghapus menu: ' + err);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            {isReadOnly ? 'Daftar Menu' : 'Katalog Menu'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isReadOnly
              ? 'Menu katering harian segar dan higienis'
              : 'Kelola harga, stok porsi, & status ketersediaan'}
          </p>
        </div>

        {isReadOnly ? (
          user ? (
            <Link
              href="/kelola-menu"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 text-xs font-semibold rounded-xl shadow-2xs transition-all active:scale-95"
            >
              <span>Buka Kelola Menu</span>
            </Link>
          ) : null
        ) : (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Menu
          </button>
        )}
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Menu Cards List */}
      {menus.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed rounded-2xl bg-muted/20">
          <Utensils className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="font-semibold text-sm text-foreground">Belum ada menu tersedia</p>
          <p className="text-xs text-muted-foreground mt-1">
            {isReadOnly
              ? 'Belum ada menu harian yang dipublikasikan saat ini.'
              : 'Klik tombol "Tambah Menu" di atas untuk mendaftarkan menu harian katering.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {menus.map((item) => {
            const isHabis = item.sisa_porsi === 0;
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isHabis
                    ? 'bg-neutral-50/70 dark:bg-neutral-900/40 border-rose-200/80 dark:border-rose-950'
                    : 'bg-card border-border/80 shadow-xs hover:border-primary/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-semibold text-sm ${
                          isHabis || item.tersedia === false ? 'text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {item.nama}
                      </h3>
                      {item.tersedia === false ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                          Disembunyikan
                        </span>
                      ) : isHabis ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                          Habis
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                          Sisa {item.sisa_porsi} porsi
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-primary">
                        {formatRupiah(item.harga)}
                      </span>
                      {item.kategori && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                          {item.kategori}
                        </span>
                      )}
                    </div>

                    {item.deskripsi && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.deskripsi}
                      </p>
                    )}
                  </div>

                  {/* Tombol Aksi Edit & Hapus hanya tampil jika BUKAN mode ReadOnly (Kelola Menu) */}
                  {!isReadOnly && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(item)}
                        aria-label="Edit Menu"
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.nama)}
                        aria-label="Hapus Menu"
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Menu */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-background w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-border space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-foreground">
                {editingItem ? 'Ubah Data Menu' : 'Tambah Menu Baru'}
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
                  <span>Nama Menu <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] font-normal text-muted-foreground">{nama.length}/60</span>
                </label>
                <input
                  type="text"
                  value={nama}
                  maxLength={60}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Nasi Ayam Bakar"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Harga (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={harga}
                    onChange={(e) => setHarga(e.target.value)}
                    placeholder="25000"
                    min="0"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Sisa Porsi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={sisaPorsi}
                    onChange={(e) => setSisaPorsi(e.target.value)}
                    placeholder="10"
                    min="0"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Kategori
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                >
                  <option value="Makanan Utama">Makanan Utama</option>
                  <option value="Sayuran">Sayuran</option>
                  <option value="Lauk Pauk">Lauk Pauk</option>
                  <option value="Minuman & Pencuci Mulut">Minuman &amp; Pencuci Mulut</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Deskripsi / Komposisi (Opsional)
                </label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Keterangan lauk pendamping atau sambal..."
                  rows={2}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-input/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
                />
              </div>

              {/* Status Tersedia Checkbox sesuai Skema */}
              <div className="flex items-center gap-2 pt-1 pb-1">
                <input
                  type="checkbox"
                  id="tersedia-check"
                  checked={tersedia}
                  onChange={(e) => setTersedia(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-border focus:ring-primary/40 cursor-pointer"
                />
                <label htmlFor="tersedia-check" className="text-xs font-medium text-foreground cursor-pointer select-none">
                  Tersedia untuk dipesan (tampil di katalog menu)
                </label>
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
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
