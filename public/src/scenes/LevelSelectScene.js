import { GameState } from "../systems/GameState.js";

const THEME = {
  colors: {
    bgDark: 0x0f172a,
    bgLight: 0x1e293b,
    primary: 0x38bdf8,
    accent: 0xf43f5e,
    textWhite: "#ffffff",
    textGray: "#94a3b8",
    locked: "#475569",
    gold: 0xfbbf24,
    line: 0x334155
  },
  fonts: {
    main: "Poppins",
    sub: "Inter"
  },
  layout: {
    cardSize: 160,
    gap: 60
  }
};

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super("LevelSelectScene");
  }

  // --- 1. TAMBAHKAN PRELOAD DI SINI ---
  preload() {
    // Memuat gambar background menu
    // Pastikan file 'bg-mainmenu.png' ada di folder assets Anda
    this.load.image("bg-mainmenu", "assets/bg-mainmenu.png");
  }

  create() {
    const { width, height } = this.scale;

    // 1. Background Dinamis
    this.createBackground(width, height);

    // 2. Header & User Stats (Dashboard Style)
    this.createDashboard(width, height);

    // 3. Container Level (Path & Grid)
    this.levelContainer = this.add.container(0, 0);
    this.createLevelMap(width, height);

    // 4. Handle Resize
    this.scale.on("resize", (gameSize) => {
      this.createBackground(gameSize.width, gameSize.height);
      this.refreshLayout(gameSize.width, gameSize.height);
    });
  }

  // --- 2. UPDATE FUNGSI CREATE BACKGROUND ---
  createBackground(width, height) {
    // Cek apakah gambar background ada
    if (this.textures.exists("bg-mainmenu")) {
        // Tampilkan gambar full screen
        this.add.image(width / 2, height / 2, "bg-mainmenu")
            .setDisplaySize(width, height);
        
        // Tambahkan Overlay Gelap (Opacity 0.7)
        // Ini PENTING agar teks dan kartu level tetap kontras dan terbaca
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    } else {
        // Fallback: Gunakan Gradient jika gambar tidak ditemukan
        const bg = this.add.graphics();
        bg.fillGradientStyle(
            THEME.colors.bgDark, THEME.colors.bgDark, 
            0x020617, 0x020617, 1
        );
        bg.fillRect(0, 0, width, height);
    }
    
    // Grid Pattern (Tetap ditambahkan di atas background sebagai hiasan Cyberpunk)
    const grid = this.add.graphics();
    grid.lineStyle(1, 0xffffff, 0.05); // Garis putih tipis (transparan)
    
    for(let i = 0; i < width; i+=50) {
        grid.moveTo(i, 0).lineTo(i, height);
    }
    for(let j = 0; j < height; j+=50) {
        grid.moveTo(0, j).lineTo(width, j);
    }
    grid.strokePath();
  }

  createDashboard(width, height) {
    // Top Bar Container
    this.dashboard = this.add.container(0, 0);
    
    // Title
    const title = this.add.text(width * 0.05, 50, "PILIH MISI", {
        fontFamily: THEME.fonts.main, fontSize: "42px", fontStyle: "900", color: THEME.colors.textWhite
    }).setOrigin(0, 0.5);

    const subtitle = this.add.text(width * 0.05, 85, "Selesaikan misi untuk menaikkan Rank!", {
        fontFamily: THEME.fonts.sub, fontSize: "16px", color: THEME.colors.textGray
    }).setOrigin(0, 0.5);

    // Player Stats Box (Kanan Atas)
    const statsBg = this.add.graphics();
    statsBg.fillStyle(THEME.colors.bgLight, 1);
    statsBg.fillRoundedRect(width - 250, 30, 220, 70, 16);
    statsBg.lineStyle(2, THEME.colors.primary, 0.5);
    statsBg.strokeRoundedRect(width - 250, 30, 220, 70, 16);

    const xpLabel = this.add.text(width - 230, 45, "TOTAL XP", {
        fontFamily: THEME.fonts.sub, fontSize: "12px", color: THEME.colors.textGray, fontStyle: "bold"
    });
    
    const xpValue = this.add.text(width - 230, 65, `${GameState.scores.digitalLiteracy || 0}`, {
        fontFamily: THEME.fonts.main, fontSize: "28px", color: "#fbbf24", fontStyle: "bold"
    });

    this.dashboard.add([statsBg, title, subtitle, xpLabel, xpValue]);
  }

  createLevelMap(screenWidth, screenHeight) {
    this.levelContainer.removeAll(true);

    const levels = GameState.levels;
    const { cardSize, gap } = THEME.layout;
    
    const totalW = levels.length * cardSize + (levels.length - 1) * gap;
    const startX = (screenWidth - totalW) / 2 + cardSize / 2;
    const centerY = screenHeight * 0.55;

    // --- GAMBAR GARIS KONEKTOR (PATH) ---
    const pathGraphics = this.add.graphics();
    this.levelContainer.add(pathGraphics);
    
    pathGraphics.lineStyle(4, THEME.colors.line, 1);
    
    const points = [];
    levels.forEach((_, index) => {
        points.push({ x: startX + index * (cardSize + gap), y: centerY });
    });

    for (let i = 0; i < points.length - 1; i++) {
        const nextUnlocked = GameState.isLevelUnlocked(levels[i+1].id);
        const lineColor = nextUnlocked ? THEME.colors.primary : THEME.colors.line;
        
        pathGraphics.lineStyle(4, lineColor, nextUnlocked ? 1 : 0.3);
        pathGraphics.lineBetween(points[i].x + cardSize/2, points[i].y, points[i+1].x - cardSize/2, points[i+1].y);
    }

    // --- BUAT KARTU LEVEL ---
    levels.forEach((level, index) => {
      const isUnlocked = GameState.isLevelUnlocked(level.id);
      const card = this.createLevelCard(points[index].x, points[index].y, level, isUnlocked, cardSize);
      
      // Idle Animation (Floating)
      this.tweens.add({
          targets: card,
          y: points[index].y - 10,
          duration: 2000 + (index * 500),
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut"
      });

      this.levelContainer.add(card);
    });
  }

  createLevelCard(x, y, levelData, isUnlocked, size) {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    const renderCard = (hover) => {
        bg.clear();
        
        // Shadow
        bg.fillStyle(0x000000, 0.5); // Shadow lebih gelap agar kontras dengan BG Image
        bg.fillRoundedRect(-size/2 + 5, -size/2 + 10, size, size, 24);

        // Main BG
        const color = isUnlocked ? (hover ? 0x334155 : THEME.colors.bgLight) : 0x0f172a;
        bg.fillStyle(color, 1);
        bg.fillRoundedRect(-size/2, -size/2, size, size, 24);

        // Border
        const borderColor = isUnlocked ? (hover ? THEME.colors.accent : THEME.colors.primary) : THEME.colors.locked;
        bg.lineStyle(hover ? 4 : 2, borderColor, 1);
        bg.strokeRoundedRect(-size/2, -size/2, size, size, 24);
    };
    renderCard(false);
    container.add(bg);

    if (isUnlocked) {
        const numText = this.add.text(0, -20, levelData.id, {
            fontFamily: THEME.fonts.main, fontSize: "64px", fontStyle: "bold", color: THEME.colors.textWhite
        }).setOrigin(0.5);
        
        const label = this.add.text(0, 30, "OPEN", {
            fontFamily: THEME.fonts.sub, fontSize: "14px", fontStyle: "bold", color: "#38bdf8",
            backgroundColor: "#0f172a", padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        container.add([numText, label]);

        // Tambahan: Tanda Centang jika level sudah selesai
        if (levelData.completed) {
             const check = this.add.text(size/2 - 15, -size/2 + 15, "✅", { fontSize: "20px" }).setOrigin(0.5);
             container.add(check);
        }

        const hitArea = new Phaser.Geom.Rectangle(-size/2, -size/2, size, size);
        container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        container.input.cursor = 'pointer';

        container.on('pointerover', () => {
            renderCard(true);
            this.tweens.add({ targets: container, scale: 1.1, duration: 100 });
        });
        
        container.on('pointerout', () => {
            renderCard(false);
            this.tweens.add({ targets: container, scale: 1, duration: 100 });
        });

        container.on('pointerdown', () => {
             this.tweens.add({
                targets: container, scale: 0.9, duration: 50, yoyo: true,
                onComplete: () => this.scene.start(levelData.key)
            });
        });

    } else {
        const lockIcon = this.add.text(0, -10, "🔒", { fontSize: "40px" }).setOrigin(0.5);
        const lockLabel = this.add.text(0, 35, "LOCKED", {
            fontFamily: THEME.fonts.sub, fontSize: "12px", color: THEME.colors.locked
        }).setOrigin(0.5);
        container.add([lockIcon, lockLabel]);
        container.setAlpha(0.8); // Sedikit transparan
    }

    return container;
  }

  refreshLayout(width, height) {
    this.dashboard.removeAll(true);
    this.createDashboard(width, height);
    this.createLevelMap(width, height);
  }
}