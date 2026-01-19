import { GameState } from "../../systems/GameState.js";
import { UIManager } from "../../systems/UIManager.js";

export class Level4 extends Phaser.Scene {
  constructor() {
    super("Level4Scene");
    // State untuk Poster Editor
    this.posterState = {
        color: 0xffffff,
        icon: "❤️",
        slogan: "STOP BULLYING"
    };
  }

  create() {
    const { width, height } = this.scale;
    this.uiManager = new UIManager(this);

    // --- 1. BACKGROUND & AMBIENCE ---
    this.add.image(width / 2, height / 2, "bg-level2").setDisplaySize(width, height);
    
    // Vignette Effect (Gelap di pinggir agar fokus ke tengah)
    this.add.graphics()
        .fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.8, 0.8, 0, 0)
        .fillRect(0, 0, width, height * 0.10); // Top vignette

    // --- 2. HEADER MODERN ---
    this.createHeader();

    // --- 3. MULAI GAME ---
    // Mulai dengan Fase 1
    this.startEmpathyPhase();

    // Handle resize
    this.scale.on("resize", () => {
      this.scene.restart(); // Restart agar layout kalkulasi ulang sempurna
    });
  }

  createHeader() {
    const { width, height } = this.scale;
    const safeTop = height * 0.05;
    const headerH = 60;

    // Container Header
    const headerContainer = this.add.container(0, 0);

    // Level Badge (Kiri)
    const badgeW = width * 0.35;
    const bgBadge = this.createGlassPanel(width * 0.05, safeTop + headerH/2, badgeW, headerH, 0x0f172a);
    const txtLevel = this.add.text(width * 0.08, safeTop + headerH/2, "LEVEL 4: EMPATI DIGITAL", {
        fontFamily: "Poppins", fontSize: "18px", color: "#38bdf8", fontStyle: "bold"
    }).setOrigin(0, 0.5);
    
    // Score Badge (Kanan)
    const scoreW = width * 0.2;
    const bgScore = this.add.rectangle(width * 0.95, safeTop + headerH/2, scoreW, headerH, 0x38bdf8)
        .setOrigin(1, 0.5)
        .setStrokeStyle(2, 0xffffff);
    
    // Icon Literasi (Simulasi Text Icon)
    this.add.circle(width * 0.95 - scoreW + 25, safeTop + headerH/2, 15, 0xffffff);
    this.add.text(width * 0.95 - scoreW + 25, safeTop + headerH/2, "🧠", { fontSize: "16px" }).setOrigin(0.5);

    this.scoreText = this.add.text(width * 0.92, safeTop + headerH/2, `${GameState.scores.digitalLiteracy}`, {
        fontFamily: "Poppins", fontSize: "24px", color: "#0f172a", fontStyle: "bold"
    }).setOrigin(1, 0.5);

    headerContainer.add([bgBadge, txtLevel, bgScore, this.scoreText]);
  }

  // --- HELPER: MEMBUAT PANEL KACA (Glassmorphism) ---
  createGlassPanel(x, y, w, h, color = 0x1e293b, alpha = 0.8) {
    const panel = this.add.rectangle(x, y, w, h, color, alpha)
        .setStrokeStyle(1, 0xffffff, 0.3)
        .setOrigin(0, 0.5); // Default origin left-center
    
    // Efek Shadow halus
    this.add.rectangle(x + 4, y + 4, w, h, 0x000000, 0.3).setOrigin(0, 0.5);
    
    return panel;
  }

  // =================================================================
  // FASE 1: CHAT SIMULATOR (Layout Messenger App)
  // =================================================================
  startEmpathyPhase() {
    const { width, height } = this.scale;
    this.phase1Container = this.add.container(0, 0);

    // Judul Konteks
    const lblContext = this.add.text(width/2, height * 0.18, "Grup Chat Kelas X-A", {
        fontFamily: "Inter", fontSize: "14px", color: "#94a3b8"
    }).setOrigin(0.5);

    // --- 1. CHAT BUBBLE KORBAN ---
    const bubbleW = Math.min(width * 0.8, 500);
    const bubbleH = 120;
    const chatX = width/2;
    const chatY = height * 0.3;

    // Avatar Pengirim
    const avatar = this.add.circle(chatX - bubbleW/2, chatY - 40, 25, 0xfca5a5);
    const avatarTxt = this.add.text(chatX - bubbleW/2, chatY - 40, "A", { fontSize: "20px", color: "#7f1d1d", fontStyle:"bold" }).setOrigin(0.5);

    // Nama Pengirim
    const senderName = this.add.text(chatX - bubbleW/2 + 40, chatY - 60, "Andi (Teman Sekelas)", {
        fontFamily: "Inter", fontSize: "12px", color: "#cbd5e1"
    });

    // Box Chat
    const bgChat = this.add.graphics();
    bgChat.fillStyle(0x334155, 1);
    bgChat.fillRoundedRect(chatX - bubbleW/2 + 35, chatY - 40, bubbleW - 40, bubbleH, { tl: 0, tr: 16, bl: 16, br: 16 });
    
    const msg = '"Aku dibilang jelek dan bodoh sama kakak kelas di kolom komentar... Rasanya aku mau hapus akun aja sekarang. Malu banget 😭"';
    const txtChat = this.add.text(chatX - bubbleW/2 + 55, chatY - 20, msg, {
        fontFamily: "Inter", fontSize: "16px", color: "#ffffff", 
        wordWrap: { width: bubbleW - 80 }, lineSpacing: 5
    });

    this.phase1Container.add([lblContext, avatar, avatarTxt, senderName, bgChat, txtChat]);

    // --- 2. OPSI JAWABAN (Cards Layout) ---
    const options = [
      { text: "Halah lebay, gitu doang baper.", score: -10, feedback: "KURANG TEPAT! Ini minim empati.", color: 0xef4444 },
      { text: "Jangan sedih, ayo kita lapor ke BK bareng.", score: 30, feedback: "BAGUS! Solutif & Mendukung.", color: 0x22c55e },
      { text: "Wkwk, emang komennya lucu sih.", score: -20, feedback: "BURUK! Kamu ikut mem-bully.", color: 0xf59e0b },
    ];

    let startY = height * 0.55;
    const btnH = 60;
    const gap = 15;

    options.forEach((opt, index) => {
        const btnContainer = this.add.container(width/2, startY + (index * (btnH + gap)));
        
        // Base Button
        const btnBg = this.add.rectangle(0, 0, Math.min(width * 0.85, 550), btnH, 0x1e293b)
            .setStrokeStyle(1, 0x475569)
            .setInteractive({ useHandCursor: true });
        
        // Text
        const btnTxt = this.add.text(0, 0, opt.text, {
            fontFamily: "Inter", fontSize: "16px", color: "#e2e8f0"
        }).setOrigin(0.5);

        // Hover Effect & Click
        btnBg.on('pointerover', () => {
            btnBg.setFillStyle(0x334155);
            btnBg.setStrokeStyle(2, 0x38bdf8);
            this.tweens.add({ targets: btnContainer, scaleX: 1.02, scaleY: 1.02, duration: 100 });
        });

        btnBg.on('pointerout', () => {
            btnBg.setFillStyle(0x1e293b);
            btnBg.setStrokeStyle(1, 0x475569);
            this.tweens.add({ targets: btnContainer, scaleX: 1, scaleY: 1, duration: 100 });
        });

        btnBg.on('pointerdown', () => {
            this.handleResponse(opt);
        });

        btnContainer.add([btnBg, btnTxt]);
        this.phase1Container.add(btnContainer);
    });
  }

  handleResponse(opt) {
    GameState.scores.problemSolving += opt.score;
    
    // Hapus UI Chat dengan animasi fade out
    this.tweens.add({
        targets: this.phase1Container,
        alpha: 0,
        duration: 300,
        onComplete: () => {
            this.phase1Container.destroy();
            this.showTransitionFeedback(opt.feedback);
        }
    });
  }

  showTransitionFeedback(msg) {
    const { width, height } = this.scale;
    
    const bg = this.add.rectangle(width/2, height/2, width, 150, 0x000000, 0.8);
    const txt = this.add.text(width/2, height/2, msg, {
        fontFamily: "Poppins", fontSize: "24px", color: "#facc15", align: "center", fontStyle: "bold",
        wordWrap: { width: width * 0.8 }
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
        targets: txt, alpha: 1, scale: 1.2, duration: 500, yoyo: true, hold: 1500,
        onComplete: () => {
            bg.destroy();
            txt.destroy();
            this.startPosterPhase();
        }
    });
  }

  // =================================================================
  // FASE 2: POSTER DESIGN STUDIO (REVISI UI: CLEAN LOOK)
  // =================================================================
  startPosterPhase() {
    const { width, height } = this.scale;
    
    // Hapus container fase sebelumnya jika masih ada
    if (this.phase1Container) this.phase1Container.destroy();
    
    this.phase2Container = this.add.container(0, 0);

    // Judul Fase (Lebih ke atas sedikit)
    const title = this.add.text(width/2, height * 0.12, "DESIGN STUDIO: KAMPANYE POSITIF", {
        fontFamily: "Poppins", fontSize: "18px", color: "#94a3b8", letterSpacing: 2
    }).setOrigin(0.5);
    this.phase2Container.add(title);

    // --- 1. PREVIEW AREA (AREA TENGAH) ---
    const canvasY = height * 0.42; // Sedikit turun agar center
    const canvasW = Math.min(width * 0.7, 400);
    const canvasH = canvasW * 0.7; // Aspect ratio landscape

    // [PERBAIKAN] MENGHAPUS HARD SHADOW HITAM
    // Ganti dengan: Frame Glow Halus (Aura putih transparan)
    const glowFrame = this.add.rectangle(width/2, canvasY, canvasW + 20, canvasH + 20, 0xffffff, 0.1)
        .setStrokeStyle(1, 0xffffff, 0.3)
        .setOrigin(0.5);
    
    // Canvas Background Utama
    this.posterBgObj = this.add.rectangle(width/2, canvasY, canvasW, canvasH, this.posterState.color)
        .setStrokeStyle(2, 0xffffff); // Border putih solid agar tegas
    
    // Canvas Icon
    this.posterIconObj = this.add.text(width/2, canvasY - 30, this.posterState.icon, { fontSize: "64px" }).setOrigin(0.5);
    
    // Canvas Slogan
    this.posterSloganObj = this.add.text(width/2, canvasY + 50, this.posterState.slogan, {
        fontFamily: "Poppins", fontSize: "20px", color: "#000000", fontStyle: "bold", align: "center",
        wordWrap: { width: canvasW - 20 }
    }).setOrigin(0.5);

    this.phase2Container.add([glowFrame, this.posterBgObj, this.posterIconObj, this.posterSloganObj]);

    // --- 2. CONTROL DECK (AREA BAWAH) ---
    this.createControlDeck(width, height);
  }

  createControlDeck(width, height) {
    // Panel dibuat "Floating" (melayang) tidak menempel kaku di bawah
    const panelH = height * 0.3; 
    const panelY = height - (panelH / 2) - 20; // Ada gap 20px dari bawah layar
    const panelW = width * 0.95; // Tidak full width, ada gap kiri kanan

    // Background Panel: Glassmorphism Gelap
    const bgPanel = this.add.graphics();
    bgPanel.fillStyle(0x0f172a, 0.9); // Warna biru gelap transparan
    bgPanel.lineStyle(1, 0x38bdf8, 1); // Border biru neon tipis
    bgPanel.fillRoundedRect((width - panelW)/2, height - panelH - 10, panelW, panelH, 20); // Rounded corners
    bgPanel.strokeRoundedRect((width - panelW)/2, height - panelH - 10, panelW, panelH, 20);

    this.phase2Container.add(bgPanel);

    // Grid System Layout
    const colW = panelW / 3;
    const startX = (width - panelW)/2; // Titik mulai X (kiri panel)
    const startY = height - panelH + 20; // Titik mulai Y (atas panel konten)

    // --- KOLOM 1: WARNA (KIRI) ---
    const labelColor = this.add.text(startX + colW * 0.5, startY, "BACKGROUND", { 
        fontSize: "11px", color: "#94a3b8", fontFamily: "Inter", fontStyle:"bold" 
    }).setOrigin(0.5);
    this.phase2Container.add(labelColor);

    const colors = [0xffffff, 0xfca5a5, 0x86efac, 0x93c5fd];
    colors.forEach((col, i) => {
        const itemX = (startX + colW * 0.5) - 45 + (i * 30);
        const circle = this.add.circle(itemX, startY + 35, 10, col)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(1, 0xffffff);
        
        circle.on('pointerdown', () => {
            this.posterBgObj.setFillStyle(col);
            this.tweens.add({ targets: circle, scale: 1.3, duration: 100, yoyo: true });
        });
        this.phase2Container.add(circle);
    });

    // --- KOLOM 2: ICON (TENGAH) ---
    const labelIcon = this.add.text(startX + colW * 1.5, startY, "STICKER", { 
        fontSize: "11px", color: "#94a3b8", fontFamily: "Inter", fontStyle:"bold" 
    }).setOrigin(0.5);
    this.phase2Container.add(labelIcon);

    const icons = ["❤️", "🛡️", "🤝", "🚫"];
    icons.forEach((ico, i) => {
        const itemX = (startX + colW * 1.5) - 60 + (i * 40);
        const txt = this.add.text(itemX, startY + 35, ico, { fontSize: "24px" })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        
        txt.on('pointerdown', () => {
            this.posterIconObj.setText(ico);
            this.tweens.add({ targets: txt, scale: 1.3, duration: 100, yoyo: true });
        });
        this.phase2Container.add(txt);
    });

    // --- KOLOM 3: SLOGAN (KANAN) ---
    const labelMsg = this.add.text(startX + colW * 2.5, startY, "PESAN", { 
        fontSize: "11px", color: "#94a3b8", fontFamily: "Inter", fontStyle:"bold" 
    }).setOrigin(0.5);
    this.phase2Container.add(labelMsg);

    const slogans = ["Stop Bullying", "Sebar Kebaikan", "Kita Bersaudara"];
    slogans.forEach((txt, i) => {
        const btnY = startY + 30 + (i * 28);
        const btn = this.add.rectangle(startX + colW * 2.5, btnY, colW * 0.8, 22, 0x1e293b)
            .setStrokeStyle(1, 0x475569)
            .setInteractive({ useHandCursor: true });
        
        const label = this.add.text(startX + colW * 2.5, btnY, txt, {
            fontSize: "10px", color: "#cbd5e1", fontFamily: "Inter"
        }).setOrigin(0.5);

        btn.on('pointerdown', () => {
            this.posterSloganObj.setText(txt);
            btn.setStrokeStyle(1, 0x38bdf8); // Highlight active
            label.setColor("#38bdf8");
            
            // Reset button lain (visual logic sederhana)
            this.time.delayedCall(100, () => {
                btn.setStrokeStyle(1, 0x475569);
                label.setColor("#cbd5e1");
            });

            if (i === 1) GameState.scores.creativeThinking = Math.max(GameState.scores.creativeThinking, 50);
        });

        this.phase2Container.add([btn, label]);
    });

    // --- TOMBOL FINISH (Floating Button di Kanan Bawah Layar) ---
    // Di luar panel kontrol agar tidak sempit
    const finishBtn = this.add.circle(width - 40, height - 140, 30, 0x38bdf8)
        .setInteractive({ useHandCursor: true });
    
    // Efek Shadow pada tombol
    this.add.circle(width - 40, height - 138, 30, 0x000000, 0.3); // Soft shadow tombol
    finishBtn.setDepth(10); // Pastikan tombol di paling atas

    const iconCheck = this.add.text(width - 40, height - 140, "✔", { fontSize: "24px", color: "#0f172a", fontStyle:"bold" }).setOrigin(0.5).setDepth(11);
    
    // Animasi denyut (pulse)
    this.tweens.add({ targets: finishBtn, scale: 1.1, duration: 800, yoyo: true, repeat: -1 });

    finishBtn.on('pointerdown', () => this.finishLevel());
    this.phase2Container.add([finishBtn, iconCheck]);
  }

  finishLevel() {
    const { width, height } = this.scale;
    GameState.scores.creativeThinking += 50; // Base score finish

    // Overlay Upload Process
    const overlay = this.add.rectangle(width/2, height/2, width, height, 0x0f172a, 0.9);
    const spinner = this.add.text(width/2, height/2 - 20, "⚡", { fontSize: "40px" }).setOrigin(0.5);
    const txt = this.add.text(width/2, height/2 + 30, "Mencetak Poster...", { fontFamily: "Inter", color: "#38bdf8" }).setOrigin(0.5);

    this.tweens.add({ targets: spinner, angle: 360, duration: 1000, repeat: 2 });

    this.time.delayedCall(2000, () => {
        overlay.destroy();
        spinner.destroy();
        txt.destroy();
        this.showLevelSummary();
    });
  }

  showLevelSummary() {
    const { width, height } = this.scale;
    
    // Modal Container
    const modal = this.add.container(width/2, height/2).setScale(0);
    
    // Background Modal (Putih/Terang untuk kontras)
    const bg = this.add.rectangle(0, 0, width * 0.85, height * 0.5, 0x1e293b).setStrokeStyle(2, 0x38bdf8);
    
    const title = this.add.text(0, -80, "MISI SELESAI!", {
        fontFamily: "Poppins", fontSize: "28px", color: "#4ade80", fontStyle: "bold"
    }).setOrigin(0.5);

    const summaryText = `
    ✅ Chat Empati: Tuntas
    ✅ Desain Poster: Terbit
    
    Karaktermu semakin bijak!
    `;
    
    const body = this.add.text(0, 0, summaryText, {
        fontFamily: "Inter", fontSize: "16px", color: "#cbd5e1", align: "center", lineSpacing: 8
    }).setOrigin(0.5);

    // Button Next
    const btnNext = this.add.rectangle(0, 90, 180, 45, 0x38bdf8).setInteractive({ useHandCursor: true });
    const txtNext = this.add.text(0, 90, "LIHAT RAPOR", { fontSize: "16px", color: "#0f172a", fontStyle: "bold" }).setOrigin(0.5);
    
    btnNext.on('pointerdown', () => this.scene.start("ResultScene"));

    modal.add([bg, title, body, btnNext, txtNext]);

    this.tweens.add({
        targets: modal,
        scale: 1,
        ease: 'Back.out',
        duration: 400
    });
  }
}