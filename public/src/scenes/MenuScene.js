import { GameState } from "../systems/GameState.js";
import { UIManager } from "../systems/UIManager.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
    this.uiElements = [];
    this.uiManager = null;
  }

  create() {
    // --- PERBAIKAN PENTING ---
    // JANGAN panggil GameState.resetSession() di sini!
    // Karena akan menghapus progress setiap kali user kembali ke menu.
    
    this.uiManager = new UIManager(this);
    this.input.mouse.disableContextMenu();
    const { width, height } = this.scale;

    // 1. Background
    if (this.textures.exists("bg-mainmenu")) {
      const bg = this.add.image(width / 2, height / 2, "bg-mainmenu");
      bg.setName("bg-mainmenu").setDepth(0);
      this.updateBackgroundSize(bg, width, height);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a).setDepth(0);
    }
    
    // Partikel Effect (Opsional, dari UIManager)
    if(this.uiManager.createParticleBackground) {
        this.uiManager.createParticleBackground();
    }

    // 2. Title
    const titleFontSize = this.uiManager.getFontSize("title");
    const titleY = height * 0.22;

    const title = this.add.text(width / 2, titleY, "CYBERQUEST", {
        fontFamily: "Poppins",
        fontSize: (titleFontSize || 32) + "px",
        fontStyle: "900",
        color: "#38bdf8",
        shadow: { blur: 20, color: "#0ea5e9", stroke: true, fill: true },
        stroke: "#000000",
        strokeThickness: 4,
    }).setOrigin(0.5).setDepth(1);

    // Animasi Title (Floating)
    this.tweens.add({
      targets: title, y: title.y - 10, duration: 2000, yoyo: true, repeat: -1, ease: "Sine.easeInOut",
    });
    this.uiElements.push({ name: "title", element: title });

    // 3. Buttons Layout
    const btnSize = this.uiManager.getButtonSize();
    const btnSpacing = this.uiManager.getVerticalSpacing(0.025); // Jarak antar tombol
    const startY = height * 0.45; // Posisi awal tombol

    // A. TOMBOL MULAI (LANJUTKAN)
    const btnMulai = this.createResponsiveBtn(
      width / 2, startY, 
      "MULAI PETUALANGAN", 
      () => this.scene.start("LevelSelectScene"), // Langsung ke peta level
      0xff006e, btnSize
    );
    this.uiElements.push({ name: "btn_mulai", element: btnMulai });

    // B. TOMBOL LEADERBOARD
    const btnLeaderboard = this.createResponsiveBtn(
      width / 2, startY + btnSize.height + btnSpacing, 
      "PAPAN SKOR", 
      () => {
          if(this.scene.get('LeaderboardScene')) {
              this.scene.start("LeaderboardScene");
          } else {
              console.log("Scene Leaderboard belum dibuat");
          }
      },
      0x1e293b, btnSize
    );
    this.uiElements.push({ name: "btn_leaderboard", element: btnLeaderboard });

    // C. TOMBOL KELUAR (RESET GAME)
    const btnKeluar = this.createResponsiveBtn(
      width / 2, startY + (btnSize.height + btnSpacing) * 2, 
      "KELUAR / RESET", 
      () => this.handleExitGame(),
      0x00d9ff, btnSize
    );
    this.uiElements.push({ name: "btn_keluar", element: btnKeluar });

    // Event Resize
    this.scale.on("resize", () => this.handleResize());
  }

  handleExitGame() {
    // Di sini barulah kita reset session
    const confirmExit = window.confirm("Yakin ingin mereset progress dan keluar?");
    if (confirmExit) {
        GameState.resetSession(); // Reset Data
        this.scene.restart();     // Refresh Scene agar mulai dari nol
    }
  }

  createResponsiveBtn(x, y, text, callback, color, btnSize) {
    const container = this.add.container(x, y).setDepth(2);
    const w = btnSize.width || 200;
    const h = btnSize.height || 50;

    // Background Tombol
    const bg = this.add.rectangle(0, 0, w, h, color, 1)
        .setStrokeStyle(2, 0xffffff, 1)
        .setOrigin(0.5);

    // Teks Tombol
    const fontSize = this.uiManager.getFontSize("button");
    const label = this.add.text(0, 0, text, {
        fontFamily: "Inter", fontSize: fontSize + "px", fontStyle: "bold", color: "#ffffff"
    }).setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    // Animasi Hover & Click
    container.on("pointerover", () => {
        this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
        bg.setStrokeStyle(3, 0xffff00, 1); // Border kuning saat hover
    });
    container.on("pointerout", () => {
        this.tweens.add({ targets: container, scale: 1, duration: 100 });
        bg.setStrokeStyle(2, 0xffffff, 1);
    });
    container.on("pointerdown", () => {
        this.tweens.add({
            targets: container, scale: 0.95, duration: 50, yoyo: true,
            onComplete: callback
        });
    });

    return container;
  }

  updateBackgroundSize(bg, width, height) {
    bg.setScale(Math.max(width / bg.width, height / bg.height));
    bg.setPosition(width / 2, height / 2);
  }

  handleResize() {
      // Logika resize sederhana: Restart scene agar layout terhitung ulang dengan rapi
      this.scene.restart();
  }
}