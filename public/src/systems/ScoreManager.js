import { GameState } from "./GameState.js";

export const ScoreManager = {
    // Menambah skor berdasarkan kategori
    addScore(category, value) {
        if (GameState.scores.hasOwnProperty(category)) {
            GameState.scores[category] += value;
            return GameState.scores[category];
        }
        console.warn(`Category ${category} not found!`);
        return 0;
    },

    // Mendapatkan total skor saat ini
    getTotalScore() {
        const s = GameState.scores;
        return s.digitalLiteracy + s.creativeThinking + s.problemSolving;
    },

    // Cek apakah level selesai dan buka level berikutnya
    completeLevel(levelIndex) {
        const nextLevel = levelIndex + 1;
        if (!GameState.player.unlockedLevels.includes(nextLevel) && nextLevel <= 4) {
            GameState.player.unlockedLevels.push(nextLevel);
            return true; // Level baru terbuka
        }
        return false;
    }
};