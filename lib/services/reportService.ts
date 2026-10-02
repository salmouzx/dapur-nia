import { DailyReport } from '@/lib/types';
import { getOrders } from './orderService';

// Dokumen Skema Bagian 1: Laporan harian tidak memakai koleksi sendiri, dihitung dari koleksi pesanan
// PRD Bagian 4.4: Filter tanggal, hitung porsi terjual per menu & total omzet, pesanan dibatalkan tidak dihitung
export async function getDailyReport(tanggal: string): Promise<DailyReport> {
  const allOrders = await getOrders();

  // Filter pesanan berdasarkan tanggal (format YYYY-MM-DD)
  const ordersOnDate = allOrders.filter(
    (o) => o.tanggal === tanggal || o.tanggalPesanan === tanggal
  );

  // Invariant 4.4 No 2: Pesanan berstatus 'dibatalkan' TIDAK ikut dihitung omzet dan porsinya
  const activeOrders = ordersOnDate.filter((o) => o.status !== 'dibatalkan');
  const canceledOrders = ordersOnDate.filter((o) => o.status === 'dibatalkan');

  let totalOmzet = 0;
  let totalPorsiTerjual = 0;
  const menuAggregations: Record<string, { menuNama: string; porsi: number; subtotal: number }> = {};

  for (const order of activeOrders) {
    const totalBayar = Number(order.total ?? order.totalBayar ?? 0);
    const porsi = Number(order.jumlah_porsi ?? order.jumlahPorsi ?? 0);
    const harga = Number(order.harga_satuan ?? order.hargaSatuan ?? 0);
    const mId = order.menu_id || order.menuId || 'unknown';
    const mNama = order.nama_menu || order.menuNama || 'Menu';

    totalOmzet += totalBayar;
    totalPorsiTerjual += porsi;

    if (!menuAggregations[mId]) {
      menuAggregations[mId] = {
        menuNama: mNama,
        porsi: 0,
        subtotal: 0,
      };
    }
    menuAggregations[mId].porsi += porsi;
    menuAggregations[mId].subtotal += harga * porsi;
  }

  const porsiPerMenu = Object.entries(menuAggregations).map(([menuId, data]) => ({
    menuId,
    menuNama: data.menuNama,
    porsiTerjual: data.porsi,
    subtotal: data.subtotal,
  }));

  const totalPesananSelesai = ordersOnDate.filter((o) => o.status === 'selesai').length;

  return {
    tanggal,
    totalOmzet,
    totalPesananSelesai,
    totalPesananBatal: canceledOrders.length,
    totalPorsiTerjual,
    porsiPerMenu,
  };
}
