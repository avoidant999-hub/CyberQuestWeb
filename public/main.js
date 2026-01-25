import { BootScene } from './src/scenes/BootScene.js';
import { SplashScene } from './src/scenes/SplashScene.js';
import { MenuScene } from './src/scenes/MenuScene.js';
import { CharacterSelectScene } from './src/scenes/CharacterSelectScene.js';
import { LevelSelectScene } from './src/scenes/LevelSelectScene.js';
import { Level1 } from './src/scenes/levels/Level1.js';
import { Level2 } from './src/scenes/levels/Level2.js';
import { Level3 } from './src/scenes/levels/Level3.js';
import { Level4 } from './src/scenes/levels/Level4.js';
import { ResultScene } from './src/scenes/ResultScene.js';
import { LeaderboardScene } from "./src/scenes/LeaderboardScene.js";

/**
 * Phaser Game Configuration
 * ===========================
 * Bootstrap 5 Responsive Game Configuration
 * 
 * - Scale Mode: RESIZE (responsive to container size)
 * - Parent: #game-container (Bootstrap positioned div)
 * - Aspect Ratio: 16:9 (landscape-first)
 * - Auto Center: Both X and Y
 * - Min/Max: Mobile landscape to desktop constraints
 */

const config = {
  type: Phaser.AUTO,
  parent: 'game-container', // Pastikan ini ada di luar blok scale
  backgroundColor: '#0f172a',
  dom: {
    createContainer: true,
    parent: '#game-container'
},
  
  scale: {
    mode: Phaser.Scale.ENVELOP, // Mengisi seluruh layar HP
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  
  render: {
    pixelArt: false,
    antialias: true,
    mipmapFilter: 'LINEAR',
  },
  
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 },
    },
  },
  
  scene: [
    BootScene,
    SplashScene,
    MenuScene,
    CharacterSelectScene,
    LevelSelectScene,
    Level1,
    Level2,
    Level3,
    Level4,
    ResultScene,
    LeaderboardScene,
  ],
  
  callbacks: {
    preBoot: function(game) {
      console.log('🎮 CyberQuest Game - Mobile Optimized');
      console.log('Version: 2.0');
    },
    postBoot: function(game) {
      console.log('✅ Game initialized successfully');
    }
  },

  input: {
    activePointers: 3,
    smoothStep: false,
    touch: {
      capture: true
    }
  }
};

/**
 * Initialize Phaser Game Instance
 * ================================
 * The game will automatically:
 * - Detect container size via Bootstrap layout
 * - Scale responsively using CSS aspect-ratio
 * - Handle landscape orientation enforcement
 * - Manage scene transitions smoothly
 */
const game = new Phaser.Game(config);

/**
 * Global Game State Management
 * =============================
 * Attach to window for cross-scene access
 */
window.gameInstance = game;

// Add global error handling for better debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Log when game boots
game.events.on('boot', () => {
  console.log('[Main] Phaser game booted successfully');
});

