import { GameState } from "../../systems/GameState.js";
import { UIManager } from "../../systems/UIManager.js";

export class Level2 extends Phaser.Scene {
  constructor() {
    super("Level2Scene");
    this.currentPassword = "";
    this.maxChars = 16;
    this.isCursorVisible = true;

    this.validationState = {
      length: false,
      upper: false,
      number: false,
      symbol: false,
    };
  }

  create() {
    const { width, height } = this.scale;
    const bg = this.add.image(width / 2, height / 2, "bg-mainmenu");
    bg.setDisplaySize(width, height);

    try {
      this.uiManager = new UIManager(this);
    } catch (e) {
      console.warn("UIManager missing, using fallback");
    }

    // --- 1. BACKGROUND ---
    if (this.textures.exists("bg-level2")) {
      this.add.image(width / 2, height / 2, "bg-level2").setDisplaySize(width, height);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a);
    }

    this.add.grid(width / 2, height / 2, width, height, 40, 40, 0x000000, 0, 0x38bdf8, 0.05);

    const getFont = (type, def) => this.uiManager?.getFontSize ? this.uiManager.getFontSize(type) : def;

    this.add.text(width * 0.05, height * 0.08, "LEVEL 2: BENTENG SANDI", {
      fontFamily: "Poppins",
      fontSize: getFont("heading", 24) * 0.8 + "px",
      fontStyle: "bold",
      color: "#38bdf8",
      shadow: { blur: 5, color: "#0ea5e9", fill: true },
    });

    this.scoreText = this.add.text(width * 0.95, height * 0.08, `Literasi: ${GameState.scores.digitalLiteracy}`, {
      fontFamily: "Inter",
      fontSize: getFont("button", 18) + "px",
      color: "#fff",
      backgroundColor: "#1e293b",
      padding: { x: 12, y: 6 },
    }).setOrigin(1, 0);

    this.add.text(width / 2, height * 0.22, "RAKIT PASSWORD TERKUAT", {
      fontFamily: "Poppins",
      fontSize: getFont("heading", 32) + "px",
      color: "#ffffff",
      align: "center",
      shadow: { blur: 10, color: "#ffffff", stroke: true, fill: true },
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.28, "Ketik menggunakan keyboard anda...", {
      fontFamily: "Inter",
      fontSize: getFont("body", 16) + "px",
      color: "#94a3b8",
      fontStyle: "italic",
    }).setOrigin(0.5);

    // INISIALISASI INPUT
    this.externalInput = document.getElementById("hidden-input");
    this.currentPassword = "";
    if (this.externalInput) this.externalInput.value = "";

    this.createInputField();
    this.createValidationUI();
    this.createSubmitButton();
    this.setupUnifiedInput(); // Ganti dua fungsi lama dengan satu fungsi ini

    this.time.addEvent({
      delay: 500,
      callback: () => {
        this.isCursorVisible = !this.isCursorVisible;
        this.updateInputDisplay();
      },
      loop: true,
    });
  }

