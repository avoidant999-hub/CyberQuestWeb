import { GameState } from "../../systems/GameState.js";
import { UIManager } from "../../systems/UIManager.js";

export class Level3 extends Phaser.Scene {
  constructor() {
    super("Level3Scene");
    this.reputation = 100;
  }

  create() {
    const { width, height } = this.scale;
    
    // Safety Init
    try { this.uiManager = new UIManager(this); } 
    catch (e) { console.warn("UI Manager missing"); }

    // --- 1. BACKGROUND ---
    if (this.textures.exists("bg-level2")) {
        this.add.image(width / 2, height / 2, "bg-level2").setDisplaySize(width, height);
    } else {
        this.add.rectangle(width/2, height/2, width, height, 0x0f172a);
    }

    // Overlay Gelap untuk fokus ke Feed
    this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.3);

    // --- 2. HEADER & HUD ---
    const getFont = (type, def) => this.uiManager?.getFontSize ? this.uiManager.getFontSize(type) : def;
    const headerY = height * 0.12;

    // Header
    this.add.text(width * 0.05, headerY, "LEVEL 3: JEJAK DIGITAL", {
      fontFamily: "Poppins", fontSize: (getFont("heading", 24) * 0.8) + "px",
      fontStyle: "bold", color: "#38bdf8",
      shadow: { blur: 5, color: "#0ea5e9", fill: true }
    }).setOrigin(0, 0.5); // Set origin Y ke tengah agar rapi

    // Score
    this.scoreText = this.add.text(width * 0.95, headerY, `Literasi: ${GameState.scores.digitalLiteracy}`, {
      fontFamily: "Inter", fontSize: getFont("button", 18) + "px", color: "#fff", 
      backgroundColor: "#1e293b", padding: {x:12, y:6}
    }).setOrigin(1, 0.5); // Set origin Y ke tengah

    // --- 3. REPUTATION BAR (Dynamic) ---
    this.createReputationUI();

    // --- 4. SCENARIO DATA ---
    this.scenarios = [
      {
        user: "@Si_Pengganggu",
        avatarColor: 0xef4444, // Merah
        content: "Haha, lihat nih foto aib si Budi waktu tidur di kelas! 🤣 #malu #viral",
        choices: [
          { text: "Ikut ketawa & Repost", impact: -30, feedback: "BAHAYA! Kamu menyebarkan bullying. Jejak digitalmu buruk." },
          { text: "Lapor (Report) & Tegur", impact: 10, feedback: "BAGUS! Kamu berani menghentikan perundungan." }
        ]
      },
      {
        user: "@Giveaway_Sultan",
        avatarColor: 0xfacc15, // Kuning
        content: "SELAMAT! Kamu menang iPhone 15 Pro Max. Kirim foto KTP & KK ke DM sekarang! 🎁",
        choices: [
          { text: "Langsung kirim data", impact: -50, feedback: "BERBAHAYA! Itu modus pencurian identitas (Phishing)." },
          { text: "Abaikan & Blokir", impact: 10, feedback: "TEPAT! Data pribadi harus dilindungi." }
        ]
      },
      {
        user: "@Bestie_Curhat",
        avatarColor: 0xd946ef, // Pink
        content: "Aku benci banget sama guru Matematika. Besok kita bolos bareng yuk! 😡",
        choices: [
          { text: "Setuju! Gas bolos!", impact: -20, feedback: "HATI-HATI. Postingan negatif bisa dilihat sekolah/HRD nanti." },
          { text: "Nasihati lewat DM", impact: 10, feedback: "BIJAK! Menjaga etika komunikasi privat itu penting." }
        ]
      }
    ];

    this.currentScenarioIndex = 0;
    this.showScenario();

