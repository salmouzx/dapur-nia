import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';

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

const todayStr = new Date().toISOString().split('T')[0];

async function seed() {
  console.log("🚀 Memulai proses seeding data Firestore Dapur Nia...");

  // 1. Data Menu
  const menusData = [
    {
      nama: "Nasi Ayam Bakar",
      harga: 25000,
      sisa_porsi: 30,
      tersedia: true,
      deskripsi: "Nasi dengan ayam bakar bumbu rempah khas, lalapan segar & sambal terasi",
      kategori: "Makanan Utama",
    },
    {
      nama: "Rendang Sapi Padang",
      harga: 35000,
      sisa_porsi: 8,
      tersedia: true,
      deskripsi: "Daging sapi empuk dengan bumbu rempah kelapa sangrai autentik",
      kategori: "Makanan Utama",
    },
    {
      nama: "Sayur Asem Segar",
      harga: 10000,
      sisa_porsi: 0, // Nilai 0 ditampilkan sebagai Habis
      tersedia: true,
      deskripsi: "Sayur asem khas Sunda dengan jagung manis dan kacang tanah",
      kategori: "Sayuran",
    },
    {
      nama: "Ayam Goreng Lengkuas",
      harga: 24000,
      sisa_porsi: 15,
      tersedia: true,
      deskripsi: "Ayam goreng dengan taburan serundeng lengkuas gurih dan sambal bawang",
      kategori: "Makanan Utama",
    },
    {
      nama: "Tumis Kangkung Belacan",
      harga: 12000,
      sisa_porsi: 10,
      tersedia: true,
      deskripsi: "Kangkung segar dimasak dengan terasi udang dan irisan cabai",
      kategori: "Sayuran",
    },
  ];

  const createdMenuIds = {};
  for (const m of menusData) {
    const docRef = await addDoc(collection(db, "menu"), {
      ...m,
      dibuat_pada: serverTimestamp(),
    });
    createdMenuIds[m.nama] = docRef.id;
    console.log(`✅ Menu ditambahkan: ${m.nama} (ID: ${docRef.id})`);
  }

  // 2. Data Pelanggan (ID Dokumen = Nomor WhatsApp)
  const pelangganData = [
    {
      no_whatsapp: "081234567890",
      nama: "Budi Santoso",
      alamat: "Jl. Melati No. 12, RT 03/RW 05",
    },
    {
      no_whatsapp: "085678901234",
      nama: "Ibu Sarah Handayani",
      alamat: "Komplek Griya Indah Blok C2/09, Bintaro",
    },
    {
      no_whatsapp: "081398765432",
      nama: "Pak Hendra Gunawan",
      alamat: "Jl. Anggrek No. 8, Cilandak, Jakarta Selatan",
    },
  ];

  for (const p of pelangganData) {
    await setDoc(doc(db, "pelanggan", p.no_whatsapp), {
      nama: p.nama,
      no_whatsapp: p.no_whatsapp,
      alamat: p.alamat,
      dibuat_pada: serverTimestamp(),
    });
    console.log(`✅ Pelanggan ditambahkan: ${p.nama} (ID: ${p.no_whatsapp})`);
  }

  // 3. Data Pesanan (Koleksi 'pesanan', Auto-ID)
  const pesananData = [
    {
      pelanggan_id: "081234567890",
      nama_pelanggan: "Budi Santoso",
      alamat_kirim: "Jl. Melati No. 12, RT 03/RW 05",
      menu_id: createdMenuIds["Nasi Ayam Bakar"],
      nama_menu: "Nasi Ayam Bakar",
      harga_satuan: 25000,
      jumlah_porsi: 2,
      ongkir: 5000,
      total: 55000,
      status: "menunggu_bayar",
      bukti_bayar: "",
      tanggal: todayStr,
    },
    {
      pelanggan_id: "085678901234",
      nama_pelanggan: "Ibu Sarah Handayani",
      alamat_kirim: "Komplek Griya Indah Blok C2/09, Bintaro",
      menu_id: createdMenuIds["Rendang Sapi Padang"],
      nama_menu: "Rendang Sapi Padang",
      harga_satuan: 35000,
      jumlah_porsi: 3,
      ongkir: 10000,
      total: 115000,
      status: "selesai",
      bukti_bayar: "Transfer BCA an Sarah",
      tanggal: todayStr,
    },
    {
      pelanggan_id: "081398765432",
      nama_pelanggan: "Pak Hendra Gunawan",
      alamat_kirim: "Jl. Anggrek No. 8, Cilandak, Jakarta Selatan",
      menu_id: createdMenuIds["Ayam Goreng Lengkuas"],
      nama_menu: "Ayam Goreng Lengkuas",
      harga_satuan: 24000,
      jumlah_porsi: 2,
      ongkir: 8000,
      total: 56000,
      status: "dibayar",
      bukti_bayar: "QRIS Dapur Nia",
      tanggal: todayStr,
    },
    {
      pelanggan_id: "081234567890",
      nama_pelanggan: "Budi Santoso",
      alamat_kirim: "Jl. Melati No. 12, RT 03/RW 05",
      menu_id: createdMenuIds["Sayur Asem Segar"],
      nama_menu: "Sayur Asem Segar",
      harga_satuan: 10000,
      jumlah_porsi: 1,
      ongkir: 5000,
      total: 15000,
      status: "dibatalkan",
      bukti_bayar: "",
      tanggal: todayStr,
    },
  ];

  for (const ps of pesananData) {
    const docRef = await addDoc(collection(db, "pesanan"), {
      ...ps,
      dibuat_pada: serverTimestamp(),
    });
    console.log(`✅ Pesanan ditambahkan: ${ps.nama_menu} untuk ${ps.nama_pelanggan} (Status: ${ps.status})`);
  }

  console.log("🎉 Seeding Firestore berhasil selesai! Semua data kini telah masuk ke database.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Terjadi kesalahan saat seeding:", err);
  process.exit(1);
});
