import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCzINKg-LssqsAPfHjSCvjjPtmTl1oeGlM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "salma-bootcamp.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "salma-bootcamp",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "salma-bootcamp.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "156260683707",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:156260683707:web:d605b298c8679121243e9e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
  console.log("🚀 Memulai pemindahan data dari koleksi 'menus' ke 'menu'...");

  // 1. Ambil semua dokumen dari 'menus'
  const snapMenus = await getDocs(collection(db, 'menus'));
  console.log(`Ditemukan ${snapMenus.docs.length} dokumen di 'menus':`);

  // 2. Ambil data 'menu' saat ini untuk cek duplikasi nama
  const snapMenu = await getDocs(collection(db, 'menu'));
  const existingMenuNames = new Set(snapMenu.docs.map(d => d.data().nama?.trim()?.toLowerCase()));

  for (const docSnap of snapMenus.docs) {
    const data = docSnap.data();
    const namaMenu = data.nama?.trim();

    // Jika belum ada di koleksi 'menu', masukkan ke koleksi 'menu'
    if (!existingMenuNames.has(namaMenu?.toLowerCase())) {
      const newDoc = await addDoc(collection(db, 'menu'), {
        nama: namaMenu,
        harga: Number(data.harga || 0),
        sisa_porsi: Number(data.sisa_porsi || 0),
        tersedia: data.tersedia !== undefined ? Boolean(data.tersedia) : true,
        deskripsi: data.deskripsi || '',
        kategori: data.kategori || 'Makanan Utama',
        dibuat_pada: data.createdAt || serverTimestamp(),
      });
      console.log(`✅ Dipindahkan ke 'menu': ${namaMenu} (ID Baru: ${newDoc.id})`);
      existingMenuNames.add(namaMenu?.toLowerCase());
    } else {
      console.log(`ℹ️ Menu "${namaMenu}" sudah ada di koleksi 'menu', dilewati agar tidak duplikat.`);
    }

    // 3. Hapus dokumen lama di 'menus'
    await deleteDoc(doc(db, 'menus', docSnap.id));
    console.log(`🗑️ Dihapus dari 'menus': ${docSnap.id} (${namaMenu})`);
  }

  console.log("\n🧹 Koleksi 'menus' sekarang telah kosong dan otomatis terhapus dari Firebase Console.");

  // Tampilkan isi akhir koleksi 'menu'
  const finalMenuSnap = await getDocs(collection(db, 'menu'));
  console.log(`\n📋 Total dokumen di koleksi resmi 'menu' sekarang: ${finalMenuSnap.docs.length}`);
  finalMenuSnap.docs.forEach((d) => {
    const dData = d.data();
    console.log(` - [${d.id}] ${dData.nama} (Rp ${dData.harga}, Sisa: ${dData.sisa_porsi})`);
  });

  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Terjadi kesalahan saat migrasi:", err);
  process.exit(1);
});
