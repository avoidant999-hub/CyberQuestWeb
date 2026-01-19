import { GameState } from "../../systems/GameState.js";
import { UIManager } from "../../systems/UIManager.js";

export class Level1 extends Phaser.Scene {
  constructor() {
    super("Level1Scene");
    this.uiManager = null;
    this.currentNewsIndex = 0;
    this.newsData = [];
    this.cardContainer = null;
    this.btnFact = null;
    this.btnHoax = null;
    this.scoreText = null;
  }

  create() {
    const { width, height } = this.scale;
    
    // Inisialisasi UIManager (dengan error handling jika class belum siap)
    try {
        this.uiManager = new UIManager(this);
    } catch (e) {
        console.warn("UIManager error, using fallbacks", e);
    }

    // --- 1. BACKGROUND ---
    // Gunakan bg_level, fallback ke warna solid jika gambar tidak ada
    if (this.textures.exists("bg-level1")) {
        this.add.image(width / 2, height / 2, "bg-level1").setDisplaySize(width, height);
    } else {
        this.add.rectangle(width/2, height/2, width, height, 0x1e293b);
    }

    // --- 2. HEADER LEVEL ---
    // Helper untuk font size aman
    const getFont = (type, def) => this.uiManager?.getFontSize ? this.uiManager.getFontSize(type) : def;
    
    this.add.text(width * 0.05, height * 0.08, "LEVEL 1: DETEKTIF HOAKS", {
      fontFamily: "Poppins",
      fontSize: getFont("heading", 32) + "px",
      fontStyle: "bold",
      color: "#38bdf8",
      shadow: { offsetX: 2, offsetY: 2, color: "#000000", blur: 5, fill: true }
    });

    // --- 3. SCORE DISPLAY ---
    this.scoreText = this.add.text(width * 0.95, height * 0.08, `Literasi: ${GameState.scores.digitalLiteracy}`, {
      fontFamily: "Inter",
      fontSize: getFont("button", 24) + "px",
      color: "#fff",
      backgroundColor: "#0f172a",
      padding: { x: 15, y: 10 }
    }).setOrigin(1, 0);

    // Initialize news data (LOGIC TIDAK DIUBAH)
    this.initializeNewsData();

    // Show first news card
    this.showNewsCard();

    // Handle resize
    this.scale.on("resize", () => {
      if(this.uiManager?.calculateMetrics) this.uiManager.calculateMetrics();
    });
  }

  /**
   * DATA BERITA (LOGIC INTI - TIDAK DIUBAH)
   */
  initializeNewsData() {
    this.newsData = [
      {
        headline: "GEMPAR! Minum Air Garam Bisa Sembuhkan Semua Penyakit!",
        source: "www.berita-aneh-banget.com",
        content: "Para ahli terkejut melihat keajaiban ini. Jangan percaya dokter, cukup dapur anda...",
        isHoax: true,
        feedback: "SALAH! Judul provokatif & sumber tidak kredibel adalah ciri Hoaks.",
      },
      {
        headline: "Pemerintah Luncurkan Satelit Baru untuk Internet Pelosok",
        source: "www.kominfo.go.id",
        content: "Peluncuran dilakukan kemarin sore untuk memeratakan akses digital...",
        isHoax: false,
        feedback: "BENAR! Ini adalah berita Fakta dari sumber resmi pemerintah.",
      },
      {
        headline: "HANYA HARI INI! Klik Link Ini Dapat Kuota 1000GB Gratis!",
        source: "bit.ly/kuota-gratis-123",
        content: "Sebarkan ke 5 grup WA untuk klaim hadiahmu sekarang juga!",
        isHoax: true,
        feedback: "HOAKS! Iming-iming hadiah besar & perintah menyebarkan adalah ciri penipuan.",
      },
      {
        headline: "Tips Membuat Password Kuat agar Tidak Mudah Diretas",
        source: "www.siberkreasi.id",
        content: "Gunakan kombinasi huruf, angka, dan simbol unik...",
        isHoax: false,
        feedback: "BENAR! Edukasi keamanan digital adalah informasi valid.",
      },
      {
        headline: "Ditemukan Alien di Monas? Simak Videonya!",
        source: "blog-misteri.xyz",
        content: "Warga Jakarta geger melihat piring terbang...",
        isHoax: true,
        feedback: "HOAKS! Klaim tidak masuk akal tanpa bukti ilmiah.",
      },
    ];
  }

  /**
   * MENAMPILKAN KARTU BERITA (PERBAIKAN VISUAL & SAFETY)
   */
  showNewsCard() {
    if (this.currentNewsIndex >= this.newsData.length) {
      this.startCreativeMission();
      return;
    }

    const news = this.newsData[this.currentNewsIndex];
    const { width, height } = this.scale;

    // Safety fallback sizes
    const cardW = Math.min(600, width * 0.9);
    const cardH = Math.min(400, height * 0.5);
    const centerX = width / 2;
    const centerY = height * 0.45;

    // Create card container
    this.cardContainer = this.add.container(centerX, centerY);

    // Modern Card Style using Graphics (Lebih aman dari texture)
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0xffffff, 1);
    bgGraphics.fillRoundedRect(-cardW/2, -cardH/2, cardW, cardH, 16); // Rounded corner
    bgGraphics.lineStyle(4, 0x0ea5e9, 1);
    bgGraphics.strokeRoundedRect(-cardW/2, -cardH/2, cardW, cardH, 16);
    
