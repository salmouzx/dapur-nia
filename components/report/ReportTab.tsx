'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, DollarSign, ShoppingBag, XCircle, CheckCircle2, TrendingUp, Inbox } from 'lucide-react';
import { DailyReport } from '@/lib/types';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { getDailyReport } from '@/lib/services/reportService';

interface ReportTabProps {
  lastUpdated: number;
}

export function ReportTab({ lastUpdated }: ReportTabProps) {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [report, setReport] = useState<DailyReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadReport = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getDailyReport(selectedDate);
      setReport(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadReport();
  }, [loadReport, lastUpdated]);

  return (
    <div className="space-y-4">
      {/* Top Header & Date Picker */}
      <div>
        <h2 className="text-lg font-bold tracking-tight">Laporan Penjualan</h2>
        <p className="text-xs text-muted-foreground">Ringkasan harian omzet &amp; porsi terjual</p>
      </div>

      {/* Date Selector Box */}
      <div className="p-3 bg-card border border-border/80 rounded-2xl shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Pilih Tanggal:</span>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-xl border border-border bg-input/20 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Date Description */}
      <div className="text-xs font-medium text-muted-foreground px-1">
        Menampilkan data untuk: <span className="text-foreground font-bold">{formatTanggal(selectedDate)}</span>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-6 animate-pulse">
          <div className="h-20 bg-muted/60 rounded-2xl"></div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="h-16 bg-muted/60 rounded-2xl"></div>
            <div className="h-16 bg-muted/60 rounded-2xl"></div>
          </div>
        </div>
      ) : !report || (report.totalOmzet === 0 && report.totalPorsiTerjual === 0 && report.totalPesananBatal === 0) ? (
        /* Empty State (PRD AC 4.4 No 3) */
        <div className="text-center py-12 px-4 border border-dashed rounded-3xl bg-muted/20 space-y-2">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <p className="font-semibold text-sm text-foreground">Belum ada pesanan pada tanggal ini</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Tidak ada transaksi tercatat untuk {formatTanggal(selectedDate)}. Silakan pilih tanggal lain atau buat pesanan baru.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main Metric: Omzet */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-primary" />
                Total Uang Masuk (Omzet)
              </span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-black tracking-tight text-primary">
              {formatRupiah(report.totalOmzet)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              *Pesanan berstatus dibatalkan otomatis tidak dihitung.
            </p>
          </div>

          {/* Grid Stats: Porsi, Selesai, Batal */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-card border border-border/80 rounded-2xl text-center">
              <ShoppingBag className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <div className="text-base font-bold text-foreground">{report.totalPorsiTerjual}</div>
              <div className="text-[10px] text-muted-foreground">Porsi Terjual</div>
            </div>

            <div className="p-3 bg-card border border-border/80 rounded-2xl text-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-base font-bold text-emerald-700">{report.totalPesananSelesai}</div>
              <div className="text-[10px] text-muted-foreground">Pesanan Selesai</div>
            </div>

            <div className="p-3 bg-card border border-border/80 rounded-2xl text-center">
              <XCircle className="w-4 h-4 text-rose-500 mx-auto mb-1" />
              <div className="text-base font-bold text-rose-700">{report.totalPesananBatal}</div>
              <div className="text-[10px] text-muted-foreground">Dibatalkan</div>
            </div>
          </div>

          {/* Rincian Porsi Terjual per Menu (PRD AC 4.4 No 1) */}
          <div className="space-y-2 pt-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground px-1">
              Rincian Terjual per Menu
            </h3>

            {report.porsiPerMenu.length === 0 ? (
              <p className="text-xs text-muted-foreground italic px-1">
                Belum ada porsi terjual yang sah (selain pesanan batal).
              </p>
            ) : (
              <div className="space-y-2">
                {report.porsiPerMenu.map((m) => (
                  <div
                    key={m.menuId}
                    className="p-3 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-foreground">{m.menuNama}</div>
                      <div className="text-[11px] text-muted-foreground">{m.porsiTerjual} porsi terdistribusi</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{formatRupiah(m.subtotal)}</div>
                      <div className="text-[10px] text-muted-foreground">Subtotal</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
