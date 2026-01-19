export const GameState = {
  // --- 1. DATA PEMAIN ---
  player: {
    name: "Cyber Hero",
    avatar: "hero_male",
  },

  // Total Skor Akumulatif
  scores: {
    digitalLiteracy: 0,
    creativeThinking: 0,
    problemSolving: 0,
  },

  // --- 2. CONFIG LEVEL (SINGLE SOURCE OF TRUTH) ---
  // Status unlocked/completed disimpan langsung di sini
  levels: [
    {
      id: 1,
      key: "Level1",
      title: "Detektif Hoaks",
      unlocked: true, // Level 1 selalu terbuka
      completed: false,
      stars: 0,
    },
    {
      id: 2,
      key: "Level2",
      title: "Benteng Sandi",
      unlocked: false, // Default terkunci
      completed: false,
      stars: 0,
    },
    {
      id: 3,
      key: "Level3",
      title: "Jejak Digital",
      unlocked: false,
      completed: false,
      stars: 0,
    },
    {
      id: 4,
      key: "Level4",
      title: "Kampanye Positif",
      unlocked: false,
      completed: false,
      stars: 0,
    },
  ],

  // --- 3. HELPER METHODS ---

  /**
   * Cek apakah level terbuka
   */
  isLevelUnlocked(levelId) {
    const level = this.levels.find((l) => l.id === levelId);
    return level ? level.unlocked : false;
  },

  /**
   * Reset semua progress (Hanya dipanggil saat tombol KELUAR ditekan)
   */
  resetSession() {
    this.scores = {
      digitalLiteracy: 0,
      creativeThinking: 0,
      problemSolving: 0,
    };
    // Reset status level
    this.levels.forEach((l) => {
      l.unlocked = l.id === 1; // Hanya level 1 terbuka kembali
      l.completed = false;
      l.stars = 0;
    });
    console.log("[GameState] Session FULL RESET.");
  },

  /**
   * Menambah Skor
   */
  addScore(category, points) {
    if (this.scores.hasOwnProperty(category)) {
      this.scores[category] += points;
      return true;
    }
    return false;
  },

  getTotalScore() {
    return Object.values(this.scores).reduce((sum, val) => sum + val, 0);
  },

  /**
   * LOGIKA INTI: Level Selesai -> Buka Level Selanjutnya
   */
  completeLevel(levelId, starsEarned = 3) {
    const level = this.levels.find((l) => l.id === levelId);

    if (level) {
      // 1. Tandai Selesai
      level.completed = true;
      if (starsEarned > level.stars) level.stars = starsEarned;

      console.log(`[GameState] 🎉 Level ${levelId} Completed.`);

      // 2. Buka Level Berikutnya Otomatis
      const nextLevel = this.levels.find((l) => l.id === levelId + 1);
      if (nextLevel && !nextLevel.unlocked) {
        nextLevel.unlocked = true;
        console.log(`[GameState] 🔓 Level ${nextLevel.id} UNLOCKED!`);
      }
    }
  },
};