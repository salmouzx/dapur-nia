import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import {
  db,
  isFirebaseConfigured,
  withFirestoreTimeout,
  canAttemptFirestore,
  markFirestoreSuccess,
  markFirestoreFailure,
} from '@/lib/firebase';
import { OrderItem, OrderStatus, LEGAL_STATUS_TRANSITIONS } from '@/lib/types';
import { getMenus, updateMenu } from './menuService';

const STORAGE_KEY = 'dapur_nia_pesanan';

const todayStr = new Date().toISOString().split('T')[0];

// Contoh data awal sesuai Skema-Firestore-Dapur-Nia Bagian 5 (Contoh pesanan/Pq72nRt)
const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'Pq72nRt',
    pelanggan_id: '081234567890',
    nama_pelanggan: 'Budi Santoso',
    alamat_kirim: 'Jl. Melati No. 12, RT 03/RW 05',
    menu_id: 'Xa81kLm',
    nama_menu: 'Nasi Ayam Bakar',
    harga_satuan: 25000,
    jumlah_porsi: 2,
    ongkir: 5000,
    total: 55000,
    status: 'menunggu_bayar',
    bukti_bayar: '',
    tanggal: todayStr,
    // Aliases
    customerId: '081234567890',
    customerNama: 'Budi Santoso',
    customerWa: '081234567890',
    customerAlamat: 'Jl. Melati No. 12, RT 03/RW 05',
    menuId: 'Xa81kLm',
    menuNama: 'Nasi Ayam Bakar',
    hargaSatuan: 25000,
    jumlahPorsi: 2,
    totalBayar: 55000,
    tanggalPesanan: todayStr,
    createdAt: new Date().toISOString(),
  },
];

function getLocalOrders(): OrderItem[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_ORDERS;
  }
}

function saveLocalOrders(orders: OrderItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }
}

// Invariant Validation untuk Pesanan (Skema Bagian 6 Aturan 2 & 3)
// Aturan 2: jumlah_porsi minimal 1 dan tidak melebihi sisa_porsi menu
// Aturan 3: total selalu sama dengan harga_satuan × jumlah_porsi + ongkir
export function validateOrderInput(
  jumlahPorsi: number,
  sisaPorsiTersedia: number,
  hargaSatuan: number,
  ongkir: number
): { valid: boolean; error?: string; totalBayar?: number } {
  if (!jumlahPorsi || isNaN(jumlahPorsi) || jumlahPorsi < 1) {
    return { valid: false, error: 'Jumlah porsi pesanan minimal 1 porsi (tidak boleh nol atau negatif).' };
  }

  if (jumlahPorsi > sisaPorsiTersedia) {
    return {
      valid: false,
      error: `Porsi yang dipesan (${jumlahPorsi}) melebihi sisa porsi yang tersedia (${sisaPorsiTersedia}).`,
    };
  }

  const safeOngkir = isNaN(ongkir) || ongkir < 0 ? 0 : Math.round(ongkir);
  if (ongkir < 0) {
    return { valid: false, error: 'Ongkos kirim tidak boleh bernilai negatif.' };
  }

  const total = (hargaSatuan * jumlahPorsi) + safeOngkir;
  if (total <= 0) {
    return { valid: false, error: 'Total tagihan harus lebih besar dari Rp 0.' };
  }

  return { valid: true, totalBayar: total };
}

export async function getOrders(): Promise<OrderItem[]> {
  if (canAttemptFirestore() && db) {
    try {
      // Koleksi 'pesanan' sesuai Skema Firestore Dapur Nia (huruf kecil, tunggal)
      const q = query(collection(db, 'pesanan'));
      const snap = await withFirestoreTimeout(getDocs(q), 1500);
      markFirestoreSuccess();
      if (snap.docs.length > 0) {
        return snap.docs.map((d) => {
          const data = d.data();
          const pelangganId = data.pelanggan_id || data.customerId || '';
          const namaPelanggan = data.nama_pelanggan || data.customerNama || '';
          const alamatKirim = data.alamat_kirim || data.customerAlamat || '';
          const menuId = data.menu_id || data.menuId || '';
          const namaMenu = data.nama_menu || data.menuNama || '';
          const hargaSatuan = Number(data.harga_satuan ?? data.hargaSatuan ?? 0);
          const jumlahPorsi = Number(data.jumlah_porsi ?? data.jumlahPorsi ?? 1);
          const ongkir = Number(data.ongkir ?? 0);
          const total = Number(data.total ?? data.totalBayar ?? (hargaSatuan * jumlahPorsi + ongkir));
          const rawStatus = data.status || 'menunggu_bayar';
          const status: OrderStatus = rawStatus === 'menunggu_konfirmasi' ? 'menunggu_bayar' : rawStatus;
          const buktiBayar = data.bukti_bayar || '';
          const tanggal = data.tanggal || data.tanggalPesanan || todayStr;

          return {
            id: d.id,
            pelanggan_id: pelangganId,
            nama_pelanggan: namaPelanggan,
            alamat_kirim: alamatKirim,
            menu_id: menuId,
            nama_menu: namaMenu,
            harga_satuan: hargaSatuan,
            jumlah_porsi: jumlahPorsi,
            ongkir: ongkir,
            total: total,
            status: status,
            bukti_bayar: buktiBayar,
            tanggal: tanggal,
            dibuat_pada: data.dibuat_pada,
            // UI compatibility
            customerId: pelangganId,
            customerNama: namaPelanggan,
            customerWa: pelangganId,
            customerAlamat: alamatKirim,
            menuId: menuId,
            menuNama: namaMenu,
            hargaSatuan: hargaSatuan,
            jumlahPorsi: jumlahPorsi,
            totalBayar: total,
            tanggalPesanan: tanggal,
            createdAt: data.dibuat_pada?.toDate?.() ? data.dibuat_pada.toDate().toISOString() : undefined,
          };
        });
      }
    } catch (err) {
      markFirestoreFailure();
      console.warn('Firestore getOrders fallback to local storage:', err);
    }
  }
  return getLocalOrders();
}

