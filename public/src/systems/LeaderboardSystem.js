// Import library Firebase
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } 
from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js"; 
import { app } from "../firebase-init.js"; // Mengambil koneksi dari file yang baru kamu buat

// Inisialisasi Database
const db = getFirestore(app);

// Timeout configuration (5 seconds)
const TIMEOUT_MS = 5000;

export class LeaderboardSystem {
    
    /**
     * Helper: Create timeout promise
     */
    static createTimeoutPromise(ms, operation) {
        return Promise.race([
            operation,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Operation timeout')), ms)
            )
        ]);
    }

    /**
     * FUNGSI 1: Simpan Skor ke Database
     * dengan error handling dan validation
     */
    static async saveScore(playerName, totalScore) {
        try {
            // Validate inputs
            if (!playerName || playerName.trim().length === 0) {
                console.error("[LeaderboardSystem] Invalid player name");
                return false;
            }

            if (typeof totalScore !== 'number' || totalScore < 0) {
                console.error("[LeaderboardSystem] Invalid score value");
                return false;
            }

            // Check network availability
            if (!navigator.onLine) {
                console.warn("[LeaderboardSystem] No internet connection");
                return false;
            }

            // Simpan ke koleksi bernama 'leaderboard' dengan timeout
            const saveOperation = addDoc(collection(db, "leaderboard"), {
                name: playerName.trim(),
                score: Math.floor(totalScore), // Ensure integer
                date: new Date().toISOString(),
                timestamp: new Date().getTime()
            });

            await this.createTimeoutPromise(TIMEOUT_MS, saveOperation);
            
            console.log(`[LeaderboardSystem] Score saved successfully for ${playerName}: ${totalScore}`);
            return true;
        } catch (error) {
            console.error("[LeaderboardSystem] Error saving score:", error.message);
            
            // Specific error handling
            if (error.code === 'permission-denied') {
                console.error("[LeaderboardSystem] Permission denied - check Firebase rules");
            } else if (error.message === 'Operation timeout') {
                console.error("[LeaderboardSystem] Save operation timed out after 5 seconds");
            }
            
            return false;
        }
    }

    /**
     * FUNGSI 2: Ambil 10 Skor Tertinggi
     * dengan error handling dan timeout
     */
    static async getTopScores() {
        const topScores = [];
        try {
            // Check network availability
            if (!navigator.onLine) {
                console.warn("[LeaderboardSystem] No internet connection - cannot fetch scores");
                return [];
            }

            // Ambil data, urutkan skor dari besar ke kecil (desc), ambil 10 saja
            const q = query(
                collection(db, "leaderboard"), 
                orderBy("score", "desc"), 
                limit(10)
            );

            // Execute query dengan timeout
            const querySnapshot = await this.createTimeoutPromise(
                TIMEOUT_MS,
                getDocs(q)
            );

            querySnapshot.forEach((doc) => {
                try {
                    topScores.push({
                        ...doc.data(),
                        id: doc.id // Tambah document ID untuk reference
                    });
                } catch (docError) {
                    console.warn("[LeaderboardSystem] Error processing document:", docError);
                }
            });

            console.log(`[LeaderboardSystem] Successfully fetched ${topScores.length} top scores`);
            return topScores;
        } catch (error) {
            console.error("[LeaderboardSystem] Error getting leaderboard:", error.message);
            
            // Specific error handling
            if (error.message === 'Operation timeout') {
                console.error("[LeaderboardSystem] Fetch operation timed out after 5 seconds");
            } else if (error.code === 'permission-denied') {
                console.error("[LeaderboardSystem] Permission denied - check Firebase rules");
            }
            
            return []; // Return empty array on error
        }
    }

    /**
     * FUNGSI 3: Helper - Check if connected to internet & Firebase
     */
    static async isAvailable() {
        try {
            if (!navigator.onLine) {
                return false;
            }

            // Try to fetch a simple query to verify Firebase connection
            const q = query(collection(db, "leaderboard"), limit(1));
            await this.createTimeoutPromise(
                TIMEOUT_MS / 2,
                getDocs(q)
            );

            return true;
        } catch (error) {
            console.warn("[LeaderboardSystem] Firebase unavailable:", error.message);
            return false;
        }
    }
}