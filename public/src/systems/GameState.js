export const GameState = {
    player: {
        name: "Guest",
        avatar: "hero_male", // Default
        unlockedLevels: [1]  // Level 1 terbuka by default
    },
    scores: {
        digitalLiteracy: 0,
        creativeThinking: 0,
        problemSolving: 0
    },
    // Konfigurasi Level (Metadata)
    levels: [
        { id: 1, key: 'Level1Scene', title: 'Misi Detektif Hoaks' },
        { id: 2, key: 'Level2Scene', title: 'Benteng Sandi' },
        { id: 3, key: 'Level3Scene', title: 'Jejak Digital' },
        { id: 4, key: 'Level4Scene', title: 'Kampanye Positif' }
    ],

    resetSession() {
        this.scores = { digitalLiteracy: 0, creativeThinking: 0, problemSolving: 0 };
    }
};