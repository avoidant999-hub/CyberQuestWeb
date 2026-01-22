import { GameState } from "../../systems/GameState.js";
import { UIManager } from "../../systems/UIManager.js";

// --- KONFIGURASI TEMA & ASET (Centralized Config) ---
const THEME = {
  colors: {
    bgDark: 0x0f172a,
    cardBg: 0xffffff,
    primary: 0x38bdf8,
    success: 0x10b981,
    danger: 0xef4444,
    warning: 0xf59e0b,
    textMain: "#1e293b",
    textSub: "#64748b",
    textLight: "#ffffff",
  },
  fonts: {
    header: "Poppins",
    body: "Inter",
  },
};

export class Level1 extends Phaser.Scene {
  constructor() {
    super("Level1");
  }

  // --- 1. SYSTEM LIFECYCLE ---

  init() {
    this.currentNewsIndex = 0;
    this.newsData = [];
    this.gameActive = true;
    this.isProcessing = false;

    this.cardContainer = null;
    this.modalContainer = null;
  }

  create() {
    const { width, height } = this.scale;

    try {
      this.uiManager = new UIManager(this);
    } catch (e) {
      console.warn("UIManager missing");
    }

    this.createBackground(width, height);
    this.createHeader(width, height);
    this.initializeGameContent();
    this.showNewsCard();

    this.scale.on("resize", (gameSize) => {
      this.scene.restart();
    });
  }

  // --- 2. VISUAL COMPONENTS ---

  preload() {
    // Pastikan path/lokasi filenya benar sesuai folder project Anda
    // Contoh: folder 'public/assets/bg-level1.png'
    this.load.image("bg-level1", "assets/bg-level1.png");
  }

  // Di dalam Level1.js
  createBackground(width, height) {
    // 1. Cek apakah texture/gambar "bg-level1" sudah dimuat
    if (this.textures.exists("bg-level1")) {
      // Tampilkan gambar dan paksa ukurannya memenuhi layar (seperti Level 3)
      this.add
        .image(width / 2, height / 2, "bg-level1")
        .setDisplaySize(width, height);
    } else {
      // Fallback: Jika gambar tidak ada, gunakan Gradient
      const bg = this.add.graphics();
      bg.fillGradientStyle(
        THEME.colors.bgDark,
        THEME.colors.bgDark,
        0x1e293b,
        0x1e293b,
        1,
      );
      bg.fillRect(0, 0, width, height);
    }

    // 2. Tambahkan Overlay Gelap (Opsional, agar teks lebih kontras)
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.3);

