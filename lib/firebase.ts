import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';

// Konfigurasi Firebase resmi project salma-bootcamp
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCzINKg-LssqsAPfHjSCvjjPtmTl1oeGlM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "salma-bootcamp.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "salma-bootcamp",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "salma-bootcamp.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "156260683707",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:156260683707:web:d605b298c8679121243e9e",
  measurementId: "G-E15X8XMZZX",
};

export const isFirebaseConfigured = true;

// Inisialisasi Firebase App, Firestore, & Auth
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);
const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

// Smart Health Cache agar tidak ada lag navigasi jika database di konsol belum di-klik 'Create'
let firestoreHealthy: boolean | null = null;
let lastHealthCheck = 0;

export function canAttemptFirestore(): boolean {
  if (firestoreHealthy === false && Date.now() - lastHealthCheck < 30000) {
    return false;
  }
  return true;
}

export function markFirestoreFailure() {
  firestoreHealthy = false;
  lastHealthCheck = Date.now();
}

export function markFirestoreSuccess() {
  firestoreHealthy = true;
  lastHealthCheck = Date.now();
}

export function getFirestoreHealthStatus(): 'online' | 'unreachable' {
  return firestoreHealthy === true ? 'online' : 'unreachable';
}

/**
 * Timeout helper agar koneksi Firestore tidak membekukan UI jika database (default) belum dibuat di konsol
 */
export async function withFirestoreTimeout<T>(
  promise: Promise<T>,
  ms: number = 2000
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Firestore connection timeout')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

export { app, db, auth, googleProvider };