export async function createOrder(params: {
  customerId: string;
  customerNama: string;
  customerWa: string;
  customerAlamat: string;
  menuId: string;
  jumlahPorsi: number;
  ongkir: number;
  buktiBayar?: string;
  catatan?: string;
  tanggalPesanan?: string;
}): Promise<OrderItem> {
  // 1. Ambil data menu terkini untuk verifikasi stok dan snapshot harga
  const menus = await getMenus();
  const targetMenu = menus.find((m) => m.id === params.menuId);

  if (!targetMenu) {
    throw new Error('Menu yang dipilih tidak ditemukan.');
  }

  // 2. Validasi invariant pesanan
  const validation = validateOrderInput(
    params.jumlahPorsi,
    targetMenu.sisa_porsi,
    targetMenu.harga,
    params.ongkir
  );

  if (!validation.valid || validation.totalBayar === undefined) {
    throw new Error(validation.error);
  }

  const tanggal = params.tanggalPesanan || new Date().toISOString().split('T')[0];
  const safeOngkir = Math.round(Number(params.ongkir) || 0);

  // Dokumen sesuai Skema Firestore Bagian 5
  const schemaPayload = {
    pelanggan_id: params.customerId, // ID dokumen pelanggan (nomor WhatsApp)
    nama_pelanggan: params.customerNama.trim(),
    alamat_kirim: params.customerAlamat.trim(),
    menu_id: targetMenu.id,
    nama_menu: targetMenu.nama,
    harga_satuan: targetMenu.harga, // Snapshot harga saat memesan
    jumlah_porsi: params.jumlahPorsi,
    ongkir: safeOngkir,
    total: validation.totalBayar, // harga_satuan * jumlah_porsi + ongkir
    status: 'menunggu_bayar' as OrderStatus,
    bukti_bayar: params.buktiBayar || '',
    tanggal: tanggal, // format YYYY-MM-DD
  };

  // 3. Potong stok menu
  const updatedSisaPorsi = targetMenu.sisa_porsi - params.jumlahPorsi;
  await updateMenu(targetMenu.id, { sisa_porsi: updatedSisaPorsi });

  // 4. Simpan pesanan ke Firestore pada koleksi 'pesanan' (ID otomatis)
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await withFirestoreTimeout(
        addDoc(collection(db, 'pesanan'), {
          ...schemaPayload,
          dibuat_pada: serverTimestamp(),
        }),
        3000
      );
      markFirestoreSuccess();

      return {
        id: docRef.id,
        ...schemaPayload,
        customerId: params.customerId,
        customerNama: params.customerNama,
        customerWa: params.customerWa,
        customerAlamat: params.customerAlamat,
        menuId: targetMenu.id,
        menuNama: targetMenu.nama,
        hargaSatuan: targetMenu.harga,
        jumlahPorsi: params.jumlahPorsi,
        totalBayar: validation.totalBayar,
        tanggalPesanan: tanggal,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      markFirestoreFailure();
      console.warn('Firestore createOrder fallback:', err);
    }
  }

  const localOrders = getLocalOrders();
  const created: OrderItem = {
    id: 'ord-' + Date.now(),
    ...schemaPayload,
    customerId: params.customerId,
    customerNama: params.customerNama,
    customerWa: params.customerWa,
    customerAlamat: params.customerAlamat,
    menuId: targetMenu.id,
    menuNama: targetMenu.nama,
    hargaSatuan: targetMenu.harga,
    jumlahPorsi: params.jumlahPorsi,
    totalBayar: validation.totalBayar,
    tanggalPesanan: tanggal,
    createdAt: new Date().toISOString(),
  };
  localOrders.unshift(created);
  saveLocalOrders(localOrders);
  return created;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<OrderItem> {
  const orders = await getOrders();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    throw new Error('Pesanan tidak ditemukan.');
  }

  // State Machine Validation (Invariant: Skema Bagian 5 & PRD 4.3 No 3)
  const allowedNextStatuses = LEGAL_STATUS_TRANSITIONS[order.status] || [];
  if (!allowedNextStatuses.includes(newStatus)) {
    throw new Error(
      `Perubahan status tidak sah: status "${order.status}" tidak boleh diubah ke "${newStatus}". Transisi sah berikutnya: ${allowedNextStatuses.join(', ') || 'tidak ada (status akhir)'}.`
    );
  }

  // Jika dibatalkan, kembalikan porsi ke stok menu
  if (newStatus === 'dibatalkan') {
    const menus = await getMenus();
    const menu = menus.find((m) => m.id === order.menu_id || m.id === order.menuId);
    if (menu) {
      await updateMenu(menu.id, { sisa_porsi: menu.sisa_porsi + order.jumlah_porsi });
    }
  }

  const updatedOrder = {
    ...order,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await withFirestoreTimeout(
        updateDoc(doc(db, 'pesanan', orderId), {
          status: newStatus,
        }),
        3000
      );
      markFirestoreSuccess();
      return updatedOrder;
    } catch (err) {
      markFirestoreFailure();
      console.warn('Firestore updateOrderStatus fallback:', err);
    }
  }

  const localList = getLocalOrders();
  const idx = localList.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    localList[idx] = updatedOrder;
    saveLocalOrders(localList);
  }
  return updatedOrder;
}
