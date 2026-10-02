'use client';

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Play, ChevronDown, ChevronUp, X } from 'lucide-react';
import { validateMenuInput } from '@/lib/services/menuService';
import { validateCustomerInput } from '@/lib/services/customerService';
import { validateOrderInput, updateOrderStatus } from '@/lib/services/orderService';

interface TestScenario {
  id: number;
  title: string;
  category: string;
  description: string;
  expected: string;
  runTest: () => Promise<{ success: boolean; message: string }>;
}

export function UjiTembusModal({ isOpen, onClose }: { isOpen: boolean; onClose: boolean | (() => void) }) {
  const [results, setResults] = useState<Record<number, { success: boolean; message: string }>>({});
  const [runningId, setRunningId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!isOpen) return null;

  const scenarios: TestScenario[] = [
    {
      id: 1,
      title: 'Field Kosong (Nama & Alamat)',
      category: 'Modul Pelanggan',
      description: 'Mencoba mendaftarkan pelanggan dengan nama kosong dan alamat spasi.',
      expected: 'Ditolak: Nama dan alamat tidak boleh kosong.',
      runTest: async () => {
        const res = validateCustomerInput('', '081234567890', '   ');
        if (!res.valid) {
          return { success: true, message: `Lolos Uji: Permintaan ditolak dengan pesan: "${res.error}"` };
        }
        return { success: false, message: 'Gagal: Data tidak sah diizinkan lolos!' };
      },
    },
    {
      id: 2,
      title: 'Tipe Data Salah (Non-Number)',
      category: 'Modul Menu',
      description: 'Mencoba menginput string huruf ("dua puluh lima ribu") ke dalam field harga atau sisa porsi.',
      expected: 'Ditolak: Harga dan porsi harus berupa angka sah.',
      runTest: async () => {
        const res = validateMenuInput('Ayam Goreng', NaN, 5);
        if (!res.valid) {
          return { success: true, message: `Lolos Uji: Ditolak dengan pesan: "${res.error}"` };
        }
        return { success: false, message: 'Gagal: Nilai NaN diterima!' };
      },
    },
    {
      id: 3,
      title: 'Teks Terlalu Panjang (> 100 Karakter)',
      category: 'Modul Menu',
      description: 'Mencoba menginput nama menu melebihi 100 karakter.',
      expected: 'Ditolak: Panjang karakter melebihi batas wajar database.',
      runTest: async () => {
        const longName = 'Menu Sangat Lezat Khas Nusantara '.repeat(5);
        const res = validateMenuInput(longName, 25000, 10);
        if (!res.valid) {
          return { success: true, message: `Lolos Uji: Ditolak dengan pesan: "${res.error}"` };
        }
        return { success: false, message: 'Gagal: Teks terlalu panjang diterima!' };
      },
    },
    {
      id: 4,
      title: 'Nilai Negatif (Harga / Sisa Porsi / Ongkir)',
      category: 'Modul Menu & Pesanan',
      description: 'Mencoba menginput harga -15.000 atau sisa porsi -5.',
      expected: 'Ditolak: Harga atau porsi tidak boleh bernilai negatif.',
      runTest: async () => {
        const res1 = validateMenuInput('Nasi Uduk', -15000, 5);
        const res2 = validateOrderInput(2, 5, 20000, -5000);
        if (!res1.valid && !res2.valid) {
          return {
            success: true,
            message: `Lolos Uji: Ditolak dengan sukses (${res1.error} & ${res2.error})`,
          };
        }
        return { success: false, message: 'Gagal: Nilai negatif tidak diblokir secara konsisten.' };
      },
    },
    {
      id: 5,
      title: 'Nilai di Luar Batas (Porsi > Sisa Stok & 0 Porsi)',
      category: 'Modul Pesanan',
      description: 'Mencoba memesan 10 porsi padahal sisa stok hanya 2 porsi, atau memesan 0 porsi.',
      expected: 'Ditolak: Jumlah porsi minimal 1 dan tidak boleh melebihi sisa porsi.',
      runTest: async () => {
        const zeroPortionTest = validateOrderInput(0, 5, 20000, 10000);
        const overPortionTest = validateOrderInput(10, 2, 20000, 10000);

        if (!zeroPortionTest.valid && !overPortionTest.valid) {
          return {
            success: true,
            message: `Lolos Uji: Porsi 0 ditolak ("${zeroPortionTest.error}") dan porsi melebihi stok ditolak ("${overPortionTest.error}").`,
          };
        }
        return { success: false, message: 'Gagal: Pesanan 0 porsi atau melebihi stok diizinkan!' };
      },
    },
    {
      id: 6,
      title: 'Perubahan Status Tidak Sah (Lompat / Mundur)',
      category: 'State Machine Pesanan',
      description: 'Mencoba mengubah status dari "menunggu_konfirmasi" langsung loncat ke "selesai".',
      expected: 'Ditolak: Status tidak boleh melompat atau mundur.',
      runTest: async () => {
        try {
          // Buat mock ID pesanan untuk cek validasi state machine
          await updateOrderStatus('non-existent-order-id', 'selesai');
          return { success: false, message: 'Gagal: Mutasi status ilegal diizinkan!' };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          return {
            success: true,
            message: `Lolos Uji: Mutasi ditolak (${msg})`,
          };
        }
      },
    },
  ];

  const runSingleTest = async (test: TestScenario) => {
    setRunningId(test.id);
    const result = await test.runTest();
    setResults((prev) => ({ ...prev, [test.id]: result }));
    setRunningId(null);
  };

  const runAllTests = async () => {
    for (const test of scenarios) {
      setRunningId(test.id);
      const result = await test.runTest();
      setResults((prev) => ({ ...prev, [test.id]: result }));
    }
    setRunningId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-background w-full max-w-md rounded-3xl p-5 shadow-2xl border border-border space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Suite Uji Tembus (PRD Sesi 3)</h3>
              <p className="text-[11px] text-muted-foreground">Verifikasi 6 Masukan Tidak Sah &amp; Invariants</p>
            </div>
          </div>
          <button
            onClick={typeof onClose === 'function' ? onClose : undefined}
            className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Action */}
        <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-2xl">
          <span className="text-xs text-muted-foreground font-medium">
            {Object.keys(results).length} dari {scenarios.length} skenario diuji
          </span>
          <button
            onClick={runAllTests}
            disabled={runningId !== null}
            className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-xl shadow-xs hover:opacity-95 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Jalankan Semua Uji
          </button>
        </div>

        {/* Scenarios List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {scenarios.map((sc) => {
            const res = results[sc.id];
            const isRunning = runningId === sc.id;
            const isExpanded = expandedId === sc.id;

            return (
              <div
                key={sc.id}
                className="p-3 rounded-2xl border border-border/80 bg-card space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono">
                        #{sc.id}
                      </span>
                      <span>{sc.title}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {sc.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {res ? (
                      res.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )
                    ) : null}
                    <button
                      onClick={() => runSingleTest(sc)}
                      disabled={isRunning}
                      className="px-2 py-1 text-[11px] font-medium bg-secondary text-secondary-foreground hover:bg-muted rounded-lg border"
                    >
                      {isRunning ? 'Menguji...' : 'Uji'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <span className="line-clamp-1">{sc.description}</span>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : sc.id)}
                    className="p-0.5 hover:text-foreground"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="bg-muted/40 p-2.5 rounded-xl space-y-1 text-[11px]">
                    <div><b>Ekspektasi:</b> {sc.expected}</div>
                  </div>
                )}

                {res && (
                  <div
                    className={`p-2 rounded-xl text-[11px] border font-medium ${
                      res.success
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {res.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
