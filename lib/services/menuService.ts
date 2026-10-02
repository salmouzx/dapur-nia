import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  db,
  isFirebaseConfigured,
  withFirestoreTimeout,
  canAttemptFirestore,
  markFirestoreSuccess,
  markFirestoreFailure,
} from '@/lib/firebase';
import { MenuItem } from '@/lib/types';

const STORAGE_KEY = 'dapur_nia_menus';

// Initial sample data following Skema-Firestore-Dapur-Nia
const INITIAL_MENUS: MenuItem[] = [
  {
    id: 'Xa81kLm',
    nama: 'Nasi Ayam Bakar',
    harga: 25000,
    sisa_porsi: 30,
    tersedia: true,
    deskripsi: 'Nasi dengan ayam bakar bumbu rempah khas, lalapan segar & sambal terasi',
    kategori: 'Makanan Utama',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'menu-2',
    nama: 'Rendang Sapi Padang',
    harga: 35000,
    sisa_porsi: 8,
    tersedia: true,
    deskripsi: 'Daging sapi empuk dengan bumbu rempah kelapa sangrai autentik',
    kategori: 'Makanan Utama',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'menu-3',
    nama: 'Sayur Asem Segar',
    harga: 10000,
    sisa_porsi: 0, // Nilai 0 ditampilkan sebagai Habis
    tersedia: true,
    deskripsi: 'Sayur asem khas Sunda dengan jagung manis dan kacang tanah',
    kategori: 'Sayuran',
    createdAt: new Date().toISOString(),
  },
];

function getLocalMenus(): MenuItem[] {
  if (typeof window === 'undefined') return INITIAL_MENUS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MENUS));
      return INITIAL_MENUS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_MENUS;
  }
}

function saveLocalMenus(menus: MenuItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
  }
}

// Invariant Validation for Menu (Skema Section 3 & 6: 1-60 karakter, harga >= 0, sisa_porsi >= 0)
export function validateMenuInput(nama: string, harga: number, sisa_porsi: number): { valid: boolean; error?: string } {
  if (!nama || nama.trim().length === 0) {
    return { valid: false, error: 'Nama menu tidak boleh kosong (1 sampai 60 karakter).' };
  }
  if (nama.trim().length > 60) {
    return { valid: false, error: 'Nama menu terlalu panjang (maksimal 60 karakter sesuai skema).' };
  }
  if (isNaN(harga) || harga < 0) {
    return { valid: false, error: 'Harga tidak boleh bernilai negatif.' };
  }
  if (isNaN(sisa_porsi) || sisa_porsi < 0) {
    return { valid: false, error: 'Sisa porsi tidak boleh bernilai negatif.' };
  }
  return { valid: true };
}

export async function getMenus(): Promise<MenuItem[]> {
  if (canAttemptFirestore() && db) {
    try {
      // Koleksi 'menu' sesuai Skema Firestore Dapur Nia (huruf kecil, tunggal)
      const q = query(collection(db, 'menu'), orderBy('nama', 'asc'));
      const snap = await withFirestoreTimeout(getDocs(q), 1500);
      markFirestoreSuccess();
      if (snap.docs.length > 0) {
        return snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            nama: data.nama || '',
            harga: Number(data.harga || 0),
            sisa_porsi: Number(data.sisa_porsi || 0),
            tersedia: data.tersedia !== undefined ? Boolean(data.tersedia) : true,
            dibuat_pada: data.dibuat_pada,
            deskripsi: data.deskripsi || '',
            kategori: data.kategori || 'Makanan Utama',
            createdAt: data.dibuat_pada?.toDate?.() ? data.dibuat_pada.toDate().toISOString() : undefined,
          };
        });
      }
    } catch (err) {
      markFirestoreFailure();
      console.warn('Firestore fetch failed/timeout, falling back to local storage:', err);
    }
  }
  return getLocalMenus();
}

export async function createMenu(data: {
  nama: string;
  harga: number;
  sisa_porsi: number;
  tersedia?: boolean;
  deskripsi?: string;
  kategori?: string;
}): Promise<MenuItem> {
  const validation = validateMenuInput(data.nama, data.harga, data.sisa_porsi);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const cleanData: Omit<MenuItem, 'id'> = {
    nama: data.nama.trim(),
    harga: Math.round(Number(data.harga)),
    sisa_porsi: Math.floor(Number(data.sisa_porsi)),
    tersedia: data.tersedia !== undefined ? Boolean(data.tersedia) : true,
    deskripsi: data.deskripsi?.trim() || '',
    kategori: data.kategori?.trim() || 'Makanan Utama',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      // Menyimpan dokumen ke koleksi 'menu' sesuai skema
      const docRef = await withFirestoreTimeout(
        addDoc(collection(db, 'menu'), {
          nama: cleanData.nama,
          harga: cleanData.harga,
          sisa_porsi: cleanData.sisa_porsi,
          tersedia: cleanData.tersedia,
          dibuat_pada: serverTimestamp(),
          deskripsi: cleanData.deskripsi,
          kategori: cleanData.kategori,
        }),
        3000
      );
      markFirestoreSuccess();
      return { id: docRef.id, ...cleanData };
    } catch (err) {
      markFirestoreFailure();
      console.warn('Firestore write failed, falling back to local storage:', err);
    }
  }

  const localList = getLocalMenus();
  const newItem: MenuItem = {
    id: 'menu-' + Date.now(),
    ...cleanData,
  };
  localList.unshift(newItem);
  saveLocalMenus(localList);
  return newItem;
}

export async function updateMenu(
  id: string,
  data: Partial<Omit<MenuItem, 'id'>>
): Promise<void> {
  if (data.nama !== undefined || data.harga !== undefined || data.sisa_porsi !== undefined) {
    const validation = validateMenuInput(
      data.nama ?? 'Sample',
      data.harga ?? 0,
      data.sisa_porsi ?? 0
    );
    if (!validation.valid) {
      throw new Error(validation.error);
    }
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'menu', id);
      const updatePayload: Record<string, unknown> = {};
      if (data.nama !== undefined) updatePayload.nama = data.nama.trim();
      if (data.harga !== undefined) updatePayload.harga = Math.round(Number(data.harga));
      if (data.sisa_porsi !== undefined) updatePayload.sisa_porsi = Math.floor(Number(data.sisa_porsi));
      if (data.tersedia !== undefined) updatePayload.tersedia = Boolean(data.tersedia);
      if (data.deskripsi !== undefined) updatePayload.deskripsi = data.deskripsi;
      if (data.kategori !== undefined) updatePayload.kategori = data.kategori;

      await withFirestoreTimeout(
        updateDoc(docRef, updatePayload),
        3000
      );
      markFirestoreSuccess();
      return;
    } catch (err) {
      markFirestoreFailure();
      console.warn('Firestore update failed, falling back to local storage:', err);
    }
  }

  const localList = getLocalMenus();
  const index = localList.findIndex((m) => m.id === id);
  if (index !== -1) {
    localList[index] = {
      ...localList[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveLocalMenus(localList);
  }
}

export async function deleteMenu(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await withFirestoreTimeout(deleteDoc(doc(db, 'menu', id)), 3000);
      markFirestoreSuccess();
      return;
    } catch (err) {
      markFirestoreFailure();
      console.warn('Firestore delete failed, falling back to local storage:', err);
    }
  }

  const localList = getLocalMenus();
  const filtered = localList.filter((m) => m.id !== id);
  saveLocalMenus(filtered);
}
