import { GameState } from "../../systems/GameState.js";
import { UIManager } from "../../systems/UIManager.js";

// --- TEMA: SOCIAL MEDIA DARK MODE ---
const THEME = {
  colors: {
    bg: 0x0f172a,
    card: 0x1e293b,
    primary: 0x38bdf8,   // Blue (Like/Interact)
    danger: 0xf43f5e,    // Red (Report/Block)
    success: 0x10b981,   // Green (Safe)
    textMain: "#ffffff",
    textSec: "#94a3b8",  // Grey text
    accent: 0x8b5cf6     // Purple
  },
  fonts: {
    header: "Poppins",
    body: "Inter"
  }
};

export class Level3 extends Phaser.Scene {
  constructor() {
    super("Level3");
  }

  // --- 1. INITIALIZATION ---
  init() {
    this.reputation = 100;
    this.currentScenarioIndex = 0;
    this.gameActive = true;

    // Data Skenario (Konten Medsos)
    this.scenarios = [
      {
        user: "Si_Pengganggu",
        handle: "@bully_squad",
        time: "2m ago",
        avatarColor: 0xf43f5e, // Merah
        content: "Haha, lihat nih foto aib si Budi waktu tidur di kelas! 🤣 Wajahnya kocak banget! #viral #malu",
        choices: [
          { text: "IKUT KETAWA & REPOST", impact: -30, color: THEME.colors.primary, feedback: "⚠️ BURUK! Kamu menyebarkan bullying." },
          { text: "REPORT & TEGUR", impact: 10, color: THEME.colors.danger, feedback: "✅ HEBAT! Kamu memutus rantai bullying." }
        ]
      },
      {
        user: "Giveaway Sultan",
        handle: "@promo_iphone_resmi",
        time: "15m ago",
        avatarColor: 0xfacc15, // Kuning
        content: "SELAMAT! Kamu terpilih menang iPhone 15 Pro Max! 🎁 Kirim foto KTP & KK ke DM admin sekarang untuk klaim!",
        choices: [
          { text: "KIRIM DATA PRIBADI", impact: -50, color: THEME.colors.success, feedback: "🚫 BAHAYA! Ini modus Phishing (Pencurian Data)." },
          { text: "ABAIKAN & BLOKIR", impact: 10, color: THEME.colors.danger, feedback: "🛡️ TEPAT! Data pribadi harus dilindungi." }
        ]
      },
      {
        user: "Bestie Curhat",
        handle: "@galau_everyday",
        time: "1h ago",
        avatarColor: 0xd946ef, // Pink
        content: "Aku benci banget sama guru Matematika hari ini. Rasanya pengen maki-maki dia di status! 🤬",
        choices: [
          { text: "KOMPORIN BIAR RAME", impact: -20, color: THEME.colors.primary, feedback: "❌ SALAH. Jejak digital negatif bisa merusak masa depan." },
          { text: "NASIHATI LEWAT DM", impact: 10, color: THEME.colors.accent, feedback: "🤝 BIJAK! Menjaga etika di ruang publik itu penting." }
        ]
      }
    ];
  }

  create() {
    const { width, height } = this.scale;
    try { this.uiManager = new UIManager(this); } catch (e) { }

    // 1. Background (Blurry City)
    this.createBackground(width, height);

    // 2. Header (HUD)
    this.createHeader(width, height);

    // 3. Reputation Bar (Status Pemain)
    this.createReputationBar(width, height);

    // 4. Start Feed
    this.showNextScenario();

    // Resize
    this.scale.on("resize", () => this.scene.restart());
  }

  // --- 2. VISUAL COMPONENTS ---