    // Shadow fake
    const shadowGraphics = this.add.graphics();
    shadowGraphics.fillStyle(0x000000, 0.2);
    shadowGraphics.fillRoundedRect(-cardW/2 + 8, -cardH/2 + 8, cardW, cardH, 16);

    // Font Helpers
    const getFont = (type, def) => this.uiManager?.getFontSize ? this.uiManager.getFontSize(type) : def;

    // Title
    const txtTitle = this.add.text(0, -cardH * 0.3, news.headline, {
      fontFamily: "Poppins",
      fontSize: (getFont("button", 20) * 1.2) + "px",
      color: "#1e293b",
      fontStyle: "bold",
      align: "center",
      wordWrap: { width: cardW - 40 }
    }).setOrigin(0.5);

    // Source (Badge Style)
    const txtSource = this.add.text(0, -cardH * 0.05, ` 🔗 Sumber: ${news.source} `, {
      fontFamily: "Inter",
      fontSize: (getFont("body", 14)) + "px",
      color: "#0f172a",
      backgroundColor: "#e2e8f0",
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);

    // Content
    const txtContent = this.add.text(0, cardH * 0.2, news.content, {
      fontFamily: "Inter",
      fontSize: (getFont("body", 16)) + "px",
      color: "#475569",
      align: "center",
      wordWrap: { width: cardW - 60 }
    }).setOrigin(0.5);

    this.cardContainer.add([shadowGraphics, bgGraphics, txtTitle, txtSource, txtContent]);

    // Pop-up Animation
    this.cardContainer.setScale(0);
    this.tweens.add({
      targets: this.cardContainer,
      scale: 1,
      duration: 400,
      ease: "Back.out"
    });

    this.createAnswerButtons();
  }

  /**
   * MEMBUAT TOMBOL JAWABAN (PERBAIKAN POSISI & STYLE)
   */
  createAnswerButtons() {
    const { width, height } = this.scale;
    const btnW = 200;
    const btnH = 60;
    const yPos = height * 0.8;
    
    // Posisi X aman
    const centerX = width / 2;
    const gap = 20;

    // Hapus tombol lama jika ada (mencegah duplikat)
    if (this.btnFact) this.btnFact.destroy();
    if (this.btnHoax) this.btnHoax.destroy();

    // Button 1: FAKTA (Hijau)
    this.btnFact = this.createModernButton(
      centerX - btnW/2 - gap, 
      yPos, 
      "FAKTA", 
      0x22c55e, 
      () => this.checkAnswer(false),
      btnW, btnH
    );

    // Button 2: HOAKS (Merah)
    this.btnHoax = this.createModernButton(
      centerX + btnW/2 + gap, 
      yPos, 
      "HOAKS", 
      0xef4444, 
      () => this.checkAnswer(true),
      btnW, btnH
    );
  }

  createModernButton(x, y, text, color, callback, w, h) {
    const container = this.add.container(x, y);

    // Graphics button (lebih aman daripada rectangle biasa)
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-w/2, -h/2, w, h, 12);
    