  createInputField() {
    const { width, height } = this.scale;
    const boxW = Math.min(600, width * 0.7);
    const boxH = 70;
    const yPos = height * 0.42;

    this.inputContainer = this.add.container(width / 2, yPos);

    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.9);
    bg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 12);
    bg.lineStyle(2, 0x38bdf8, 1);
    bg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 12);

    this.inputTextObj = this.add.text(0, 0, "|", {
      fontFamily: "Courier New", fontSize: "32px", color: "#fbbf24", fontStyle: "bold"
    }).setOrigin(0.5);

    this.placeholderText = this.add.text(0, 0, "Ketuk di sini untuk mengetik...", {
      fontFamily: "Inter", fontSize: "18px", color: "#475569", fontStyle: "italic"
    }).setOrigin(0.5);

    // Area klik untuk memicu keyboard di HP
    const hitArea = this.add.rectangle(0, 0, boxW, boxH, 0xffffff, 0).setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', () => {
        if (this.externalInput) this.externalInput.focus();
    });

    this.inputContainer.add([bg, this.placeholderText, this.inputTextObj, hitArea]);
  }

  setupUnifiedInput() {
    if (!this.externalInput) return;

    // Gabungkan logika input HP dan PC di sini
    this.externalInput.addEventListener("input", (e) => {
      let val = e.target.value;
      if (val.length > this.maxChars) {
        val = val.substring(0, this.maxChars);
        this.externalInput.value = val;
      }
      this.currentPassword = val;
      this.updateUI();
    });

    this.externalInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (window.innerWidth < 900) this.externalInput.blur();
        this.submitPassword();
      }
    });
  }

  createValidationUI() {
    const { width, height } = this.scale;
    const startY = height * 0.6;
    const criteria = [
      { key: "length", label: "Min. 8 Karakter" },
      { key: "upper", label: "Huruf Besar (A-Z)" },
      { key: "number", label: "Angka (0-9)" },
      { key: "symbol", label: "Simbol (!@#$)" },
    ];

    const cardW = 180;
    const cardH = 40;
    const gapX = 20;
    const gapY = 15;
    const startX = width / 2;

    this.indicators = {};

    criteria.forEach((c, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2 === 0 ? -1 : 1;
      const xPos = startX + col * (cardW / 2 + gapX / 2);
      const yPos = startY + row * (cardH + gapY);

      const container = this.add.container(xPos, yPos);
      const bg = this.add.graphics();
      bg.fillStyle(0x1e293b, 1);
      bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);

      const icon = this.add.text(-cardW / 2 + 25, 0, "○", { fontSize: "16px", color: "#64748b" }).setOrigin(0.5);
      const label = this.add.text(10, 0, c.label, {
        fontFamily: "Inter", fontSize: "13px", color: "#94a3b8", fontStyle: "bold",
      }).setOrigin(0.5);

      container.add([bg, icon, label]);
      this.indicators[c.key] = { bg, icon, label, cardW, cardH };
    });
  }

  createSubmitButton() {
    const { width, height } = this.scale;
    const yPos = height * 0.78; 
    this.submitBtn = this.add.container(width / 2, yPos);

    const btnW = 220;
    const btnH = 60;
    const bg = this.add.graphics();
    bg.fillStyle(0x38bdf8, 1);
    bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12);

    const text = this.add.text(0, 0, "PERIKSA KEAMANAN", {
      fontFamily: "Poppins", fontSize: "18px", color: "#0f172a", fontStyle: "bold",
    }).setOrigin(0.5);

    const hitZone = this.add.zone(0, 0, btnW, btnH).setInteractive({ useHandCursor: true });
    this.submitBtn.add([bg, text, hitZone]);

    hitZone.on("pointerdown", () => {
      this.tweens.add({
        targets: this.submitBtn, scale: 0.95, duration: 50, yoyo: true,
        onComplete: () => this.submitPassword(),
      });
    });
  }

  updateUI() {
    const cursor = this.isCursorVisible ? "|" : " ";
    this.placeholderText.setVisible(this.currentPassword.length === 0);
    this.inputTextObj.setText(this.currentPassword + (this.currentPassword.length < this.maxChars ? cursor : ""));

    const pw = this.currentPassword;
    this.validationState = {
      length: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      number: /[0-9]/.test(pw),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    };

    Object.keys(this.validationState).forEach((key) => {
      const ui = this.indicators[key];
      const isValid = this.validationState[key];
      ui.bg.clear();
      ui.bg.fillStyle(isValid ? 0x22c55e : 0x1e293b, 1);
      ui.bg.fillRoundedRect(-ui.cardW / 2, -ui.cardH / 2, ui.cardW, ui.cardH, 20);
      ui.icon.setText(isValid ? "✓" : "○").setColor(isValid ? "#ffffff" : "#64748b");
      ui.label.setColor(isValid ? "#ffffff" : "#94a3b8");
    });
  }

  updateInputDisplay() {
    const cursor = this.isCursorVisible ? "|" : " ";
    if (this.currentPassword.length < this.maxChars) {
        this.inputTextObj.setText(this.currentPassword + cursor);
    }
  }

  submitPassword() {
    const v = this.validationState;
    const score = [v.length, v.upper, v.number, v.symbol].filter(Boolean).length;

    if (score === 4) {
      GameState.scores.digitalLiteracy += 50;
      this.showFeedback(true, "SANDI SANGAT KUAT! \nAkunmu aman dari serangan hacker.");
    } else {
      this.showFeedback(false, score === 3 ? "HAMPIR SEMPURNA!" : "SANDI LEMAH!");
      this.tweens.add({ targets: this.inputContainer, x: "+=10", duration: 50, yoyo: true, repeat: 5 });
    }
  }

  showFeedback(isSuccess, message) {
    const { width, height } = this.scale;
    const modal = this.add.container(0, 0).setDepth(100);
    const dimmer = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.8).setInteractive();
    
    const panelW = Math.min(500, width * 0.9);
    const panelH = 300;
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 1).fillRoundedRect(width/2 - panelW/2, height/2 - panelH/2, panelW, panelH, 16);
    bg.lineStyle(3, isSuccess ? 0x22c55e : 0xf87171, 1).strokeRoundedRect(width/2 - panelW/2, height/2 - panelH/2, panelW, panelH, 16);

    const title = this.add.text(width/2, height/2 - 60, isSuccess ? "✅ AKSES DITERIMA" : "⚠️ KEAMANAN LEMAH", {
        fontFamily: "Poppins", fontSize: "24px", fontStyle: "bold", color: isSuccess ? "#4ade80" : "#f87171"
    }).setOrigin(0.5);

    const desc = this.add.text(width/2, height/2 + 10, message, {
        fontFamily: "Inter", fontSize: "16px", color: "#e2e8f0", align: "center", wordWrap: { width: panelW - 50 }
    }).setOrigin(0.5);

    const btnContainer = this.add.container(width/2, height/2 + 100);
    const btnBg = this.add.graphics().fillStyle(0x38bdf8, 1).fillRoundedRect(-100, -20, 200, 40, 10);
    const btnLabel = this.add.text(0, 0, isSuccess ? "LANJUT >>" : "COBA LAGI", {
        fontFamily: "Inter", fontSize: "14px", fontStyle: "bold", color: "#0f172a"
    }).setOrigin(0.5);

    const hitBtn = this.add.zone(0,0,200,40).setInteractive({useHandCursor:true});
    btnContainer.add([btnBg, btnLabel, hitBtn]);

    hitBtn.on('pointerdown', () => {
        if (isSuccess) this.scene.start("Level3Scene");
        else modal.destroy();
    });

    modal.add([dimmer, bg, title, desc, btnContainer]);
  }

  shutdown() {
    this.scale.off("resize");
  }
}