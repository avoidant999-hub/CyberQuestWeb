import { GameState } from "../systems/GameState.js";

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super("LevelSelectScene");
  }

  create() {
    const { width, height } = this.scale;

    // --- 1. BACKGROUND (Tetap Konsisten) ---
    const bg = this.add.image(width / 2, height / 2, "bg-mainmenu");
    const scale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(scale).setScrollFactor(0).setTint(0x888888); // Lebih gelap agar kartu menonjol

    // Overlay Gradient halus dari bawah ke atas (opsional, untuk kesan depth)
    const gradient = this.add.graphics();
    gradient.fillGradientStyle(
      0x000000,
      0x000000,
      0x0f172a,
      0x0f172a,
      0,
      0,
      0.8,
      0.8
    );
    gradient.fillRect(0, 0, width, height);

    // --- 2. HEADER SECTION ---
    // Header diposisikan di 15% dari atas layar
    const headerY = height * 0.15;

    const title = this.add
      .text(width / 2, headerY, "PILIH MISI", {
        fontFamily: "Poppins",
        fontSize: "48px",
        fontStyle: "900",
        color: "#ffffff",
        stroke: "#38bdf8",
        strokeThickness: 2,
        shadow: { blur: 20, color: "#0ea5e9", stroke: true, fill: true },
      })
      .setOrigin(0.5);

    // Garis dekorasi header
    this.add
      .rectangle(width / 2, headerY + 40, 180, 4, 0x38bdf8)
      .setOrigin(0.5);

    // --- 3. LEVEL GRID (AUTO CENTER) ---
    this.createCenteredGrid(width, height);

    // --- 4. NAVIGATION ---
    this.createBackButton();

    this.input.on('pointerdown', (pointer) => {
    console.log(`Klik terdeteksi di X: ${pointer.x}, Y: ${pointer.y}`);
    });
  }

  createCenteredGrid(screenWidth, screenHeight) {
    // --- KONFIGURASI LAYOUT ---
    const cardSize = 150; // Ukuran kartu sedikit diperbesar agar jelas
    const gap = 40; // Jarak antar kartu lebih lega

    // Tentukan jumlah kolom berdasarkan lebar layar (Responsive)
    // Desktop lebar: 4 kolom, Tablet/Laptop: 3 kolom, HP: 2 kolom
    const cols = screenWidth > 1100 ? 4 : screenWidth > 700 ? 3 : 2;

    // Total Level yang ada
    const levels = GameState.levels;
    const totalItems = levels.length;

    // Hitung Lebar Total Grid (untuk centering Horizontal)
    // Rumus: (JumlahKolom * LebarKartu) + ((JumlahKolom - 1) * Jarak)
    // Kita hitung lebar baris terpanjang yang mungkin
    const maxCols = Math.min(totalItems, cols);
    const gridWidth = maxCols * cardSize + (maxCols - 1) * gap;

    // Hitung Tinggi Total Grid (untuk centering Vertikal - Opsional, tapi kita set startY manual)
    // Kita mulai grid dari 35% tinggi layar agar tidak menabrak Header
    const startY = screenHeight * 0.35 + cardSize / 2;

    // Hitung Posisi X Awal (Titik paling kiri grid)
    const startX = (screenWidth - gridWidth) / 2 + cardSize / 2;

    levels.forEach((level, index) => {
      const isUnlocked = GameState.player.unlockedLevels.includes(level.id);

      // Hitung Baris & Kolom item ini
      const row = Math.floor(index / cols);
      const col = index % cols;

      // Hitung koordinat X dan Y
      const x = startX + col * (cardSize + gap);
      const y = startY + row * (cardSize + gap);

      this.createLevelCard(x, y, level, isUnlocked, cardSize);
    });
  }

  createLevelCard(x, y, levelData, isUnlocked, size) {
    const container = this.add.container(x, y).setDepth(10);

    // --- BACKGROUND KARTU ---
    const bg = this.add.graphics();

    // Style Logic
    const baseColor = isUnlocked ? 0x0f172a : 0x1e293b;
    const strokeColor = isUnlocked ? 0x38bdf8 : 0x334155;
    const alpha = isUnlocked ? 0.9 : 0.6;

    // Fungsi menggambar shape
    const drawCard = (hover = false) => {
      bg.clear();

      // Fill
      bg.fillStyle(hover ? 0x1e293b : baseColor, alpha);
      bg.fillRoundedRect(-size / 2, -size / 2, size, size, 20); // Corner radius 20

      // Border (Stroke)
      // Jika hover, border jadi putih dan lebih tebal
      bg.lineStyle(hover ? 4 : 3, hover ? 0xffffff : strokeColor, 1);
      bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 20);

      // Glow Effect jika Unlocked
      if (isUnlocked && !hover) {
        bg.lineStyle(2, 0x38bdf8, 0.3);
        bg.strokeRoundedRect(
          -size / 2 - 4,
          -size / 2 - 4,
          size + 8,
          size + 8,
          24
        );
      }
    };

    drawCard(false);
    container.add(bg);

    // --- KONTEN KARTU ---
    if (isUnlocked) {
      // Angka Level
      const num = this.add
        .text(0, -15, levelData.id, {
          fontFamily: "Poppins",
          fontSize: "56px",
          fontStyle: "bold",
          color: "#ffffff",
        })
        .setOrigin(0.5);

      // Label
      const label = this.add
        .text(0, 25, "LEVEL", {
          fontFamily: "Inter",
          fontSize: "12px",
          color: "#94a3b8",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      // Bintang (Visual Only)
      const starY = 50;
      const stars = this.add
        .text(0, starY, "★ ★ ★", {
          fontSize: "18px",
          color: "#fbbf24", // Kuning Emas
        })
        .setOrigin(0.5);

      container.add([num, label, stars]);

      // Hapus kode interaksi lama, ganti dengan ini:
      container.setSize(size, size);
      // Memberikan area klik manual sebesar kotak kartu
      const hitArea = new Phaser.Geom.Rectangle(0, 0, size, size);
      container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

      // Tambahkan ini agar koordinat klik container pas di tengah
      container.input.hitArea.x = -size / 2;
      container.input.hitArea.y = -size / 2;

      container.on("pointerdown", () => {
        console.log("Level diklik!"); // Cek di console log browser
        this.scene.start(levelData.key);
      });

      container.on("pointerover", () => {
        drawCard(true); // Redraw dengan style hover
        this.tweens.add({ 
        targets: container, 
        scale: 0.95, 
        duration: 50, 
        yoyo: true, 
        onComplete: () => this.scene.start(levelData.key) 
        });
        });

      container.on("pointerout", () => {
        drawCard(false); // Redraw normal
        this.tweens.add({
          targets: container,
          scale: 1,
          duration: 100,
          ease: "Back.out",
        });
      });

      container.on("pointerdown", () => {
        this.scene.start(levelData.key);
      });
    } else {
      // Tampilan Terkunci
      const icon = this.add
        .text(0, -10, "🔒", { fontSize: "40px" })
        .setOrigin(0.5);
      const label = this.add
        .text(0, 30, "TERKUNCI", {
          fontFamily: "Inter",
          fontSize: "11px",
          color: "#64748b",
        })
        .setOrigin(0.5);
      container.add([icon, label]);
    }

    // Animasi Muncul (Pop Up)
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 400,
      delay: levelData.id * 100,
      ease: "Back.out",
    });
  }

  createBackButton() {
    // --- PENGATURAN MARGIN ---
    const marginLeft = 60; // Jarak dari kiri layar
    const marginTop = 60; // Jarak dari atas layar

    // Membuat container di posisi tersebut
    const btn = this.add.container(marginLeft, marginTop);

    // ... (kode sisa sama seperti sebelumnya: membuat lingkaran dan panah) ...
    const bg = this.add.graphics();
    bg.fillStyle(0xef4444, 1);
    bg.fillCircle(0, 0, 24);

    const arrow = this.add
      .text(0, 0, "←", {
        fontSize: "28px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setPadding(0, 0, 0, 2);

    btn.add([bg, arrow]);
    btn.setSize(50, 50);
    btn.setInteractive({ useHandCursor: true });

    // Event Listeners
    btn.on("pointerover", () => {
      this.tweens.add({ targets: btn, scale: 1.15, duration: 100 });
      bg.clear();
      bg.fillStyle(0xf87171, 1);
      bg.fillCircle(0, 0, 24);
    });

    btn.on("pointerout", () => {
      this.tweens.add({ targets: btn, scale: 1, duration: 100 });
      bg.clear();
      bg.fillStyle(0xef4444, 1);
      bg.fillCircle(0, 0, 24);
    });

    btn.on("pointerdown", () => this.scene.start("MenuScene"));
  }
}