    // Interaction Zone (PENTING AGAR BISA DIKLIK)
    const hitZone = this.add.zone(0, 0, w, h)
        .setRectangleDropZone(w, h)
        .setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, text, {
      fontFamily: "Inter",
      fontSize: "24px",
      fontStyle: "bold",
      color: "#ffffff"
    }).setOrigin(0.5);

    container.add([bg, label, hitZone]);

    // Events
    hitZone.on("pointerover", () => {
      this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
    });
    hitZone.on("pointerout", () => {
      this.tweens.add({ targets: container, scale: 1, duration: 100 });
    });
    hitZone.on("pointerdown", () => {
      this.tweens.add({
        targets: container,
        scale: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: callback
      });
    });

    return container;
  }

  /**
   * CEK JAWABAN (LOGIC INTI - TIDAK DIUBAH)
   */
  checkAnswer(playerChoseHoax) {
    const news = this.newsData[this.currentNewsIndex];
    const isCorrect = playerChoseHoax === news.isHoax;

    // Destroy buttons agar tidak bisa diklik lagi
    if (this.btnFact) this.btnFact.destroy();
    if (this.btnHoax) this.btnHoax.destroy();

    if (isCorrect) {
      GameState.scores.digitalLiteracy += 20;
      this.scoreText.setText(`Literasi: ${GameState.scores.digitalLiteracy}`);
    }

    this.showFeedback(isCorrect, news.feedback);
  }

  /**
   * FEEDBACK MODAL (PERBAIKAN VISUAL)
   */
  showFeedback(isCorrect, message) {
    const { width, height } = this.scale;

    // Modal Container
    const modalContainer = this.add.container(0, 0).setDepth(100);

    // Dimmer (Layar gelap)
    const dimmer = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7)
        .setInteractive(); // Block klik di belakang

    // Panel Background
    const panelW = Math.min(600, width * 0.9);
    const panelH = 300;
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1e293b, 1);
    panelBg.fillRoundedRect(width/2 - panelW/2, height/2 - panelH/2, panelW, panelH, 20);
    panelBg.lineStyle(3, isCorrect ? 0x4ade80 : 0xf87171, 1); // Border warna status
    panelBg.strokeRoundedRect(width/2 - panelW/2, height/2 - panelH/2, panelW, panelH, 20);

    // Text Status
    const iconText = isCorrect ? "✅ TEPAT SEKALI!" : "❌ KURANG TEPAT";
    const title = this.add.text(width/2, height/2 - 80, iconText, {
        fontFamily: "Poppins", fontSize: "32px", fontStyle: "bold",
        color: isCorrect ? "#4ade80" : "#f87171"
    }).setOrigin(0.5);

    // Text Deskripsi
    const desc = this.add.text(width/2, height/2, message, {
        fontFamily: "Inter", fontSize: "18px", color: "#e2e8f0",
        align: "center", wordWrap: { width: panelW - 60 }
    }).setOrigin(0.5);

    // Tombol Lanjut
    const btnNext = this.createModernButton(width/2, height/2 + 80, "LANJUT >>", 0x38bdf8, () => {
        modalContainer.destroy();
        if (this.cardContainer) this.cardContainer.destroy();
        this.currentNewsIndex++;
        this.showNewsCard();
    }, 200, 50);

    modalContainer.add([dimmer, panelBg, title, desc, btnNext]);
    
    // Animasi Masuk
    modalContainer.setAlpha(0);
    this.tweens.add({ targets: modalContainer, alpha: 1, duration: 200 });
  }

  /**
   * MISI KREATIF (LOGIC INTI - DIPERTAHANKAN)
   */
  startCreativeMission() {
    const { width, height } = this.scale;
    this.children.removeAll(); // Clear screen
    
    // Background ulang
    if (this.textures.exists("bg-level1")) {
        this.add.image(width / 2, height / 2, "bg-level1").setDisplaySize(width, height);
    } else {
        this.add.rectangle(width/2, height/2, width, height, 0x1e293b);
    }

    // Title
    this.add.text(width/2, height * 0.2, "MISI KREATIF: BUAT POSTER", {
      fontFamily: "Poppins", fontSize: "32px", color: "#facc15", fontStyle: "bold",
      shadow: { blur: 10, color: "#eab308", fill: true }
    }).setOrigin(0.5);

    this.add.text(width/2, height * 0.3, "Pilih slogan terbaik untuk melawan hoaks!", {
      fontFamily: "Inter", fontSize: "20px", color: "#cbd5e1"
    }).setOrigin(0.5);

    // Options
    const slogans = ["Sebar Dulu, Baca Nanti!", "Saring Sebelum Sharing", "Jangan Percaya Internet"];
    const startY = height * 0.45;
    const gap = 80;

    slogans.forEach((text, index) => {
      this.createSloganOption(text, index, startY + (index * gap));
    });
  }

  createSloganOption(text, index, yPos) {
    const { width } = this.scale;
    const btnW = Math.min(500, width * 0.8);
    const btnH = 60;

    const container = this.add.container(width/2, yPos);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1e293b, 1);
    bg.fillRoundedRect(-btnW/2, -btnH/2, btnW, btnH, 10);
    bg.lineStyle(2, 0x475569, 1);
    bg.strokeRoundedRect(-btnW/2, -btnH/2, btnW, btnH, 10);

    const label = this.add.text(0, 0, text, {
        fontFamily: "Inter", fontSize: "20px", color: "#fff"
    }).setOrigin(0.5);

    const hitZone = this.add.zone(0, 0, btnW, btnH)
        .setRectangleDropZone(btnW, btnH)
        .setInteractive({ useHandCursor: true });

    container.add([bg, label, hitZone]);

    hitZone.on("pointerover", () => {
        bg.clear();
        bg.fillStyle(0x334155, 1);
        bg.fillRoundedRect(-btnW/2, -btnH/2, btnW, btnH, 10);
        bg.lineStyle(2, 0x38bdf8, 1); // Highlight biru
        bg.strokeRoundedRect(-btnW/2, -btnH/2, btnW, btnH, 10);
        this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
    });

    hitZone.on("pointerout", () => {
        bg.clear();
        bg.fillStyle(0x1e293b, 1);
        bg.fillRoundedRect(-btnW/2, -btnH/2, btnW, btnH, 10);
        bg.lineStyle(2, 0x475569, 1);
        bg.strokeRoundedRect(-btnW/2, -btnH/2, btnW, btnH, 10);
        this.tweens.add({ targets: container, scale: 1, duration: 100 });
    });

    hitZone.on("pointerdown", () => {
        // Logic Scoring (ASLI)
        if (index === 1) GameState.scores.creativeThinking += 50;
        else GameState.scores.creativeThinking += 10;

        this.tweens.add({
            targets: container, scale: 0.95, duration: 100, yoyo: true,
            onComplete: () => this.scene.start("Level2Scene")
        });
    });
  }
}