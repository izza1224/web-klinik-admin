import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ============================================================================
// 🔑 TEMPAT MENARUH KUNCI FIREBASE CONFIG LANGSUNG DI FILE CODE
// Salin nilai dari Firebase Console (Project Settings -> General -> Your apps) ke sini:
// ============================================================================
export const directFirebaseConfig = {
  apiKey: "AIzaSyAFxSLcabEJlox_G3Kn9PY_cyU137ryskA",
  authDomain: "web-klinik-homecare.firebaseapp.com",
  projectId: "web-klinik-homecare",
  storageBucket: "web-klinik-homecare.firebasestorage.app",
  messagingSenderId: "376931274534",
  appId: "1:376931274534:web:d39064e2a0b6638800fbe7",
};

// Fungsi untuk mendeteksi config dari direct config atau file environment (.env.local)
const getFirebaseConfig = () => {
  // 1. Prioritaskan jika directFirebaseConfig di file ini sudah diisi
  if (directFirebaseConfig.projectId && directFirebaseConfig.apiKey) {
    return directFirebaseConfig;
  }

  // 2. Gunakan Environment Variables (.env.local)
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  };
};

export const firebaseConfig = getFirebaseConfig();

// Inisialisasi Firebase App jika projectId sudah tersedia
const app =
  getApps().length > 0
    ? getApp()
    : firebaseConfig.projectId
    ? initializeApp(firebaseConfig)
    : null;

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export const isFirebaseReady = !!db;