  createBackground(width, height) {
    if (this.textures.exists("bg-level2")) {
      const bg = this.add.image(width / 2, height / 2, "bg-level2");
      const scale = Math.max(width / bg.width, height / bg.height);
      bg.setScale(scale).setAlpha(0.6); // Agak gelap biar fokus ke UI
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, THEME.colors.bg);
    }
    // Gradient Overlay bawah ke atas (agar UI bawah jelas)
    const grad = this.add.graphics();
    grad.fillGradientStyle(0x000000, 0x000000, 0x0f172a, 0x0f172a, 0, 0, 1, 1);
    grad.fillRect(0, 0, width, height);
  }

  createHeader(width, height) {
    const headerH = 80;

    // --- TOMBOL KELUAR ---
    // 1. Buat Container & Teks
    const btnExit = this.add.container(90, headerH / 2).setDepth(100);

    const exitIcon = this.add
      .text(0, 0, "⬅ KELUAR", {
        fontFamily: THEME.fonts.header,
        fontSize: "14px",
        fontStyle: "bold",
        color: "#fff",
      })
      .setOrigin(0.5);

    // 2. Hitung Ukuran Background Dinamis
    const bgWidth = exitIcon.width + 40; // Padding horizontal
    const bgHeight = exitIcon.height + 20; // Padding vertikal

    // 3. Buat Graphics Object
    const exitBg = this.add.graphics();

    // 4. Fungsi Helper untuk Menggambar (Solusi Pengganti setTint)
    const drawExitBg = (color) => {
      exitBg.clear(); // Hapus gambar lama
      exitBg.fillStyle(color, 1);
      // Menggambar kotak dengan posisi centered relative terhadap container
      exitBg.fillRoundedRect(
        -bgWidth / 2,
        -bgHeight / 2,
        bgWidth,
        bgHeight,
        10,
      );
    };

    // Gambar warna awal
    drawExitBg(THEME.colors.danger);

    // Masukkan ke container (Bg dulu, baru Icon)
    btnExit.add([exitBg, exitIcon]);

    // 5. Interaktifitas
    const hitArea = new Phaser.Geom.Rectangle(
      -bgWidth / 2,
      -bgHeight / 2,
      bgWidth,
      bgHeight,
    );
    btnExit.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    btnExit.input.cursor = "pointer";

    btnExit.on("pointerover", () => {
      this.tweens.add({ targets: btnExit, scale: 1.05, duration: 100 });
      drawExitBg(0xf87171); // Gambar ulang dengan warna lebih terang
    });

    btnExit.on("pointerout", () => {
      this.tweens.add({ targets: btnExit, scale: 1, duration: 100 });
      drawExitBg(THEME.colors.danger); // Gambar ulang dengan warna asli
    });

    btnExit.on("pointerdown", () => {
      this.tweens.add({
        targets: btnExit,
        scale: 0.9,
        duration: 50,
        yoyo: true,
        onComplete: () => this.scene.start("LevelSelectScene"),
      });
    });

    // --- JUDUL ---
    this.add.text(width / 2, headerH / 2, "LEVEL 3: JEJAK DIGITAL", {
      fontFamily: THEME.fonts.header, fontSize: "24px", fontStyle: "900", color: "#fff",
      shadow: { blur: 15, color: THEME.colors.accent, fill: true }
    }).setOrigin(0.5);
  }

  createReputationBar(width, height) {
    const startY = height * 0.18;

    this.add.text(width / 2, startY - 25, "STATUS REPUTASI ONLINE", {
      fontFamily: THEME.fonts.body, fontSize: "12px", color: THEME.colors.textSec
    }).setOrigin(0.5);

    // Container Bar
    this.repBarWidth = Math.min(400, width * 0.8);
    const bgBar = this.add.rectangle(width / 2, startY, this.repBarWidth, 14, 0x334155).setOrigin(0.5);
    this.fillBar = this.add.rectangle(width / 2 - this.repBarWidth / 2, startY, this.repBarWidth, 14, THEME.colors.success).setOrigin(0, 0.5);

    // Glow effect pada bar
    this.barGlow = this.add.graphics();
    this.updateReputationVisuals();
  }

  updateReputationVisuals() {
    // Clamping 0-100
    if (this.reputation > 100) this.reputation = 100;
    if (this.reputation < 0) this.reputation = 0;

    const pct = this.reputation / 100;

    // Warna Dinamis
    let color = THEME.colors.success; // Hijau
    if (this.reputation < 70) color = THEME.colors.warning; // Kuning
    if (this.reputation < 40) color = THEME.colors.danger; // Merah

    // Animasi Bar
    this.tweens.add({
      targets: this.fillBar,
      width: this.repBarWidth * pct,
      fillColor: color,
      duration: 300,
      ease: "Power2"
    });
  }

  // --- 3. FEED SYSTEM (THE CARD) ---

  showNextScenario() {
    if (this.currentScenarioIndex >= this.scenarios.length) {
      this.finishLevel();
      return;
    }

    const data = this.scenarios[this.currentScenarioIndex];
    const { width, height } = this.scale;
    const cardW = Math.min(500, width * 0.9);
    const cardH = 350;

    // Container Utama (Feed Card)
    this.card = this.add.container(width / 2, height * 0.55);
    this.card.setAlpha(0); // Mulai transparan untuk animasi

    // 1. Card Body
    const bg = this.add.graphics();
    bg.fillStyle(THEME.colors.card, 1);
    bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    // Border Neon Halus
    bg.lineStyle(2, 0x475569, 0.5);
    bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);

    // 2. User Info (Header)
    // Avatar Circle
    const avatarBg = this.add.circle(-cardW / 2 + 50, -cardH / 2 + 50, 25, data.avatarColor);
    const avatarTxt = this.add.text(-cardW / 2 + 50, -cardH / 2 + 50, data.user.charAt(0), {
      fontSize: "24px", fontStyle: "bold"
    }).setOrigin(0.5);

    // Name & Handle
    const nameTxt = this.add.text(-cardW / 2 + 90, -cardH / 2 + 35, data.user, {
      fontFamily: THEME.fonts.header, fontSize: "18px", color: "#fff", fontStyle: "bold"
    });
    const handleTxt = this.add.text(-cardW / 2 + 90, -cardH / 2 + 60, `${data.handle} • ${data.time}`, {
      fontFamily: THEME.fonts.body, fontSize: "14px", color: THEME.colors.textSec
    });

    // 3. Content Body
    const contentTxt = this.add.text(0, -20, data.content, {
      fontFamily: THEME.fonts.body, fontSize: "20px", color: "#e2e8f0",
      align: "center", wordWrap: { width: cardW - 60 }
    }).setOrigin(0.5);

    // Separator Line
    const line = this.add.rectangle(0, cardH / 2 - 90, cardW - 40, 1, 0x334155);

    this.card.add([bg, avatarBg, avatarTxt, nameTxt, handleTxt, contentTxt, line]);

    // 4. Action Buttons
    const btnW = (cardW - 60) / 2;
    data.choices.forEach((choice, index) => {
      const xPos = index === 0 ? -(btnW / 2 + 10) : (btnW / 2 + 10);
      const yPos = cardH / 2 - 45;

      const btn = this.createButton(xPos, yPos, btnW, 50, choice.text, choice.color, () => {
        this.handleChoice(choice);
      });
      this.card.add(btn);
    });

    // Animasi Muncul (Slide Up & Fade In)
    this.card.y += 50;
    this.tweens.add({
      targets: this.card, y: height * 0.55, alpha: 1, duration: 500, ease: "Back.out"
    });
  }

  createButton(x, y, w, h, text, color, callback) {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 12); // Dark bg default
    bg.lineStyle(2, color, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 12); // Colored border

    const txt = this.add.text(0, 0, text, {
      fontFamily: THEME.fonts.header, fontSize: "14px", fontStyle: "bold", color: "#fff",
      wordWrap: { width: w - 10 }, align: 'center'
    }).setOrigin(0.5);

    container.add([bg, txt]);

    // Interaction
    const hit = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    container.setInteractive(hit, Phaser.Geom.Rectangle.Contains);

    container.on('pointerover', () => {
      bg.clear().fillStyle(color, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 12); // Fill color on hover
      txt.setColor("#000"); // Text dark on hover
      this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
    });

    container.on('pointerout', () => {
      bg.clear().fillStyle(0x0f172a, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 12)
        .lineStyle(2, color, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
      txt.setColor("#fff");
      this.tweens.add({ targets: container, scale: 1, duration: 100 });
    });

    container.on('pointerdown', () => {
      // Disable input sementara
      this.input.enabled = false;
      callback();
    });

    return container;
  }

  handleChoice(choice) {
    // 1. Update Logic
    this.reputation += choice.impact;
    this.updateReputationVisuals();

    // 2. Animasi Feedback (Floating Text)
    this.showFloatingFeedback(choice.feedback, choice.impact > 0);

    // 3. Card Animation (Fly Out)
    this.tweens.add({
      targets: this.card,
      x: choice.impact > 0 ? this.scale.width + 500 : -500, // Kanan jika benar, kiri jika salah
      rotation: choice.impact > 0 ? 0.5 : -0.5,
      alpha: 0,
      duration: 600,
      ease: "Back.in",
      onComplete: () => {
        this.card.destroy();
        this.input.enabled = true; // Enable input lagi

        // Cek Game Over
        if (this.reputation <= 0) {
          this.gameOver();
        } else {
          this.currentScenarioIndex++;
          this.time.delayedCall(500, () => this.showNextScenario());
        }
      }
    });
  }

  showFloatingFeedback(text, isGood) {
    const { width, height } = this.scale;

    const container = this.add.container(width / 2, height / 2);

    // Background Pill
    const bg = this.add.graphics();
    bg.fillStyle(isGood ? THEME.colors.success : THEME.colors.danger, 1);
    bg.fillRoundedRect(-200, -30, 400, 60, 30);

    const txt = this.add.text(0, 0, text, {
      fontFamily: THEME.fonts.header, fontSize: "16px", fontStyle: "bold", color: "#fff",
      align: "center", wordWrap: { width: 380 }
    }).setOrigin(0.5);

    container.add([bg, txt]);
    container.setScale(0);

    // Pop In -> Wait -> Fade Out
    this.tweens.add({
      targets: container,
      scale: 1,
      y: height / 2 - 100, // Naik ke atas sedikit
      duration: 400,
      ease: "Back.out",
      onComplete: () => {
        this.tweens.add({
          targets: container,
          alpha: 0,
          y: height / 2 - 150,
          delay: 1500, // Tahan 1.5 detik agar terbaca
          duration: 300,
          onComplete: () => container.destroy()
        });
      }
    });
  }

  gameOver() {
    // Tampilkan Layar Kalah Sederhana
    const { width, height } = this.scale;
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9).setInteractive();

    this.add.text(width / 2, height / 2 - 20, "GAME OVER", {
      fontSize: "48px", color: THEME.colors.danger, fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 30, "Reputasi Digitalmu Hancur!", {
      fontSize: "20px", color: "#fff"
    }).setOrigin(0.5);

    this.time.delayedCall(3000, () => this.scene.start("LevelSelectScene"));
  }

  finishLevel() {
    // Unlock Level 4
    GameState.completeLevel(3, 3);

    // Tampilan Menang (Sama seperti level lain tapi dengan tema ungu)
    const { width, height } = this.scale;
    const container = this.add.container(width / 2, height / 2).setDepth(200);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x4c1d95, 0x4c1d95, 0x1e1b4b, 0x1e1b4b, 1); // Ungu gradient
    bg.fillRoundedRect(-250, -150, 500, 300, 20);
    bg.lineStyle(4, THEME.colors.accent).strokeRoundedRect(-250, -150, 500, 300, 20);

    const title = this.add.text(0, -60, "LEVEL SELESAI!", {
      fontFamily: THEME.fonts.header, fontSize: "36px", color: "#fff", fontStyle: "900"
    }).setOrigin(0.5);

    const score = this.add.text(0, 0, `Total Skor Akhir: ${GameState.getTotalScore()}`, {
      fontFamily: THEME.fonts.body, fontSize: "20px", color: "#ddd"
    }).setOrigin(0.5);

    const btn = this.add.container(0, 80);
    const btnBg = this.add.graphics().fillStyle(THEME.colors.success, 1).fillRoundedRect(-100, -25, 200, 50, 25);
    const btnTxt = this.add.text(0, 0, "KEMBALI KE PILIH MISI", { fontFamily: "Poppins", fontSize: "14px", fontStyle: "bold" }).setOrigin(0.5);
    btn.add([btnBg, btnTxt]).setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains);

    btn.on('pointerdown', () => this.scene.start("LevelSelectScene"));

    container.add([bg, title, score, btn]);
    container.setScale(0);
    this.tweens.add({ targets: container, scale: 1, duration: 500, ease: "Elastic.out(1, 0.8)" });
  }
}