import { GameState } from "../../systems/GameState.js";
import { UIManager } from "../../systems/UIManager.js";

// --- TEMA PROFESIONAL (CYBER DARK) ---
const THEME = {
  colors: {
    bgDark: 0x020617,      // Latar belakang sangat gelap
    panelGlass: 0x1e293b,  // Panel semi-transparan
    primary: 0x38bdf8,     // Cyan Neon (Fokus)
    accent: 0x6366f1,      // Indigo (Sekunder)
    success: 0x10b981,     // Hijau (Benar)
    danger: 0xf43f5e,      // Merah (Salah)
    warning: 0xf59e0b,     // Kuning (Warning)
    textWhite: "#ffffff",  // Teks Utama (Wajib Putih)
    textGray: "#94a3b8"    // Teks Placeholder/Non-aktif
  },
  fonts: {
    header: "Poppins",
    body: "Inter",
    code: "Courier New",
  },
};

export class Level2 extends Phaser.Scene {
  constructor() {
    super("Level2");
  }

  // --- 1. INITIALIZATION ---

  init() {
    this.currentPassword = "";
    this.maxChars = 16;
    this.isCursorVisible = true;
    this.gameActive = true;
    this.isProcessing = false;

    this.validationState = {
      length: false, upper: false, number: false, symbol: false,
    };

    this.modalContainer = null;

    // Reset Input HTML (Mobile Keyboard Fix)
    this.externalInput = document.getElementById("hidden-input");
    if (this.externalInput) {
      this.externalInput.value = "";
      this.externalInput.blur();
    }
  }

  create() {
    const { width, height } = this.scale;
    try { this.uiManager = new UIManager(this); } catch (e) {}

    // 1. Background
    this.createBackground(width, height);

    // 2. Header (HUD) - Fixed di Atas
    this.createHeader(width, height);

    // 3. Main Content (Responsive Card Layout)
    this.createMainLayout(width, height);

    // 4. Input System
    this.setupUnifiedInput();

    // Cursor Blink Animation
    this.time.addEvent({
      delay: 500, loop: true,
      callback: () => {
        this.isCursorVisible = !this.isCursorVisible;
        this.updateInputDisplay();
      },
    });

    this.scale.on("resize", () => this.scene.restart());
  }

  // --- 2. BACKGROUND SYSTEM ---

  createBackground(width, height) {
    if (this.textures.exists("bg-level2")) {
        const bg = this.add.image(width / 2, height / 2, "bg-level2");
        const scale = Math.max(width / bg.width, height / bg.height);
        bg.setScale(scale);
    } else {
        const bg = this.add.graphics();
        bg.fillGradientStyle(THEME.colors.bgDark, THEME.colors.bgDark, 0x0f172a, 0x0f172a, 1);
        bg.fillRect(0, 0, width, height);
    }

    // Overlay Gelap (PENTING: Agar teks terbaca jelas di atas gambar)
    this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7);

