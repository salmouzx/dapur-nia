import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function inspectPesanan() {
  const snap = await getDocs(collection(db, 'pesanan'));
  console.log(`Jumlah pesanan: ${snap.docs.length}`);
  snap.docs.forEach((d) => console.log(d.id, d.data().nama_menu, d.data().menu_id));
  process.exit(0);
}

inspectPesanan();