    // Resize Handler
    this.scale.on("resize", () => {
       if(this.uiManager?.calculateMetrics) this.uiManager.calculateMetrics();
    });
  }

  createReputationUI() {
    const { width, height } = this.scale;
    const barW = Math.min(400, width * 0.5);
    const barH = 20;

    // Tentukan posisi Y baru: Header ada di 0.12, kita taruh ini di 0.22 (Jarak aman)
    const startY = height * 0.22;

    // Label
    this.add.text(width / 2, startY, "Reputasi Digital", {
        fontFamily: "Inter", fontSize: "14px", color: "#94a3b8"
    }).setOrigin(0.5);

    // Container Bar (Turun sedikit dari label)
    this.repBarContainer = this.add.container(width / 2, startY + 30);

    // Background Bar
    const bg = this.add.graphics();
    bg.fillStyle(0x334155, 1);
    bg.fillRoundedRect(-barW/2, -barH/2, barW, barH, 10);
    
    // Fill Bar
    this.repBarFill = this.add.graphics();
    this.updateRepBarVisual(barW, barH); 

    this.repBarContainer.add([bg, this.repBarFill]);
    this.barConfig = { w: barW, h: barH };
  }

  updateRepBarVisual(w, h) {
    this.repBarFill.clear();
    
    // Warna berubah: Hijau (>70), Kuning (40-70), Merah (<40)
    let color = 0x22c55e;
    if (this.reputation < 40) color = 0xef4444;
    else if (this.reputation < 70) color = 0xfacc15;

    this.repBarFill.fillStyle(color, 1);
    
    // Clamp 0-100
    const pct = Math.max(0, Math.min(100, this.reputation)) / 100;
    this.repBarFill.fillRoundedRect(-w/2, -h/2, w * pct, h, 10);
  }

  showScenario() {
    if (this.currentScenarioIndex >= this.scenarios.length) {
      this.finishLevel();
      return;
    }

    const { width, height } = this.scale;
    const data = this.scenarios[this.currentScenarioIndex];

    // --- CARD CONTAINER (Social Media Style) ---
    // Gunakan width yang responsif tapi max 500px agar terlihat seperti HP
    const cardW = Math.min(500, width * 0.85); 
    const cardH = 320;
    
    this.feedContainer = this.add.container(width / 2, height * 0.58);

    // 1. Card Background
    const bg = this.add.graphics();
    bg.fillStyle(0x1e293b, 1); // Dark Slate Blue
    bg.fillRoundedRect(-cardW/2, -cardH/2, cardW, cardH, 16);
    bg.lineStyle(2, 0x475569, 1);
    bg.strokeRoundedRect(-cardW/2, -cardH/2, cardW, cardH, 16);

    // 2. User Info (Avatar & Name)
    const avatar = this.add.circle(-cardW/2 + 40, -cardH/2 + 40, 24, data.avatarColor);
    const userInitial = this.add.text(-cardW/2 + 40, -cardH/2 + 40, data.user[1], { // Huruf pertama
        fontSize: "20px", fontStyle:"bold", color: "#fff"
    }).setOrigin(0.5);
    
    const username = this.add.text(-cardW/2 + 80, -cardH/2 + 40, data.user, {
        fontFamily: "Inter", fontSize: "18px", color: "#fff", fontStyle: "bold"
    }).setOrigin(0, 0.5);

    // 3. Content Text
    const content = this.add.text(0, -20, data.content, {
        fontFamily: "Inter", fontSize: "20px", color: "#e2e8f0", 
        align: "center", wordWrap: { width: cardW - 60 }
    }).setOrigin(0.5);

    // 4. Action Buttons (Grid Layout)
    const btnY = cardH/2 - 50;
    const btnGap = 20;
    const btnW = (cardW - 60 - btnGap) / 2; // Bagi dua kolom

    this.feedContainer.add([bg, avatar, userInitial, username, content]);

    data.choices.forEach((choice, idx) => {
        // Posisi X: Kiri atau Kanan
        const btnX = idx === 0 ? -(btnW/2 + btnGap/2) : (btnW/2 + btnGap/2);
        
        const btn = this.add.container(btnX, btnY);
        
        // Btn Graphics
        const bBg = this.add.graphics();
        bBg.fillStyle(0x334155, 1);
        bBg.fillRoundedRect(-btnW/2, -30, btnW, 60, 12);
        bBg.lineStyle(2, 0x38bdf8, 1); // Border Cyan
        bBg.strokeRoundedRect(-btnW/2, -30, btnW, 60, 12);

        const bTxt = this.add.text(0, 0, choice.text, {
            fontFamily: "Inter", fontSize: "14px", color: "#fff", align:"center",
            wordWrap: { width: btnW - 20 }
        }).setOrigin(0.5);

        // Zone Interaktif
        const zone = this.add.zone(0,0, btnW, 60).setInteractive({useHandCursor:true});
        
        btn.add([bBg, bTxt, zone]);
        this.feedContainer.add(btn);

        // Events
        zone.on('pointerover', () => {
            this.tweens.add({ targets: btn, scale: 1.05, duration: 100 });
            bBg.clear(); bBg.fillStyle(0x38bdf8, 1); bBg.fillRoundedRect(-btnW/2, -30, btnW, 60, 12);
            bTxt.setColor("#0f172a"); // Text jadi gelap
        });

        zone.on('pointerout', () => {
            this.tweens.add({ targets: btn, scale: 1, duration: 100 });
            bBg.clear(); bBg.fillStyle(0x334155, 1); bBg.fillRoundedRect(-btnW/2, -30, btnW, 60, 12);
            bBg.lineStyle(2, 0x38bdf8, 1); bBg.strokeRoundedRect(-btnW/2, -30, btnW, 60, 12);
            bTxt.setColor("#fff");
        });

        zone.on('pointerdown', () => this.handleChoice(choice));
    });

    // Animasi Muncul Pop-up
    this.feedContainer.setScale(0);
    this.tweens.add({ targets: this.feedContainer, scale: 1, duration: 400, ease: 'Back.out' });
  }

  handleChoice(choice) {
    // 1. Update Reputasi
    this.reputation += choice.impact;
    if (this.reputation > 100) this.reputation = 100;
    if (this.reputation < 0) this.reputation = 0;

    // 2. Animate Bar
    this.updateRepBarVisual(this.barConfig.w, this.barConfig.h);

    // 3. Show Feedback Modal
    this.showFeedback(choice.impact > 0, choice.feedback);
  }

  showFeedback(isGood, message) {
    const { width, height } = this.scale;
    
    // Destroy feed lama
    this.feedContainer.destroy();

    const modal = this.add.container(0, 0).setDepth(100);
    const dimmer = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.8).setInteractive();

    const panelW = Math.min(500, width * 0.9);
    const panelH = 300;
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 1);
    bg.fillRoundedRect(width/2 - panelW/2, height/2 - panelH/2, panelW, panelH, 20);
    bg.lineStyle(4, isGood ? 0x22c55e : 0xef4444, 1);
    bg.strokeRoundedRect(width/2 - panelW/2, height/2 - panelH/2, panelW, panelH, 20);

    const titleTxt = isGood ? "👍 REPUTASI AMAN" : "📉 REPUTASI TURUN";
    const title = this.add.text(width/2, height/2 - 60, titleTxt, {
        fontFamily: "Poppins", fontSize: "28px", fontStyle: "bold",
        color: isGood ? "#4ade80" : "#f87171"
    }).setOrigin(0.5);

    const desc = this.add.text(width/2, height/2 + 10, message, {
        fontFamily: "Inter", fontSize: "18px", color: "#e2e8f0", align: "center",
        wordWrap: { width: panelW - 60 }
    }).setOrigin(0.5);

    // Tombol Lanjut
    const btnContainer = this.add.container(width/2, height/2 + 100);
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x38bdf8, 1);
    btnBg.fillRoundedRect(-100, -25, 200, 50, 12);
    
    const btnLbl = this.add.text(0, 0, "LANJUT >>", {
        fontFamily: "Poppins", fontSize: "16px", color: "#0f172a", fontStyle: "bold"
    }).setOrigin(0.5);

    const zone = this.add.zone(0,0,200,50).setInteractive({useHandCursor:true});
    btnContainer.add([btnBg, btnLbl, zone]);

    zone.on('pointerdown', () => {
        if (this.reputation <= 0) this.gameOver();
        else {
            modal.destroy();
            this.currentScenarioIndex++;
            this.showScenario();
        }
    });

    modal.add([dimmer, bg, title, desc, btnContainer]);
    
    modal.setScale(0);
    this.tweens.add({ targets: modal, scale: 1, duration: 300, ease: 'Back.out' });
  }

  gameOver() {
      alert("GAME OVER! Reputasi digitalmu terlalu rendah.");
      this.scene.start("MenuScene");
  }

  finishLevel() {
    GameState.scores.digitalLiteracy += 20;
    GameState.scores.problemSolving += Math.floor(this.reputation / 2);
    this.scene.start("Level4Scene");
  }

  shutdown() { this.scale.off("resize"); }
}