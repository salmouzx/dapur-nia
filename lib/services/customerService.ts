import {
  collection,
  getDocs,
  getDoc,
  setDoc,
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
import { Customer } from '@/lib/types';

const STORAGE_KEY = 'dapur_nia_pelanggan';

// Data contoh sesuai Skema-Firestore-Dapur-Nia Bagian 4 (Contoh pelanggan/081234567890)
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: '081234567890',
    nama: 'Budi Santoso',
    no_whatsapp: '081234567890',
    no_wa: '081234567890',
    alamat: 'Jl. Melati No. 12, RT 03/RW 05',
    createdAt: new Date().toISOString(),
  },
  {
    id: '085678901234',
    nama: 'Ibu Sarah Handayani',
    no_whatsapp: '085678901234',
    no_wa: '085678901234',
    alamat: 'Komplek Griya Indah Blok C2/09, Bintaro',
    createdAt: new Date().toISOString(),
  },
];

function getLocalCustomers(): Customer[] {
  if (typeof window === 'undefined') return INITIAL_CUSTOMERS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_CUSTOMERS;
  }
}

function saveLocalCustomers(customers: Customer[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  }
}

// Invariant Validation untuk Pelanggan (Skema Bagian 4 & PRD 4.2)
// 1. nama: 1-60 karakter
// 2. no_whatsapp: Diawali 08, total 10 sampai 13 angka
// 3. alamat: 1-200 karakter
export function validateCustomerInput(nama: string, no_wa: string, alamat: string): { valid: boolean; error?: string } {
  if (!nama || nama.trim().length === 0) {
    return { valid: false, error: 'Nama pelanggan tidak boleh kosong (1 sampai 60 karakter).' };
  }
  if (nama.trim().length > 60) {
    return { valid: false, error: 'Nama pelanggan terlalu panjang (maksimal 60 karakter sesuai skema).' };
  }

  if (!no_wa || no_wa.trim().length === 0) {
    return { valid: false, error: 'Nomor WhatsApp tidak boleh kosong.' };
  }
  const cleanWa = no_wa.trim().replace(/[^0-9]/g, '');
  if (!cleanWa.startsWith('08') || cleanWa.length < 10 || cleanWa.length > 13) {
    return {
      valid: false,
      error: 'Nomor WhatsApp harus diawali 08 dan memiliki total 10 sampai 13 angka (contoh: 081234567890).',
    };
  }

  if (!alamat || alamat.trim().length === 0) {
    return { valid: false, error: 'Alamat pengiriman tidak boleh kosong (1 sampai 200 karakter).' };
  }
  if (alamat.trim().length > 200) {
    return { valid: false, error: 'Alamat pengiriman terlalu panjang (maksimal 200 karakter sesuai skema).' };
  }

  return { valid: true };
}

export async function getCustomers(): Promise<Customer[]> {
  if (canAttemptFirestore() && db) {
    try {
      // Koleksi 'pelanggan' sesuai Skema Firestore Dapur Nia (huruf kecil, tunggal)
      const q = query(collection(db, 'pelanggan'), orderBy('nama', 'asc'));
      const snap = await withFirestoreTimeout(getDocs(q), 1500);
      markFirestoreSuccess();
      if (snap.docs.length > 0) {
        return snap.docs.map((d) => {
          const data = d.data();
          const wa = data.no_whatsapp || d.id;
          return {
            id: d.id, // ID Dokumen = Nomor WhatsApp
            nama: data.nama || '',
            no_whatsapp: wa,
            no_wa: wa, // Alias untuk kompatibilitas
            alamat: data.alamat || '',
            dibuat_pada: data.dibuat_pada,
            createdAt: data.dibuat_pada?.toDate?.() ? data.dibuat_pada.toDate().toISOString() : undefined,
          };
        });
      }
    } catch (err) {
      markFirestoreFailure();
      console.warn('Firestore getCustomers fallback to local storage:', err);
    }
  }
  return getLocalCustomers();
}

export async function createCustomer(data: {
  nama: string;
  no_wa: string;
  alamat: string;
}): Promise<Customer> {
  const validation = validateCustomerInput(data.nama, data.no_wa, data.alamat);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const cleanWa = data.no_wa.trim().replace(/[^0-9]/g, '');

  // Sesuai Skema Bagian 4: ID Dokumen = Nomor WhatsApp (Keunikan terjamin secara alami)
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'pelanggan', cleanWa);
      const existingSnap = await withFirestoreTimeout(getDoc(docRef), 2500);
      if (existingSnap.exists()) {
        throw new Error('Nomor WhatsApp sudah digunakan oleh pelanggan lain.');
      }

      const cleanData = {
        nama: data.nama.trim(),
        no_whatsapp: cleanWa,
        alamat: data.alamat.trim(),
      };

      await withFirestoreTimeout(
        setDoc(docRef, {
          nama: cleanData.nama,
          no_whatsapp: cleanData.no_whatsapp,
          alamat: cleanData.alamat,
          dibuat_pada: serverTimestamp(),
        }),
        3000
      );
      markFirestoreSuccess();

      return {
        id: cleanWa,
        nama: cleanData.nama,
        no_whatsapp: cleanWa,
        no_wa: cleanWa,
        alamat: cleanData.alamat,
        createdAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      markFirestoreFailure();
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('sudah digunakan')) {
        throw err;
      }
      console.warn('Firestore customer add fallback:', err);
    }
  }

  // Local fallback uniqueness check
  const localList = getLocalCustomers();
  const duplicate = localList.find((c) => (c.no_whatsapp || c.no_wa) === cleanWa || c.id === cleanWa);
  if (duplicate) {
    throw new Error('Nomor WhatsApp sudah digunakan oleh pelanggan lain.');
  }

  const newCust: Customer = {
    id: cleanWa,
    nama: data.nama.trim(),
    no_whatsapp: cleanWa,
    no_wa: cleanWa,
    alamat: data.alamat.trim(),
    createdAt: new Date().toISOString(),
  };
  localList.unshift(newCust);
  saveLocalCustomers(localList);
  return newCust;
}

export async function updateCustomer(
  id: string,
  data: Partial<Omit<Customer, 'id'>>
): Promise<void> {
  if (data.nama !== undefined || data.alamat !== undefined) {
    const validation = validateCustomerInput(
      data.nama ?? 'Sample',
      data.no_whatsapp ?? data.no_wa ?? id,
      data.alamat ?? 'Alamat sample'
    );
    if (!validation.valid) {
      throw new Error(validation.error);
    }
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'pelanggan', id);
      const updatePayload: Record<string, unknown> = {};
      if (data.nama !== undefined) updatePayload.nama = data.nama.trim();
      if (data.alamat !== undefined) updatePayload.alamat = data.alamat.trim();

      await withFirestoreTimeout(
        updateDoc(docRef, updatePayload),
        3000
      );
      markFirestoreSuccess();
      return;
    } catch (err) {
      markFirestoreFailure();
      console.warn('Firestore customer update fallback:', err);
    }
  }

  const localList = getLocalCustomers();
  const index = localList.findIndex((c) => c.id === id);
  if (index !== -1) {
    localList[index] = {
      ...localList[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveLocalCustomers(localList);
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await withFirestoreTimeout(deleteDoc(doc(db, 'pelanggan', id)), 3000);
      markFirestoreSuccess();
      return;
    } catch (err) {
      markFirestoreFailure();
      console.warn('Firestore customer delete fallback:', err);
    }
  }

  const localList = getLocalCustomers();
  const filtered = localList.filter((c) => c.id !== id);
  saveLocalCustomers(filtered);
}
