import { GameState } from "../systems/GameState.js";
import { UIManager } from "../systems/UIManager.js";
import { LeaderboardSystem } from "../systems/LeaderboardSystem.js"; // <--- IMPORT BARU

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
    this.hasSaved = false; // Penanda agar tidak simpan dobel
  }

  create() {
    // Reset status simpan saat scene mulai
    this.hasSaved = false;

    const width = this.scale.width;
    const height = this.scale.height;
    this.uiManager = new UIManager(this);

    // --- BACKGROUND ---
    const bgKey = this.textures.exists("bg_level") ? "bg_level" : null;
    if (bgKey) {
      const bg = this.add
        .image(width / 2, height / 2, bgKey)
        .setDisplaySize(width, height);
      this.tweens.add({
        targets: bg,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 15000,
        yoyo: true,
        repeat: -1,
      });
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a);
    }

    const overlay = this.add.graphics();
    overlay.fillGradientStyle(
      0x0f172a,
      0x0f172a,
      0x000000,
      0x000000,
      0.9,
      0.9,
      0.95,
      0.95
    );
    overlay.fillRect(0, 0, width, height);

    // --- DATA SKOR ---
    const s = GameState.scores;
    const totalScore =
      s.digitalLiteracy + s.creativeThinking + s.problemSolving;
    const maxPerCategory = 200;
    const badgeData = this.getBadgeData(totalScore);

    // --- UI KARTU ---
    this.createResultCard(
      width,
      height,
      totalScore,
      badgeData,
      s,
      maxPerCategory
    );

    // --- CONFETTI ---
    if (totalScore >= 150) this.createCustomConfetti();

    this.scale.off("resize");
    this.scale.on("resize", () => {
      this.scene.restart();
    });
  }

  getBadgeData(score) {
    if (score >= 300)
      return {
        title: "CYBER GUARDIAN",
        icon: "👑",
        color: 0xfacc15,
        glow: 0xffd700,
      };
    else if (score >= 150)
      return {
        title: "DIGITAL SCOUT",
        icon: "🛡️",
        color: 0x38bdf8,
        glow: 0x0ea5e9,
      };
    else
      return {
        title: "NOVICE SURFER",
        icon: "🥉",
        color: 0x94a3b8,
        glow: 0xcbd5e1,
      };
  }

  createResultCard(width, height, totalScore, badgeData, scores, maxVal) {
    // Layout Kompak
    const cardW = Math.min(width * 0.9, 450);
    const cardH = Math.min(height * 0.85, 600); // Sedikit diperpanjang untuk 2 tombol
    const centerX = width / 2;
    const centerY = height / 2;

    const container = this.add.container(centerX, centerY);

    // Background Kartu
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x1e293b, 0.98);
    cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    cardBg.lineStyle(4, 0x38bdf8, 1);
    cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    container.add(cardBg);

    // Header
    const lblTitle = this.add
      .text(0, -cardH / 2 + 35, "HASIL AKHIR", {
        fontFamily: "Poppins",
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Badge & Icon
    const iconY = -cardH / 2 + 120;
    const glow = this.add.circle(0, iconY, 45, badgeData.glow, 0.4);
    this.tweens.add({
      targets: glow,
      scale: 1.2,
      alpha: 0.1,
      duration: 2000,
      repeat: -1,
      yoyo: true,
    });
    const txtIcon = this.add
      .text(0, iconY, badgeData.icon, { fontSize: "50px" })
      .setOrigin(0.5);
    const txtRank = this.add
      .text(0, iconY + 50, badgeData.title, {
        fontFamily: "Poppins",
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setTint(badgeData.color);

    container.add([lblTitle, glow, txtIcon, txtRank]);

    // Skor Total
    const scoreY = -10;
    const lblScore = this.add
      .text(0, scoreY - 25, "TOTAL SKOR", {
        fontFamily: "Inter",
        fontSize: "12px",
        color: "#cbd5e1",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const valScore = this.add
      .text(0, scoreY + 10, "0", {
        fontFamily: "Poppins",
        fontSize: "48px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.tweens.addCounter({
      from: 0,
      to: totalScore,
      duration: 2000,
      ease: "Power2",
      onUpdate: (tween) => valScore.setText(Math.floor(tween.getValue())),
    });
    container.add([lblScore, valScore]);

    // Progress Bars
    const barsStartY = scoreY + 55;
    const barGap = 45;
    const barWidth = cardW * 0.8;
    this.createStatBar(
      container,
      0,
      barsStartY,
      "Literasi Digital",
      scores.digitalLiteracy,
      maxVal,
      0x38bdf8,
      barWidth
    );
    this.createStatBar(
      container,
      0,
      barsStartY + barGap,
      "Kreativitas",
      scores.creativeThinking,
      maxVal,
      0xf472b6,
      barWidth
    );
    this.createStatBar(
      container,
      0,
      barsStartY + barGap * 2,
      "Problem Solving",
      scores.problemSolving,
      maxVal,
      0x4ade80,
      barWidth
    );

    // --- TOMBOL MENU & SIMPAN ---
    // Kita kunci posisinya di bagian bawah kartu
    const btnMenuY = cardH / 2 - 50;
    const btnSaveY = cardH / 2 - 100; // Di atas tombol menu

    // 1. Tombol Simpan Skor (Hijau)
    const btnSave = this.createButton(
      "SIMPAN SKOR",
      0,
      btnSaveY,
      0x22c55e,
      () => {
        this.handleSaveScore(totalScore, btnSave);
      }
    );
    container.add(btnSave);

    // 2. Tombol Menu Utama (Biru/Warna Badge)
    const btnMenu = this.createButton(
      "MENU UTAMA",
      0,
      btnMenuY,
      badgeData.color,
      () => {
        this.scene.start("MenuScene");
      }
    );
    container.add(btnMenu);

    container.setDepth(100);
    container.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: container,
      scale: 1,
      alpha: 1,
      duration: 600,
      ease: "Back.out",
    });
  }

  createStatBar(parentContainer, x, y, label, value, maxValue, color, width) {
    const barHeight = 16;
    const txtLabel = this.add
      .text(x - width / 2, y - 12, label, {
        fontFamily: "Inter",
        fontSize: "11px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0, 1);
    const txtValue = this.add
      .text(x + width / 2, y - 12, `${value}/${maxValue}`, {
        fontFamily: "Inter",
        fontSize: "11px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(1, 1);
    const bgBar = this.add
      .rectangle(x, y + 4, width, barHeight, 0x000000, 0.6)
      .setOrigin(0.5)
      .setStrokeStyle(1, 0xffffff);
    const fillBar = this.add
      .rectangle(x - width / 2, y + 4, 0, barHeight, color)
      .setOrigin(0, 0.5);

    const percentage = Math.min(Math.max(0, value) / maxValue, 1.0);
    this.tweens.add({
      targets: fillBar,
      width: width * percentage,
      duration: 1500,
      delay: 300,
      ease: "Cubic.out",
    });
    parentContainer.add([txtLabel, txtValue, bgBar, fillBar]);
  }

  createButton(text, x, y, color, callback) {
    const btn = this.add.container(x, y);
    const w = 180;
    const h = 40;
    const bg = this.add.graphics();
    bg.fillStyle(0x334155, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
    bg.lineStyle(2, color, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
    const hitArea = this.add
      .rectangle(0, 0, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    if (callback) hitArea.on("pointerdown", callback);
    const txt = this.add
      .text(0, 0, text, {
        fontFamily: "Poppins",
        fontSize: "14px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    btn.add([bg, hitArea, txt]);
    hitArea.on("pointerover", () => {
      this.tweens.add({ targets: btn, scale: 1.05, duration: 100 });
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
      txt.setColor("#000");
    });
    hitArea.on("pointerout", () => {
      this.tweens.add({ targets: btn, scale: 1, duration: 100 });
      bg.clear();
      bg.fillStyle(0x334155, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
      bg.lineStyle(2, color, 1);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
      txt.setColor("#ffffff");
    });
    return btn;
  }

  createCustomConfetti() {
    if (!this.textures.exists("confetti_particle")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff);
      g.fillRect(0, 0, 8, 8);
      g.generateTexture("confetti_particle", 8, 8);
    }
    this.add
      .particles(0, 0, "confetti_particle", {
        x: { min: 0, max: this.scale.width },
        y: -50,
        lifespan: 4000,
        speedY: { min: 100, max: 350 },
        speedX: { min: -100, max: 100 },
        scale: { start: 1, end: 0 },
        angle: { min: 0, max: 360 },
        tint: [0xfacc15, 0x38bdf8, 0xf472b6, 0x4ade80],
        gravityY: 150,
        quantity: 2,
        frequency: 150,
      })
      .setDepth(0);
  }

  // --- LOGIKA SIMPAN SKOR ---
  handleSaveScore(score, btnInstance) {
    if (this.hasSaved) {
      alert("Skor sudah disimpan!");
      return;
    }

    const playerName = prompt("Masukkan Nama Kamu (Maks 10 huruf):");
    if (playerName && playerName.trim().length > 0) {
      const cleanName = playerName.trim().substring(0, 10);

      // Ubah tombol jadi abu-abu tanda loading
      btnInstance.setAlpha(0.5);

      LeaderboardSystem.saveScore(cleanName, score).then((success) => {
        if (success) {
          alert("Berhasil! Skormu sudah masuk Leaderboard.");
          this.hasSaved = true;
          btnInstance.destroy(); // Hilangkan tombol setelah sukses
        } else {
          alert("Gagal koneksi. Coba lagi nanti.");
          btnInstance.setAlpha(1);
        }
      });
    }
  }
}