    // Grid Hiasan
    this.add.grid(width/2, height/2, width, height, 60, 60, 0xffffff, 0, THEME.colors.primary, 0.05);
  }

  // --- 3. HEADER SYSTEM (FIXED TEXT VISIBILITY) ---

  createHeader(width, height) {
    const headerH = 80;
    
    // Header Bar Background (Glass)
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x0f172a, 0.9); // Hampir solid
    headerBg.fillRect(0, 0, width, headerH);
    headerBg.lineStyle(1, 0x334155);
    headerBg.lineBetween(0, headerH, width, headerH);

    // Tombol Keluar (Kiri)
    this.createExitButton(80, headerH/2);

    // Judul Level (Tengah) - WARNA PUTIH MUTLAK
    this.add.text(width / 2, headerH / 2, "LEVEL 2: BENTENG SANDI", {
        fontFamily: THEME.fonts.header, 
        fontSize: "24px", 
        color: THEME.colors.textWhite, // Putih
        fontStyle: "900",
        stroke: "#000000", // Outline Hitam
        strokeThickness: 3,
        shadow: { blur: 10, color: THEME.colors.primary, fill: true } // Glow Biru
    }).setOrigin(0.5);

    // Literasi Score (Kanan) - WARNA PUTIH MUTLAK
    const scoreBg = this.add.graphics();
    scoreBg.fillStyle(THEME.colors.warning, 0.2);
    scoreBg.fillRoundedRect(width - 160, headerH/2 - 15, 140, 30, 15);
    
    this.add.text(width - 90, headerH / 2, `XP: ${GameState.scores.digitalLiteracy}`, {
        fontFamily: THEME.fonts.body, 
        fontSize: "16px", 
        color: THEME.colors.textWhite, // Putih
        fontStyle: "bold"
    }).setOrigin(0.5);
  }

  createExitButton(x, y) {
    const btn = this.add.container(x, y).setDepth(100);
    const bg = this.add.graphics();
    
    const drawBtn = (color) => {
        bg.clear().fillStyle(color, 1).fillRoundedRect(-50, -20, 100, 40, 10);
    };
    drawBtn(THEME.colors.danger);

    const txt = this.add.text(0, 0, "KELUAR", {
        fontFamily: THEME.fonts.header, fontSize: "12px", fontStyle: "bold", color: "#fff"
    }).setOrigin(0.5);

    btn.add([bg, txt]);
    btn.setInteractive(new Phaser.Geom.Rectangle(-50, -20, 100, 40), Phaser.Geom.Rectangle.Contains)
       .on('pointerover', () => { this.tweens.add({targets: btn, scale: 1.05, duration: 100}); drawBtn(0xff6b81); })
       .on('pointerout', () => { this.tweens.add({targets: btn, scale: 1, duration: 100}); drawBtn(THEME.colors.danger); })
       .on('pointerdown', () => this.scene.start("LevelSelectScene"));
  }

  // --- 4. MAIN LAYOUT (CARD SYSTEM) ---

  createMainLayout(width, height) {
    // Ukuran Panel Responsif
    const panelW = Math.min(600, width * 0.9);
    const panelH = Math.min(500, height * 0.7);
    const panelX = width / 2;
    const panelY = height / 2 + 30; // Sedikit turun dari header

    // Container Utama (Semua elemen UI masuk sini agar rapi)
    this.mainContainer = this.add.container(panelX, panelY);

    // 1. Panel Background (Glassmorphism)
    const bg = this.add.graphics();
    bg.fillStyle(THEME.colors.panelGlass, 0.85); // Semi transparan
    bg.fillRoundedRect(-panelW/2, -panelH/2, panelW, panelH, 24);
    bg.lineStyle(2, 0x334155); // Border halus
    bg.strokeRoundedRect(-panelW/2, -panelH/2, panelW, panelH, 24);
    
    this.mainContainer.add(bg);

    // 2. Judul Instruksi
    const title = this.add.text(0, -panelH/2 + 40, "RAKIT PASSWORD KUAT", {
        fontFamily: THEME.fonts.header, fontSize: "28px", fontStyle: "bold", color: THEME.colors.textWhite
    }).setOrigin(0.5);
    
    const subtitle = this.add.text(0, -panelH/2 + 75, "Kombinasikan Huruf Besar, Angka, & Simbol", {
        fontFamily: THEME.fonts.body, fontSize: "14px", color: THEME.colors.textGray
    }).setOrigin(0.5);

    this.mainContainer.add([title, subtitle]);

    // 3. Input Field (Posisi relatif terhadap panel)
    this.createInputFieldInPanel(0, -30, panelW * 0.8);

    // 4. Validation Grid (Posisi relatif)
    this.createValidationGridInPanel(0, 70, panelW * 0.9);

    // 5. Submit Button (Posisi Bawah Panel)
    this.createSubmitButtonInPanel(0, panelH/2 - 50);
  }

  createInputFieldInPanel(x, y, width) {
    const height = 60;
    
    // Input BG
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.5).fillRoundedRect(x - width/2, y - height/2, width, height, 12);
    
    // Border (Disimpan ref-nya untuk animasi fokus)
    this.inputBorder = this.add.graphics();
    this.inputBorder.lineStyle(2, 0x475569).strokeRoundedRect(x - width/2, y - height/2, width, height, 12);

    // Teks Password
    this.inputTextObj = this.add.text(x, y, "|", {
        fontFamily: THEME.fonts.code, fontSize: "24px", color: THEME.colors.textWhite, fontStyle: "bold"
    }).setOrigin(0.5);

    // Placeholder
    this.placeholderText = this.add.text(x, y, "Ketuk untuk mengetik...", {
        fontFamily: THEME.fonts.body, fontSize: "16px", color: "#475569", fontStyle: "italic"
    }).setOrigin(0.5);

    // Strength Meter (Baris di bawah input)
    this.strengthBarFill = this.add.rectangle(x - width/2, y + height/2 + 5, 0, 4, THEME.colors.danger).setOrigin(0, 0.5);
    const strengthBg = this.add.rectangle(x, y + height/2 + 5, width, 4, 0x334155).setDepth(-1);

    // Hit Area
    const hit = this.add.rectangle(x, y, width, height, 0xff0000, 0).setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => {
        if(this.externalInput) this.externalInput.focus();
        this.inputBorder.clear().lineStyle(2, THEME.colors.primary).strokeRoundedRect(x - width/2, y - height/2, width, height, 12);
    });

    this.mainContainer.add([bg, this.inputBorder, this.placeholderText, this.inputTextObj, strengthBg, this.strengthBarFill, hit]);
    this.inputBoxWidth = width; // Simpan untuk animasi bar
  }

  createValidationGridInPanel(x, y, width) {
    const criteria = [
      { key: "length", label: "8+ Karakter" },
      { key: "upper", label: "Huruf Besar" },
      { key: "number", label: "Angka (0-9)" },
      { key: "symbol", label: "Simbol (!@#)" },
    ];

    this.indicators = {};
    const itemW = width / 2 - 10; // 2 Kolom
    const itemH = 45;
    const gap = 15;

    criteria.forEach((c, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        
        const posX = (col === 0) ? -width/4 - 5 : width/4 + 5;
        const posY = y + row * (itemH + gap);

        const container = this.add.container(posX, posY);
        
        // Pill BG
        const bg = this.add.graphics();
        bg.fillStyle(0x1e293b, 1).fillRoundedRect(-itemW/2, -itemH/2, itemW, itemH, 10);
        
        // Icon & Label
        const icon = this.add.text(-itemW/2 + 25, 0, "○", { fontSize: "18px", color: "#64748b" }).setOrigin(0.5);
        const lbl = this.add.text(0, 0, c.label, { 
            fontFamily: THEME.fonts.body, fontSize: "13px", color: "#94a3b8", fontStyle: "bold" 
        }).setOrigin(0.5); // Center text in pill

        container.add([bg, icon, lbl]);
        this.mainContainer.add(container);

        this.indicators[c.key] = { container, bg, icon, lbl, wasCompleted: false, w: itemW, h: itemH };
    });
  }

  createSubmitButtonInPanel(x, y) {
    this.submitBtn = this.add.container(x, y);
    
    // Base Button
    const bg = this.add.graphics();
    bg.fillStyle(THEME.colors.primary, 1).fillRoundedRect(-100, -25, 200, 50, 25);
    
    // Glow (Animated)
    const glow = this.add.graphics();
    glow.fillStyle(THEME.colors.primary, 0.4).fillRoundedRect(-105, -30, 210, 60, 30);
    this.submitGlow = this.tweens.add({
        targets: glow, alpha: 0, scaleX: 1.1, scaleY: 1.2, duration: 1000, yoyo: true, repeat: -1, paused: true
    });

    const txt = this.add.text(0, 0, "PERIKSA", {
        fontFamily: THEME.fonts.header, fontSize: "16px", color: "#ffffff", fontStyle: "bold", letterSpacing: 2
    }).setOrigin(0.5);

    this.submitBtn.add([glow, bg, txt]);
    
    const hit = new Phaser.Geom.Rectangle(-100, -25, 200, 50);
    this.submitBtn.setInteractive(hit, Phaser.Geom.Rectangle.Contains).setAlpha(0.5); // Disabled state

    this.submitBtn.on('pointerdown', () => {
        if(this.submitBtn.alpha === 1) this.submitPassword();
        else this.cameras.main.shake(100, 0.005);
    });

    this.mainContainer.add(this.submitBtn);
  }

  // --- 5. LOGIC & UPDATES ---

  setupUnifiedInput() {
    if (!this.externalInput) return;
    this.externalInput.oninput = (e) => {
        this.currentPassword = e.target.value.substring(0, this.maxChars);
        this.updateUI();
    };
    this.externalInput.onkeydown = (e) => { if(e.key === "Enter") this.submitPassword(); };
  }

  updateUI() {
    this.placeholderText.setVisible(this.currentPassword.length === 0);
    const pw = this.currentPassword;

    const v = {
        length: pw.length >= 8,
        upper: /[A-Z]/.test(pw),
        number: /[0-9]/.test(pw),
        symbol: /[!@#$%^&*(),.?":{}|<>]/.test(pw)
    };

    // Calculate Score
    let score = 0;
    if (v.length) score++; if (v.upper) score++; if (v.number) score++; if (v.symbol) score++;

    // 1. Update Strength Bar (Smooth Animation)
    const targetW = (score / 4) * this.inputBoxWidth;
    let barColor = THEME.colors.danger;
    if (score >= 2) barColor = THEME.colors.warning;
    if (score >= 3) barColor = THEME.colors.primary;
    if (score === 4) barColor = THEME.colors.success;

    this.tweens.killTweensOf(this.strengthBarFill);
    this.tweens.add({
        targets: this.strengthBarFill, width: targetW, fillColor: barColor, duration: 200, ease: "Cubic.out"
    });

    // 2. Update Indicators
    Object.keys(v).forEach(k => {
        const ui = this.indicators[k];
        const isOk = v[k];

        if (isOk && !ui.wasCompleted) {
            this.tweens.add({ targets: ui.container, scale: 1.1, duration: 100, yoyo: true });
        }
        ui.wasCompleted = isOk;

        ui.bg.clear().fillStyle(isOk ? 0x064e3b : 0x1e293b, 1).fillRoundedRect(-ui.w/2, -ui.h/2, ui.w, ui.h, 10);
        if (isOk) ui.bg.lineStyle(2, THEME.colors.success).strokeRoundedRect(-ui.w/2, -ui.h/2, ui.w, ui.h, 10);
        
        ui.icon.setText(isOk ? "✓" : "○").setColor(isOk ? "#4ade80" : "#64748b");
        ui.lbl.setColor(isOk ? "#ffffff" : "#94a3b8");
    });

    // 3. Update Submit Button
    const allValid = score === 4;
    this.submitBtn.setAlpha(allValid ? 1 : 0.5);
    if(allValid) { if(this.submitGlow.paused) this.submitGlow.play(); }
    else { this.submitGlow.pause(); this.submitBtn.list[0].setAlpha(0); } // Hide glow

    this.validationState = v;
  }

  updateInputDisplay() {
    const cursor = this.isCursorVisible ? "|" : "";
    if (this.currentPassword.length < this.maxChars) {
        this.inputTextObj.setText(this.currentPassword + cursor);
    }
  }

  submitPassword() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    GameState.addScore("digitalLiteracy", 50);
    this.showFeedback();
  }

  showFeedback() {
    GameState.completeLevel(2, 3);

    const { width, height } = this.scale;
    const modal = this.add.container(width/2, height/2).setDepth(200);
    
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setInteractive();
    
    const panel = this.add.graphics();
    panel.fillGradientStyle(0x064e3b, 0x064e3b, 0x022c22, 0x022c22, 1);
    panel.fillRoundedRect(-200, -120, 400, 240, 20);
    panel.lineStyle(4, THEME.colors.success).strokeRoundedRect(-200, -120, 400, 240, 20);

    const t1 = this.add.text(0, -50, "PERISAI AKTIF!", {
        fontFamily: THEME.fonts.header, fontSize: "32px", color: "#4ade80", fontStyle: "900"
    }).setOrigin(0.5);

    const t2 = this.add.text(0, 0, "Sandi kuat terpasang.", {
        fontFamily: THEME.fonts.body, fontSize: "16px", color: "#fff"
    }).setOrigin(0.5);

    const btn = this.add.container(0, 70);
    const btnBg = this.add.graphics().fillStyle(THEME.colors.primary, 1).fillRoundedRect(-80, -20, 160, 40, 20);
    const btnTxt = this.add.text(0, 0, "LANJUT >>", { fontFamily: THEME.fonts.header, fontSize: "14px", fontStyle: "bold" }).setOrigin(0.5);
    btn.add([btnBg, btnTxt])
       .setInteractive(new Phaser.Geom.Rectangle(-80, -20, 160, 40), Phaser.Geom.Rectangle.Contains)
       .on('pointerdown', () => this.scene.start("LevelSelectScene"));

    modal.add([overlay, panel, t1, t2, btn]);
    modal.setScale(0);
    this.tweens.add({ targets: modal, scale: 1, duration: 400, ease: "Back.out" });
  }

  shutdown() {
    this.scale.off("resize");
    this.input.removeAllListeners();
  }
}