    // 3. Grid Pattern (Tetap dipertahankan sebagai hiasan di atas background)
    this.add.grid(
      width / 2,
      height / 2,
      width,
      height,
      40,
      40,
      0xffffff,
      0,
      0xffffff,
      0.03,
    );
  }

  createHeader(width, height) {
    const headerH = 80;

    const headerBg = this.add.graphics();
    headerBg.fillStyle(THEME.colors.bgDark, 0.9);
    headerBg.fillRect(0, 0, width, headerH);
    headerBg.lineStyle(1, 0x334155);
    headerBg.lineBetween(0, headerH, width, headerH);

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

    // Title & Score
    // --- PERBAIKAN VISUAL TEKS DI SINI ---

    // Gunakan warna #ffffff (Putih) dan tambah Stroke
    this.add
      .text(width / 2, headerH / 2, "LEVEL 1: DETEKTIF HOAKS", {
        fontFamily: THEME.fonts.header,
        fontSize: "24px",
        fontStyle: "bold",
        color: "#ffffff", // Ubah jadi Putih
        stroke: "#000000", // Tambah outline hitam
        strokeThickness: 4, // Ketebalan outline
        shadow: { blur: 10, color: "#0ea5e9", fill: true },
      })
      .setOrigin(0.5);

    this.scoreText = this.add
      .text(
        width - 40,
        headerH / 2,
        `Literasi: ${GameState.scores.digitalLiteracy}`,
        {
          fontFamily: THEME.fonts.body,
          fontSize: "18px", // Sedikit diperbesar
          color: "#ffffff", // Ubah jadi Putih
          fontStyle: "bold",
          stroke: "#000000", // Tambah outline hitam
          strokeThickness: 3,
        },
      )
      .setOrigin(1, 0.5);
  }

  // --- 3. DATA CONTENT ---

  initializeGameContent() {
    this.newsData = [
      {
        headline: "GEMPAR! Minum Air Garam Bisa Sembuhkan Semua Penyakit!",
        source: "www.blog-kesehatan-abal.com",
        content:
          "Dokter merahasiakan ini! Cukup campur garam dapur dan air hujan...",
        isHoax: true,
        clues: [
          "Judul 'GEMPAR!' (Clickbait)",
          "Sumber Blog Pribadi",
          "Teori Konspirasi",
        ],
        feedback:
          "Hoaks Medis! Selalu cek informasi kesehatan di situs resmi Kemenkes atau WHO.",
      },
      {
        headline: "Pemerintah Resmikan Palapa Ring untuk Internet Desa",
        source: "www.kominfo.go.id",
        content:
          "Presiden meresmikan tol langit Palapa Ring Timur untuk pemerataan akses...",
        isHoax: false,
        clues: [
          "Domain Resmi .go.id",
          "Berita Masuk Akal",
          "Liputan Media Mainstream",
        ],
        feedback:
          "Fakta! Domain .go.id dikelola pemerintah dan informasinya dapat dipercaya.",
      },
      {
        headline: "HANYA HARI INI! iPhone 15 Pro Max Cuma Rp 1 Juta!",
        source: "promo-gila-apple.xyz",
        content:
          "Cuci gudang besar-besaran! Transfer sekarang sebelum kehabisan!",
        isHoax: true,
        clues: [
          "Harga Tidak Masuk Akal",
          "Desakan Waktu (Hari Ini)",
          "Domain .xyz aneh",
        ],
        feedback:
          "Scam/Penipuan! Jika penawaran terlalu bagus untuk jadi kenyataan, biasanya itu penipuan.",
      },
      {
        headline: "Waspada Modus Penipuan File APK Undangan Pernikahan",
        source: "www.siber.polri.go.id",
        content:
          "Jangan unduh file .APK dari nomor tidak dikenal di WhatsApp...",
        isHoax: false,
        clues: ["Sumber Kepolisian", "Imbauan Keamanan", "Modus Realistis"],
        feedback:
          "Fakta! Ini adalah modus 'Sniffing' untuk mencuri data perbankan.",
      },
      {
        headline: "Video: Dinosaurus Terlihat Menyeberang di Bundaran HI",
        source: "Tiktok: @MisteriViral",
        content:
          "Warga Jakarta panik melihat T-Rex lepas dari laboratorium rahasia...",
        isHoax: true,
        clues: [
          "Konten Mustahil (CGI)",
          "Tidak Ada Bukti Ilmiah",
          "Akun Hiburan",
        ],
        feedback:
          "Hoaks/Satire! Video ini kemungkinan besar hasil editan komputer (CGI).",
      },
    ];
  }

  // --- 4. GAMEPLAY MECHANICS ---

  showNewsCard() {
    this.isProcessing = false;

    if (this.currentNewsIndex >= this.newsData.length) {
      this.startSloganPhase();
      return;
    }

    if (this.cardContainer) this.cardContainer.destroy();

    const news = this.newsData[this.currentNewsIndex];
    const { width, height } = this.scale;
    const cardW = Math.min(650, width * 0.9);
    const cardH = 380;

    this.cardContainer = this.add.container(width / 2, height / 2 + 30);

    const bg = this.add.graphics();
    bg.fillStyle(THEME.colors.cardBg, 1);
    bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillRoundedRect(-cardW / 2 + 10, -cardH / 2 + 10, cardW, cardH, 20);

    const stripe = this.add.graphics();
    stripe.fillStyle(0xe2e8f0, 1);
    stripe.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, 60, {
      tl: 20,
      tr: 20,
      bl: 0,
      br: 0,
    });

    const sourceTxt = this.add
      .text(0, -cardH / 2 + 30, `🌐 ${news.source}`, {
        fontFamily: THEME.fonts.body,
        fontSize: "14px",
        color: THEME.colors.textSub,
        fontStyle: "italic",
      })
      .setOrigin(0.5);

    const headlineTxt = this.add
      .text(0, -50, news.headline, {
        fontFamily: THEME.fonts.header,
        fontSize: "24px",
        color: THEME.colors.textMain,
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: cardW - 60 },
      })
      .setOrigin(0.5);

    const bodyTxt = this.add
      .text(0, 70, `"${news.content}"`, {
        fontFamily: "Georgia",
        fontSize: "18px",
        color: "#475569",
        align: "center",
        wordWrap: { width: cardW - 80 },
        fontStyle: "italic",
      })
      .setOrigin(0.5);

    this.cardContainer.add([
      shadow,
      bg,
      stripe,
      sourceTxt,
      headlineTxt,
      bodyTxt,
    ]);

    this.cardContainer.setScale(0.8);
    this.cardContainer.setAlpha(0);
    this.tweens.add({
      targets: this.cardContainer,
      scale: 1,
      alpha: 1,
      duration: 400,
      ease: "Back.out",
      onComplete: () => this.createChoiceButtons(),
    });
  }

  createChoiceButtons() {
    const { width, height } = this.scale;
    // PERBAIKAN GAP: Menurunkan posisi Y button agar tidak terlalu menempel dengan kartu
    const btnY = height * 0.88;

    if (this.btnFact) this.btnFact.destroy();
    if (this.btnHoax) this.btnHoax.destroy();

    this.btnFact = this.createActionButton(
      width / 2 - 140,
      btnY,
      "✅ INI FAKTA",
      THEME.colors.success,
      () => this.handleAnswer(false),
    );
    this.btnHoax = this.createActionButton(
      width / 2 + 140,
      btnY,
      "⛔ INI HOAKS",
      THEME.colors.danger,
      () => this.handleAnswer(true),
    );
  }

  createActionButton(x, y, text, color, callback, isUI = false) {
    const container = this.add.container(x, y);
    const w = 220,
      h = 60;

    const bg = this.add.graphics();
    bg.fillStyle(color, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 15);

    const shadow = this.add.graphics();
    shadow
      .fillStyle(0x000000, 0.2)
      .fillRoundedRect(-w / 2, -h / 2 + 5, w, h, 15);

    const lbl = this.add
      .text(0, 0, text, {
        fontFamily: THEME.fonts.header,
        fontSize: "18px",
        color: "#fff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    container.add([shadow, bg, lbl]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    container.on("pointerover", () => {
      this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
      bg.clear()
        .fillStyle(color, 0.8)
        .fillRoundedRect(-w / 2, -h / 2, w, h, 15);
    });

    container.on("pointerout", () => {
      this.tweens.add({ targets: container, scale: 1, duration: 100 });
      bg.clear()
        .fillStyle(color, 1)
        .fillRoundedRect(-w / 2, -h / 2, w, h, 15);
    });

    container.on("pointerdown", () => {
      // PERBAIKAN PENTING: Jika isUI=true, abaikan isProcessing check
      if (!isUI && this.isProcessing) return;

      this.tweens.add({
        targets: container,
        scale: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: callback,
      });
    });

    return container;
  }

  handleAnswer(playerChoseHoax) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const news = this.newsData[this.currentNewsIndex];
    const isCorrect = playerChoseHoax === news.isHoax;

    const points = isCorrect ? 20 : 5;
    GameState.addScore("digitalLiteracy", points);
    this.scoreText.setText(`Literasi: ${GameState.scores.digitalLiteracy}`);

    this.showFeedbackModal(isCorrect, news);
  }

  showFeedbackModal(isCorrect, news) {
    const { width, height } = this.scale;
    if (this.modalContainer) this.modalContainer.destroy();

    this.modalContainer = this.add
      .container(width / 2, height / 2)
      .setDepth(200);

    const overlay = this.add
      .rectangle(0, 0, width, height, 0x000000, 0.8)
      .setInteractive();

    const panelW = 550,
      panelH = 400;
    const panel = this.add.graphics();
    panel
      .fillStyle(0xffffff, 1)
      .fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 20);
    panel.lineStyle(6, isCorrect ? THEME.colors.success : THEME.colors.danger);
    panel.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 20);

    const statusTxt = this.add
      .text(0, -140, isCorrect ? "ANALISIS TEPAT!" : "KURANG TELITI", {
        fontFamily: THEME.fonts.header,
        fontSize: "32px",
        color: isCorrect ? THEME.colors.success : THEME.colors.danger,
        fontStyle: "900",
      })
      .setOrigin(0.5);

    const label = this.add
      .text(
        0,
        -90,
        isCorrect ? "Kamu berhasil mengenali:" : "Perhatikan tanda-tanda ini:",
        {
          fontFamily: THEME.fonts.body,
          fontSize: "14px",
          color: THEME.colors.textSub,
          fontStyle: "italic",
        },
      )
      .setOrigin(0.5);

    let clueStr = "";
    news.clues.forEach((c) => (clueStr += `• ${c}\n`));
    const cluesTxt = this.add
      .text(0, -20, clueStr, {
        fontFamily: THEME.fonts.header,
        fontSize: "18px",
        color: THEME.colors.textMain,
        fontStyle: "bold",
        align: "center",
        lineSpacing: 10,
      })
      .setOrigin(0.5);

    const feedbackBg = this.add
      .graphics()
      .fillStyle(0xf1f5f9, 1)
      .fillRoundedRect(-panelW / 2 + 30, 60, panelW - 60, 80, 10);
    const feedbackTxt = this.add
      .text(0, 100, news.feedback, {
        fontFamily: THEME.fonts.body,
        fontSize: "14px",
        color: THEME.colors.textSub,
        align: "center",
        wordWrap: { width: panelW - 80 },
      })
      .setOrigin(0.5);

    // PERBAIKAN PENTING: Tambahkan 'true' sebagai argumen terakhir agar tombol bisa diklik
    const btnNext = this.createActionButton(
      0,
      160,
      "LANJUT MATERI >>",
      THEME.colors.primary,
      () => {
        this.tweens.add({
          targets: this.modalContainer,
          scale: 0.9,
          alpha: 0,
          duration: 200,
          onComplete: () => {
            this.currentNewsIndex++;
            this.showNewsCard();
            this.modalContainer.destroy();
          },
        });
      },
      true,
    ); // <--- INI KUNCI AGAR TOMBOL BERFUNGSI

    this.modalContainer.add([
      overlay,
      panel,
      statusTxt,
      label,
      cluesTxt,
      feedbackBg,
      feedbackTxt,
      btnNext,
    ]);

    // UI UX FIX: Sembunyikan tombol jawaban agar tidak bertabrakan dengan modal
    if (this.btnFact) this.btnFact.setVisible(false);
    if (this.btnHoax) this.btnHoax.setVisible(false);

    this.modalContainer.setScale(0);
    this.tweens.add({
      targets: this.modalContainer,
      scale: 1,
      duration: 400,
      ease: "Elastic.out(1, 0.8)",
    });
  }

  // --- 5. SLOGAN PHASE ---

  startSloganPhase() {
    if (this.cardContainer) this.cardContainer.destroy();
    if (this.btnFact) this.btnFact.destroy();
    if (this.btnHoax) this.btnHoax.destroy();

    const { width, height } = this.scale;

    const title = this.add
      .text(width / 2, height * 0.15, "MISI TERAKHIR: KAMPANYE DIGITAL", {
        fontFamily: THEME.fonts.header,
        fontSize: "32px",
        color: THEME.colors.warning,
        fontStyle: "900",
        shadow: { blur: 15, color: "#b45309", fill: true },
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const subTitle = this.add
      .text(
        width / 2,
        height * 0.22,
        "Pilih strategi terbaik untuk mengajak temanmu melawan hoaks!",
        {
          fontFamily: THEME.fonts.body,
          fontSize: "16px",
          color: "#cbd5e1",
        },
      )
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: [title, subTitle],
      alpha: 1,
      y: "+=10",
      duration: 600,
    });

    const slogans = [
      {
        text: "Sebar Dulu, Baca Nanti!",
        desc: "Strategi ceroboh. Membuat orang panik tanpa fakta.",
        score: 0,
        color: THEME.colors.danger,
        icon: "❌",
      },
      {
        text: "Bodo Amat, Yang Penting Aman",
        desc: "Strategi pasif. Tidak membantu mengurangi penyebaran hoaks.",
        score: 10,
        color: "#64748b",
        icon: "😶",
      },
      {
        text: "Saring Sebelum Sharing",
        desc: "Strategi cerdas! Mengajak berpikir kritis sebelum membagikan info.",
        score: 50,
        color: THEME.colors.success,
        icon: "🛡️",
      },
    ];

    const startY = height * 0.35;
    const gap = 110;

    slogans.forEach((opt, index) => {
      this.createSloganCard(width / 2, startY + index * gap, opt, index);
    });
  }

  createSloganCard(x, y, data, index) {
    const container = this.add.container(x, y);
    const w = 550,
      h = 90;

    const bg = this.add.graphics();
    bg.fillStyle(0x1e293b, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 16);
    bg.lineStyle(2, 0x475569, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 16);

    const iconBg = this.add.circle(-w / 2 + 50, 0, 30, 0x334155);
    const iconTxt = this.add
      .text(-w / 2 + 50, 0, data.icon, { fontSize: "30px" })
      .setOrigin(0.5);

    const title = this.add
      .text(-w / 2 + 100, -15, data.text, {
        fontFamily: THEME.fonts.header,
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);

    const desc = this.add
      .text(-w / 2 + 100, 15, data.desc, {
        fontFamily: THEME.fonts.body,
        fontSize: "14px",
        color: "#94a3b8",
        fontStyle: "italic",
      })
      .setOrigin(0, 0.5);

    container.add([bg, iconBg, iconTxt, title, desc]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });
    container.setAlpha(0);

    container.on("pointerover", () => {
      this.tweens.add({ targets: container, scale: 1.03, duration: 100 });
      bg.clear()
        .fillStyle(0x334155, 1)
        .fillRoundedRect(-w / 2, -h / 2, w, h, 16);
      bg.lineStyle(3, data.color, 1).strokeRoundedRect(
        -w / 2,
        -h / 2,
        w,
        h,
        16,
      );
    });

    container.on("pointerout", () => {
      this.tweens.add({ targets: container, scale: 1, duration: 100 });
      bg.clear()
        .fillStyle(0x1e293b, 1)
        .fillRoundedRect(-w / 2, -h / 2, w, h, 16);
      bg.lineStyle(2, 0x475569, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
    });

    container.on("pointerdown", () => {
      this.input.enabled = false;
      bg.clear()
        .fillStyle(data.color, 1)
        .fillRoundedRect(-w / 2, -h / 2, w, h, 16);
      this.time.delayedCall(300, () => {
        GameState.addScore("digitalLiteracy", data.score);
        this.showLevelComplete();
      });
    });

    this.tweens.add({
      targets: container,
      alpha: 1,
      x: x,
      delay: index * 200,
      duration: 500,
      ease: "Power2",
    });
  }

  showLevelComplete() {
    this.input.enabled = true;
    GameState.completeLevel(1, 3);

    const { width, height } = this.scale;
    const finishContainer = this.add
      .container(width / 2, height / 2)
      .setDepth(200);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1e1b4b, 0x1e1b4b, 0x312e81, 0x312e81, 1);
    bg.fillRoundedRect(-300, -200, 600, 400, 30);
    bg.lineStyle(5, THEME.colors.warning, 1);
    bg.strokeRoundedRect(-300, -200, 600, 400, 30);

    const trophy = this.add
      .text(0, -90, "🏆", { fontSize: "80px" })
      .setOrigin(0.5);
    const title = this.add
      .text(0, -10, "LEVEL SELESAI!", {
        fontFamily: THEME.fonts.header,
        fontSize: "42px",
        color: THEME.colors.warning,
        fontStyle: "900",
      })
      .setOrigin(0.5);

    const scoreLabel = this.add
      .text(0, 50, `Total XP Literasi: ${GameState.scores.digitalLiteracy}`, {
        fontFamily: THEME.fonts.body,
        fontSize: "24px",
        color: "#fff",
      })
      .setOrigin(0.5);

    const btnMenu = this.createActionButton(
      -130,
      130,
      "PILIH MISI",
      0x475569,
      () => {
        this.input.enabled = true;
        this.scene.start("LevelSelectScene");
      },
      true,
    );
    btnMenu.setScale(0.8);

    const btnNext = this.createActionButton(
      130,
      130,
      "LEVEL 2 >>",
      THEME.colors.success,
      () => {
        this.input.enabled = true;
        this.scene.start("Level2");
      },
      true,
    );
    btnNext.setScale(0.8);

    finishContainer.add([bg, trophy, title, scoreLabel, btnMenu, btnNext]);
    finishContainer.setScale(0);
    this.tweens.add({
      targets: finishContainer,
      scale: 1,
      duration: 600,
      ease: "Elastic.out(1, 0.6)",
    });

    this.createConfetti(width, height);
  }

  createConfetti(w, h) {
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, w);
      const y = Phaser.Math.Between(-100, 0);
      const color = [0xfbbf24, 0x38bdf8, 0xf472b6, 0x34d399][
        Phaser.Math.Between(0, 3)
      ];
      const rect = this.add.rectangle(x, y, 10, 10, color).setDepth(199);
      this.tweens.add({
        targets: rect,
        y: h + 50,
        angle: 360,
        duration: Phaser.Math.Between(2000, 4000),
        ease: "Sine.easeInOut",
      });
    }
  }
}
