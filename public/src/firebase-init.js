// Import fungsi initializeApp dari CDN Firebase (Versi 9)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

// --- TEMPELKAN KODE KONFIGURASI ANDA DI BAWAH INI ---
// (Ganti bagian ini dengan yang Anda copy dari Firebase Console)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAuZmcXPbygC5wGEn-O0RMX_QU7DwfmDy8",
  authDomain: "cyberquest-461e2.firebaseapp.com",
  projectId: "cyberquest-461e2",
  storageBucket: "cyberquest-461e2.firebasestorage.app",
  messagingSenderId: "996958140482",
  appId: "1:996958140482:web:8475ebed15c0866f5f95db",
  measurementId: "G-F4VW8T731T"
};
// -----------------------------------------------------

// Initialize Firebase
const app = initializeApp(firebaseConfig);

console.log("🔥 Firebase initialized successfully!");

// PENTING: Export 'app' agar bisa dipakai di file lain (LeaderboardSystem)
export { app };