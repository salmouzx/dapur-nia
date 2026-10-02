export type OrderStatus =
  | 'menunggu_bayar'
  | 'dibayar'
  | 'diproses'
  | 'selesai'
  | 'dibatalkan'
  | 'menunggu_konfirmasi'
  | 'dikirim';

export interface MenuItem {
  id: string;
  nama: string;
  harga: number;
  sisa_porsi: number;
  tersedia: boolean;
  dibuat_pada?: any;
  deskripsi?: string;
  kategori?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string; // ID dokumen di Firestore = nomor WhatsApp
  nama: string;
  no_whatsapp: string;
  no_wa: string; // Alias kemudahan & backward compatibility
  alamat: string;
  dibuat_pada?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string; // ID Dokumen Firestore (Otomatis)
  // Field Resmi Skema Firestore Dapur Nia Bagian 5
  pelanggan_id: string; // ID dokumen pelanggan (nomor WhatsApp)
  nama_pelanggan: string; // Salinan nama pelanggan saat memesan
  alamat_kirim: string; // Salinan alamat saat memesan
  menu_id: string; // ID dokumen menu yang dipesan
  nama_menu: string; // Salinan nama menu saat memesan
  harga_satuan: number; // Harga menu saat memesan
  jumlah_porsi: number; // Minimal 1 dan tidak melebihi sisa porsi menu
  ongkir: number; // Ongkos kirim, minimal 0
  total: number; // harga_satuan * jumlah_porsi + ongkir
  status: OrderStatus; // menunggu_bayar | dibayar | diproses | selesai | dibatalkan
  bukti_bayar: string; // Tautan gambar atau catatan transfer
  tanggal: string; // YYYY-MM-DD
  dibuat_pada?: any; // serverTimestamp()

  // Alias kompatibilitas UI
  customerId: string;
  customerNama: string;
  customerWa: string;
  customerAlamat: string;
  menuId: string;
  menuNama: string;
  hargaSatuan: number;
  jumlahPorsi: number;
  totalBayar: number;
  tanggalPesanan: string;
  catatan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyReport {
  tanggal: string;
  totalOmzet: number;
  totalPesananSelesai: number;
  totalPesananBatal: number;
  totalPorsiTerjual: number;
  porsiPerMenu: {
    menuId: string;
    menuNama: string;
    porsiTerjual: number;
    subtotal: number;
  }[];
}

// Invariant & Legal Status Transitions Mapping sesuai Skema Bagian 5
export const LEGAL_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  menunggu_bayar: ['dibayar', 'dibatalkan'],
  dibayar: ['diproses', 'dibatalkan'],
  diproses: ['selesai'],
  selesai: [],
  dibatalkan: [],
  // Legacy aliases
  menunggu_konfirmasi: ['diproses', 'dibatalkan'],
  dikirim: ['selesai'],
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; badgeClass: string }> = {
  menunggu_bayar: {
    label: 'Menunggu Bayar',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  },
  dibayar: {
    label: 'Sudah Dibayar',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  },
  diproses: {
    label: 'Sedang Diproses',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
  },
  selesai: {
    label: 'Selesai',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  },
  dibatalkan: {
    label: 'Dibatalkan',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  },
  // Legacy compatibility
  menunggu_konfirmasi: {
    label: 'Menunggu Bayar',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  },
  dikirim: {
    label: 'Dalam Pengiriman',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  },
};
