import { GameState } from "../systems/GameState.js";
import { UIManager } from "../systems/UIManager.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
    this.uiElements = [];
    this.uiManager = null;
  }

  create() {
    GameState.resetSession();
    this.uiManager = new UIManager(this);
    this.input.mouse.disableContextMenu();
    const { width, height } = this.scale;

    // ===== 1. BACKGROUND =====
    if (this.textures.exists("bg-mainmenu")) {
      const bg = this.add.image(width / 2, height / 2, "bg-mainmenu");
      bg.setName("bg-mainmenu");
      bg.setDepth(0);
      this.updateBackgroundSize(bg, width, height);
    } else {
      this.add
        .rectangle(width / 2, height / 2, width, height, 0x0f172a)
        .setDepth(0);
    }

    // ===== 2. TITLE (Posisi Dinaikkan) =====
    const titleFontSize = this.uiManager.getFontSize("title");

    // Posisi Judul: 12% dari atas (Naik banget biar lega di bawah)
    const titleY = height * 0.22;

    const title = this.add
      .text(this.uiManager.getCenterX(), titleY, "CYBERQUEST", {
        fontFamily: "Poppins",
        fontSize: (titleFontSize || 24) + "px",
        fontStyle: "900",
        color: "#38bdf8",
        shadow: { blur: 20, color: "#0ea5e9", stroke: true, fill: true },
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(1);

    this.tweens.add({
      targets: title,
      y: title.y - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.uiElements.push({ name: "title", element: title, type: "text" });

    // ===== 3. BUTTONS (Posisi Adaptif) =====
    const btnSize = this.uiManager.getButtonSize();
    const btnSpacing = this.uiManager.getVerticalSpacing(0.03); // Spacing sangat rapat

    // LOGIKA POSISI BARU:
    // Jika layar pendek (< 400px), mulai tombol di 30%. Jika layar tinggi (PC), di 40%.
    const isLandscapeMobile = height < 400;
    const btnAreaStartY = isLandscapeMobile ? height * 0.3 : height * 0.4;

    // A. MULAI
    const btnMulai = this.createResponsiveBtn(
      this.uiManager.getCenterX(),
      btnAreaStartY,
      "MULAI",
      () => this.scene.start("LevelSelectScene"),
      0xff006e,
      btnSize
    );
    this.uiElements.push({
      name: "btn_mulai",
      element: btnMulai,
      type: "container",
    });

    // B. LEADERBOARD
    const btnLeaderboard = this.createResponsiveBtn(
      this.uiManager.getCenterX(),
      btnAreaStartY + btnSize.height + btnSpacing,
      "LEADERBOARD",
      () => this.scene.start("LeaderboardScene"),
      0x1e293b,
      btnSize
    );
    this.uiElements.push({
      name: "btn_leaderboard",
      element: btnLeaderboard,
      type: "container",
    });

    // C. KELUAR
    const btnKeluar = this.createResponsiveBtn(
      this.uiManager.getCenterX(),
      btnAreaStartY + btnSize.height * 2 + btnSpacing * 2,
      "KELUAR",
      () => alert("Terima kasih sudah bermain!"),
      0x00d9ff,
      btnSize
    );
    this.uiElements.push({
      name: "btn_keluar",
      element: btnKeluar,
      type: "container",
    });

    // ===== EVENT LISTENERS =====
    this.scale.off("resize");
    this.scale.on("resize", () => this.handleResize());
    this.events.on("wake", () => this.scene.restart());
  }

  updateBackgroundSize(bg, width, height) {
    if (!bg || !bg.texture) return;
    bg.setScale(1);
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setPosition(width / 2, height / 2);
  }

  createResponsiveBtn(x, y, text, callback, color, btnSize) {
    const container = this.add.container(x, y);
    container.setDepth(2);
    const w = btnSize.width || 150;
    const h = btnSize.height || 30;

    const bg = this.add
      .rectangle(0, 0, w, h, color, 1)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff, 1);

    const buttonFontSize = this.uiManager.getFontSize("button") || 12;
    const label = this.add
      .text(0, 0, text, {
        fontFamily: "Inter",
        fontSize: buttonFontSize + "px",
        fontStyle: "bold",
        color: "#ffffff",
        strokeThickness: 2,
        stroke: "#000000",
        align: "center",
      })
      .setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    container.on("pointerover", () => {
      this.tweens.add({
        targets: container,
        scale: 1.05,
        duration: 150,
        ease: "Back.out",
      });
      bg.setStrokeStyle(3, 0xffff00, 1);
    });
    container.on("pointerout", () => {
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 150,
        ease: "Back.out",
      });
      bg.setStrokeStyle(2, 0xffffff, 1);
    });
    container.on("pointerdown", () => {
      this.tweens.add({
        targets: container,
        scale: 0.95,
        duration: 80,
        yoyo: true,
        onComplete: callback,
      });
    });

    return container;
  }

  handleResize() {
    if (!this.uiManager) return;
    this.uiManager.calculateMetrics();
    const { width, height } = this.scale;

    const bg = this.children.getByName("bg-mainmenu");
    if (bg) this.updateBackgroundSize(bg, width, height);

    const titleEl = this.uiElements.find((el) => el.name === "title");
    if (titleEl) {
      const titleFontSize = this.uiManager.getFontSize("title") || 24;
      titleEl.element.setPosition(this.uiManager.getCenterX(), height * 0.22);
      titleEl.element.setFontSize(titleFontSize);
    }

    const btnSize = this.uiManager.getButtonSize();
    const btnSpacing = this.uiManager.getVerticalSpacing(0.03);
    const isLandscapeMobile = height < 400;
    const btnAreaStartY = isLandscapeMobile ? height * 0.3 : height * 0.4;

    const updateBtn = (name, index) => {
      const btn = this.uiElements.find((el) => el.name === name);
      if (btn) {
        const yPos = btnAreaStartY + index * (btnSize.height + btnSpacing);
        btn.element.setPosition(this.uiManager.getCenterX(), yPos);

        const bg = btn.element.getAt(0);
        const label = btn.element.getAt(1);
        if (bg) bg.setSize(btnSize.width, btnSize.height);
        if (label)
          label.setFontSize(this.uiManager.getFontSize("button") || 12);
        btn.element.setSize(btnSize.width, btnSize.height);
      }
    };
    updateBtn("btn_mulai", 0);
    updateBtn("btn_leaderboard", 1);
    updateBtn("btn_keluar", 2);
  }

  shutdown() {
    this.scale.off("resize");
    this.events.off("wake");
    this.uiElements = [];
  }
}
