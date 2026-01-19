// Import library Firebase
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } 
from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js"; 
import { app } from "../firebase-init.js"; // Mengambil koneksi dari file yang baru kamu buat

// Inisialisasi Database
const db = getFirestore(app);

export class LeaderboardSystem {
    
    // FUNGSI 1: Simpan Skor ke Database
    static async saveScore(playerName, totalScore) {
        try {
            // Simpan ke koleksi bernama 'leaderboard'
            await addDoc(collection(db, "leaderboard"), {
                name: playerName,
                score: totalScore,
                date: new Date().toISOString()
            });
            return true; // Berhasil
        } catch (e) {
            console.error("Error saving score: ", e);
            return false; // Gagal
        }
    }

    // FUNGSI 2: Ambil 10 Skor Tertinggi
    static async getTopScores() {
        const topScores = [];
        // Ambil data, urutkan skor dari besar ke kecil (desc), ambil 10 saja
        const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(10));

        try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                topScores.push(doc.data());
            });
            return topScores;
        } catch (e) {
            console.error("Error getting leaderboard: ", e);
            return [];
        }
    }
}