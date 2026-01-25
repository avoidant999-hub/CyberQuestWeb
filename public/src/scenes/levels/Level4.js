import { GameState } from "../../systems/GameState.js";
import { UIManager } from "../../systems/UIManager.js";

// --- TEMA: CYBER STUDIO (High Contrast & Modern) ---
const THEME = {
    colors: {
        bg: 0x020617,
        panel: 0x1e293b,     // Panel Kontrol
        active: 0x38bdf8,    // Cyan (Warna Seleksi)
        success: 0x10b981,   // Hijau
        danger: 0xf43f5e,    // Merah
        warning: 0xfacc15,   // Kuning
        textWhite: "#ffffff",
        textGray: "#94a3b8"
    },
    fonts: {
        header: "Poppins",
        body: "Inter"
    }
};

export class Level4 extends Phaser.Scene {
    constructor() {
        super("Level4");
    }

    // --- 1. SYSTEM LIFECYCLE ---

    init() {
        // State Default Poster
        this.posterState = {
            colorIndex: 0, // Default Biru
            iconIndex: 0,  // Default Hati
            sloganIndex: 0 // Default A
        };

        // Database Aset Poster
        this.posterAssets = {
            colors: [0x3b82f6, 0xef4444, 0x10b981], // Biru, Merah, Hijau
            icons: ["❤️", "🛡️", "🤝"],
            slogans: ["STOP\nBULLYING", "SEBAR\nCINTA", "KITA\nBERSAUDARA"]
        };
    }

    create() {
        const { width, height } = this.scale;
        try { this.uiManager = new UIManager(this); } catch (e) { }

        // 1. Background
        this.createBackground(width, height);

        // 2. Header UI
        this.createHeader(width, height);

        // 3. Start Flow
        this.startEmpathyPhase();

        // Resize Handler
        this.scale.on("resize", () => this.scene.restart());
    }

    // --- 2. CORE VISUALS ---

    createBackground(width, height) {
        if (this.textures.exists("bg-level2")) {
            this.add.image(width / 2, height / 2, "bg-level2").setDisplaySize(width, height);
        } else {
            this.add.rectangle(width / 2, height / 2, width, height, THEME.colors.bg);
        }
        // Overlay Gelap Solid untuk fokus maksimal
        const grad = this.add.graphics();
        grad.fillGradientStyle(0x000000, 0x000000, 0x0f172a, 0x0f172a, 0.8, 0.8, 1, 1);
        grad.fillRect(0, 0, width, height);
    }

    createHeader(width, height) {
        const headerH = 80;
        const bg = this.add.graphics();
        bg.fillStyle(THEME.colors.bg, 0.95);
        bg.fillRect(0, 0, width, headerH);
        bg.lineStyle(1, 0x334155).lineBetween(0, headerH, width, headerH);

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

        // Title
        this.add.text(width / 2, headerH / 2, "LEVEL 4: EMPATI DIGITAL", {
            fontFamily: THEME.fonts.header, fontSize: "24px", fontStyle: "900", color: "#ffffff",
            stroke: "#000", strokeThickness: 4, shadow: { blur: 10, color: THEME.colors.active, fill: true }
        }).setOrigin(0.5);
    }

    // =================================================================
    // FASE 1: CHAT SIMULATOR (Disederhanakan untuk stabilitas)
    // =================================================================

    startEmpathyPhase() {
        const { width, height } = this.scale;
        this.phaseContainer = this.add.container(0, 0);

        const ctxLabel = this.add.text(width / 2, height * 0.18, "Pesan dari: Andi (Teman Sekelas)", {
            fontFamily: THEME.fonts.body, fontSize: "14px", color: THEME.colors.textGray
        }).setOrigin(0.5);
        this.phaseContainer.add(ctxLabel);

        // Chat Box
        const boxY = height * 0.32;
        const bgBubble = this.add.graphics();
        bgBubble.fillStyle(THEME.colors.panel, 1).fillRoundedRect(width / 2 - 250, boxY - 60, 500, 120, 20)
            .lineStyle(2, 0x475569).strokeRoundedRect(width / 2 - 250, boxY - 60, 500, 120, 20);

        const msg = '"Aku dibilang jelek di kolom komentar... Rasanya malu banget 😭"';
        const txtMsg = this.add.text(width / 2, boxY, msg, {
            fontFamily: THEME.fonts.body, fontSize: "18px", color: "#fff", align: "center", wordWrap: { width: 460 }
        }).setOrigin(0.5);

        this.phaseContainer.add([bgBubble, txtMsg]);

        // Pilihan Jawaban
        const options = [
            { text: "Halah lebay, gitu doang baper.", score: -10, color: THEME.colors.danger, fb: "KURANG EMPATI!" },
            { text: "Jangan sedih, ayo kita lapor BK.", score: 30, color: THEME.colors.success, fb: "SANGAT BIJAK!" },
            { text: "Wkwk, komennya lucu sih.", score: -20, color: THEME.colors.warning, fb: "TIDAK PANTAS!" }
        ];

        options.forEach((opt, idx) => {
            const btn = this.createButton(width / 2, height * 0.55 + (idx * 65), 400, 50, opt.text, opt.color, () => {
                this.handleChatChoice(opt);
            });
            this.phaseContainer.add(btn);
        });
    }

    createButton(x, y, w, h, text, color, callback) {
        const container = this.add.container(x, y);
        const bg = this.add.graphics();
        bg.fillStyle(0x0f172a, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 25)
            .lineStyle(2, color).strokeRoundedRect(-w / 2, -h / 2, w, h, 25);

        const txt = this.add.text(0, 0, text, {
            fontFamily: THEME.fonts.body, fontSize: "16px", color: "#fff", fontStyle: "bold"
        }).setOrigin(0.5);

        container.add([bg, txt]);
        container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => callback())
            .on('pointerover', () => this.tweens.add({ targets: container, scale: 1.05, duration: 100 }))
            .on('pointerout', () => this.tweens.add({ targets: container, scale: 1, duration: 100 }));

        return container;
    }

    handleChatChoice(opt) {
        GameState.scores.problemSolving += opt.score;
        const { width, height } = this.scale;

        const flash = this.add.text(width / 2, height / 2, opt.fb, {
            fontFamily: THEME.fonts.header, fontSize: "32px", color: opt.score > 0 ? "#4ade80" : "#f87171",
            stroke: "#000", strokeThickness: 6, fontStyle: "900"
        }).setOrigin(0.5).setDepth(100).setScale(0);

        this.tweens.add({
            targets: flash, scale: 1.5, alpha: 0, duration: 1000, ease: "Sine.out",
            onComplete: () => {
                this.phaseContainer.destroy();
                this.startPosterPhase();
            }
        });
    }

    // =================================================================
    // FASE 2: POSTER STUDIO (UIUX REFACTOR)
    // =================================================================

    startPosterPhase() {
        const { width, height } = this.scale;

        // Container untuk konten Studio
        this.studioContainer = this.add.container(0, 0);

        // Judul Fase
        const title = this.add.text(width / 2, height * 0.15, "STUDIO KREATIF: DESAIN POSTER", {
            fontFamily: THEME.fonts.header, fontSize: "20px", color: THEME.colors.active, fontStyle: "bold"
        }).setOrigin(0.5);
        this.studioContainer.add(title);

        // --- 1. KANVAS PREVIEW (Area Tengah) ---
        this.createCanvasPreview(width, height);

        // --- 2. TOOLBAR (Area Bawah) ---
        this.createControlPanel(width, height);

        // --- 3. FINISH BUTTON (Floating Global) ---
        this.createFinishButton(width, height);
    }

    createCanvasPreview(width, height) {
        const canvasY = height * 0.45;
        const canvasW = Math.min(width * 0.6, 320);
        const canvasH = canvasW * 1.2;

        // Glow Effect
        const glow = this.add.graphics();
        glow.fillStyle(THEME.colors.active, 0.1).fillRoundedRect(width / 2 - canvasW / 2 - 15, canvasY - canvasH / 2 - 15, canvasW + 30, canvasH + 30, 20);

        // Canvas Base (Dynamic Color)
        this.posterBg = this.add.rectangle(width / 2, canvasY, canvasW, canvasH, this.posterAssets.colors[0]).setStrokeStyle(4, 0xffffff);

        // Icon (Dynamic)
        this.posterIcon = this.add.text(width / 2, canvasY - 40, this.posterAssets.icons[0], { fontSize: "80px" }).setOrigin(0.5);

        // Text (Dynamic)
        this.posterText = this.add.text(width / 2, canvasY + 60, this.posterAssets.slogans[0], {
            fontFamily: THEME.fonts.header, fontSize: "24px", color: "#ffffff",
            fontStyle: "900", stroke: "#000", strokeThickness: 4, align: "center"
        }).setOrigin(0.5);

        this.studioContainer.add([glow, this.posterBg, this.posterIcon, this.posterText]);
    }

    createControlPanel(width, height) {
        const panelH = 180;
        const panelY = height - panelH / 2;

        // Background Panel Solid (Glass dark)
        const bg = this.add.rectangle(width / 2, panelY, width, panelH, 0x1e293b, 1)
            .setStrokeStyle(2, 0x334155);
        this.studioContainer.add(bg);

        // --- GRID TOMBOL ---
        const startY = panelY; // Center vertical di panel

        // Kita bagi layar jadi 3 kolom virtual
        const spacing = width / 3.5;

        // GROUP 1: WARNA
        this.createControlGroup(width / 2 - spacing, startY, "WARNA", ["🟦", "🟥", "🟩"], (idx) => {
            this.posterState.colorIndex = idx;
            this.updatePosterVisuals();
        });

        // GROUP 2: IKON
        this.createControlGroup(width / 2, startY, "IKON", ["❤️", "🛡️", "🤝"], (idx) => {
            this.posterState.iconIndex = idx;
            this.updatePosterVisuals();
        });

        // GROUP 3: PESAN
        this.createControlGroup(width / 2 + spacing, startY, "PESAN", ["A", "B", "C"], (idx) => {
            this.posterState.sloganIndex = idx;
            this.updatePosterVisuals();
        });
    }

    createControlGroup(x, y, label, items, callback) {
        // Label Group
        const lbl = this.add.text(x, y - 50, label, {
            fontFamily: "Inter", fontSize: "12px", color: THEME.colors.textGray, fontStyle: "bold"
        }).setOrigin(0.5);
        this.studioContainer.add(lbl);

        // Buttons
        items.forEach((item, i) => {
            const btnX = x - 50 + (i * 50);

            // Button Container (Agar Hit Area Stabil)
            const btnContainer = this.add.container(btnX, y);

            // Circle Background
            const bg = this.add.circle(0, 0, 22, 0x0f172a).setStrokeStyle(2, 0x475569);
            const icon = this.add.text(0, 0, item, { fontSize: "20px", color: "#fff" }).setOrigin(0.5);

            // Simpan referensi bg untuk highlight nanti
            if (!this.controlButtons) this.controlButtons = [];
            // Tambahkan metadata untuk logika highlight
            btnContainer.meta = { type: label, index: i, bg: bg };
            this.controlButtons.push(btnContainer);

            btnContainer.add([bg, icon]);

            // INTERAKSI (Area Sentuh 50x50 px)
            const hit = new Phaser.Geom.Circle(0, 0, 25);
            btnContainer.setInteractive(hit, Phaser.Geom.Circle.Contains);

            btnContainer.on('pointerdown', () => {
                // Animasi Tekan
                this.tweens.add({ targets: btnContainer, scale: 0.8, duration: 50, yoyo: true });
                callback(i);
                this.highlightSelection(label, i);
            });

            this.studioContainer.add(btnContainer);
        });

        // Highlight default (index 0) saat pertama kali render
        this.highlightSelection(label, 0);
    }

    highlightSelection(type, selectedIndex) {
        // Loop semua tombol, cari yang tipe-nya sama
        this.controlButtons.forEach(btn => {
            if (btn.meta.type === type) {
                const isSelected = btn.meta.index === selectedIndex;
                // Ubah warna border: Cyan jika aktif, Abu jika tidak
                btn.meta.bg.setStrokeStyle(isSelected ? 3 : 2, isSelected ? THEME.colors.active : 0x475569);
                btn.meta.bg.setFillStyle(isSelected ? 0x334155 : 0x0f172a);
            }
        });
    }

    updatePosterVisuals() {
        // Apply state ke visual canvas
        this.posterBg.fillColor = this.posterAssets.colors[this.posterState.colorIndex];
        this.posterIcon.setText(this.posterAssets.icons[this.posterState.iconIndex]);
        this.posterText.setText(this.posterAssets.slogans[this.posterState.sloganIndex]);
    }

    // --- 3. FINISH BUTTON (FIXED: SEPARATE FROM CONTAINER) ---

    createFinishButton(width, height) {
        // PENTING: Tombol ini ditambahkan langsung ke Scene (this.add), bukan ke studioContainer.
        // Ini menjamin posisinya absolut dan depth-nya paling tinggi.

        const btnX = width - 80;
        const btnY = height - 120; // Di atas toolbar

        const container = this.add.container(btnX, btnY).setDepth(1000); // Z-Index Tertinggi

        // Green Circle Background
        const bg = this.add.circle(0, 0, 35, THEME.colors.success).setStrokeStyle(3, 0xffffff);

        // Check Icon
        const icon = this.add.text(0, 0, "✔", {
            fontSize: "32px", color: "#ffffff", fontStyle: "bold"
        }).setOrigin(0.5);

        // Pulse Animation Ring
        const ring = this.add.circle(0, 0, 35, THEME.colors.success, 0.4);
        this.tweens.add({ targets: ring, scale: 1.4, alpha: 0, duration: 1500, repeat: -1 });

        container.add([ring, bg, icon]);

        // Hit Area yang Luas & Jelas
        const hitArea = new Phaser.Geom.Circle(0, 0, 45); // Area klik lebih besar dari visual
        container.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

        container.on('pointerover', () => {
            this.tweens.add({ targets: container, scale: 1.1, duration: 100 });
        });

        container.on('pointerout', () => {
            this.tweens.add({ targets: container, scale: 1, duration: 100 });
        });

        // LOGIC CLICK
        container.on('pointerdown', () => {
            // Matikan interaksi agar tidak double click
            container.disableInteractive();
            this.finishLevel();
        });
    }

    // =================================================================
    // FINISH SEQUENCE
    // =================================================================

    finishLevel() {
        GameState.scores.creativeThinking += 50;

        // Efek Loading "Publishing..."
        const { width, height } = this.scale;
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setDepth(2000);
        const txt = this.add.text(width / 2, height / 2, "MENERBITKAN KARYA...", {
            fontFamily: THEME.fonts.header, fontSize: "24px", color: THEME.colors.active
        }).setOrigin(0.5).setDepth(2001);

        this.time.delayedCall(1500, () => {
            overlay.destroy();
            txt.destroy();
            this.showSummary();
        });
    }

    showSummary() {
        // Hapus UI sebelumnya
        if (this.studioContainer) this.studioContainer.destroy();

        const { width, height } = this.scale;
        const container = this.add.container(width / 2, height / 2).setDepth(3001);

        // --- Visual Objek ---
        const trophy = this.add.text(0, -120, "🏆", { fontSize: "80px" }).setOrigin(0.5);

        const title = this.add.text(0, -30, "MISI SELESAI!", {
            fontFamily: THEME.fonts.header, fontSize: "32px", fontStyle: "900", color: THEME.colors.warning
        }).setOrigin(0.5);

        const sub = this.add.text(0, 20, "Kamu telah menyebarkan empati digital.", {
            fontFamily: THEME.fonts.body, fontSize: "16px", color: "#fff"
        }).setOrigin(0.5);

        // Hitung skor
        const totalScore = Object.values(GameState.scores).reduce((total, score) => {
    return total + (typeof score === 'number' ? score : 0);
}, 0);

        const scoreTxt = this.add.text(0, 75, `Total Skor: ${totalScore}`, {
            fontFamily: "Inter", fontSize: "24px", color: THEME.colors.active, fontStyle: "bold"
        }).setOrigin(0.5);

        // --- Tombol Simpan ---
        const btnSave = this.add.container(-110, 160);
        const sBg = this.add.graphics().fillStyle(THEME.colors.success, 1).fillRoundedRect(-90, -25, 180, 50, 25);
        const sTxt = this.add.text(0, 0, "SIMPAN SKOR", {
            fontFamily: THEME.fonts.header, fontSize: "14px", fontStyle: "bold", color: "#fff"
        }).setOrigin(0.5);
        btnSave.add([sBg, sTxt]);
        btnSave.setInteractive(new Phaser.Geom.Rectangle(-90, -25, 180, 50), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => this.handleSaveScore(totalScore));

        // --- Tombol Menu ---
        const btnMenu = this.add.container(110, 160);
        const mBg = this.add.graphics().fillStyle(0x475569, 1).fillRoundedRect(-90, -25, 180, 50, 25);
        const mTxt = this.add.text(0, 0, "MENU UTAMA", {
            fontFamily: THEME.fonts.header, fontSize: "14px", fontStyle: "bold", color: "#fff"
        }).setOrigin(0.5);
        btnMenu.add([mBg, mTxt]);
        btnMenu.setInteractive(new Phaser.Geom.Rectangle(-90, -25, 180, 50), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => this.scene.start("MenuScene"));

        container.add([trophy, title, sub, scoreTxt, btnSave, btnMenu]);

        // Panggil confetti milik class ini
        this.createConfetti(width, height);
    }

    // --- FIX: Masukkan fungsi ke dalam class (Hapus tanda ; dan tambahkan kurung kurawal) ---
    createConfetti(w, h) {
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, w);
            const y = Phaser.Math.Between(-10, h);
            const color = [0xfbbf24, 0x38bdf8, 0xf472b6, 0x34d399][Phaser.Math.Between(0, 3)];
            const rect = this.add.rectangle(x, y, 8, 8, color).setDepth(2999);

            this.tweens.add({
                targets: rect,
                y: h + 100,
                angle: 360,
                duration: Phaser.Math.Between(2000, 4000),
                ease: "Sine.easeInOut",
                onComplete: () => rect.destroy() // Bersihkan memori
            });
        }
    }

    showToast(message) {
        const { width, height } = this.scale;
        const toast = this.add.container(width / 2, height - 100).setDepth(5000);

        const bg = this.add.graphics().fillStyle(0x000000, 0.8).fillRoundedRect(-100, -20, 200, 40, 20);
        const txt = this.add.text(0, 0, message, {
            fontFamily: THEME.fonts.body, fontSize: "14px", color: THEME.colors.success, fontStyle: "bold"
        }).setOrigin(0.5);

        toast.add([bg, txt]);
        toast.setAlpha(0);

        this.tweens.add({
            targets: toast,
            alpha: 1,
            y: height - 150,
            duration: 500,
            yoyo: true,
            hold: 1000,
            onComplete: () => toast.destroy()
        });
    }

    handleSaveScore(score) {
        const { width, height } = this.scale;

        // 1. Overlay & Card (Tetap sama)
        const modalOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
            .setInteractive().setDepth(4000);

        const card = this.add.container(width / 2, height / 2).setDepth(4001);
        const cardBg = this.add.graphics();
        cardBg.fillStyle(THEME.colors.panel, 1).lineStyle(2, THEME.colors.active, 1);
        cardBg.fillRoundedRect(-160, -110, 320, 240, 20);
        cardBg.strokeRoundedRect(-160, -110, 320, 240, 20);

        const title = this.add.text(0, -75, "DAFTARKAN AGENT", {
            fontFamily: THEME.fonts.header, fontSize: "20px", color: THEME.colors.active, fontStyle: "900"
        }).setOrigin(0.5);

        const inputX = (width / 2) - 110;
        const inputY = (height / 2) - 80;

        const inputElement = this.add.dom(inputX, inputY).createFromHTML(`
    <input type="text" id="nameInput" placeholder="Ketik namamu..." 
    style="
        width: 220px; 
        height: 45px; 
        padding: 0 15px; 
        font-size: 16px; 
        border: 2px solid #334155; 
        border-radius: 10px; 
        background: #0f172a; 
        color: #ffffff; 
        text-align: center; 
        outline: none;
        box-sizing: border-box;
        display: block;
    ">
`);

        // PENTING: Set Origin ke 0 (Pojok Kiri Atas) agar manual offset kita valid
        inputElement.setOrigin(0);
        inputElement.setDepth(4002);

        // 3. Tombol Simpan (Tetap sama)
        const btnSubmit = this.add.container(0, 80).setInteractive(new Phaser.Geom.Rectangle(-70, -22, 140, 45), Phaser.Geom.Rectangle.Contains);
        const bSbg = this.add.graphics().fillStyle(THEME.colors.success, 1).fillRoundedRect(-70, -22, 140, 45, 12);
        const bStxt = this.add.text(0, 0, "SIMPAN", { fontFamily: THEME.fonts.header, fontSize: "16px", fontStyle: "bold", color: "#fff" }).setOrigin(0.5);
        btnSubmit.add([bSbg, bStxt]);

        card.add([cardBg, title, btnSubmit]);

        // 4. Logika Klik
        btnSubmit.on('pointerdown', async () => {
            const inputNode = document.getElementById('nameInput');
            const playerName = inputNode ? inputNode.value.trim() : "";

            if (!playerName) {
                this.showToast("NAMA WAJIB DIISI!");
                return;
            }

            btnSubmit.disableInteractive();
            bStxt.setText("PROSES...");

            try {
                const module = await import("../../systems/LeaderboardSystem.js");
                await module.LeaderboardSystem.saveScore(playerName, score);

                card.destroy();
                inputElement.destroy();
                modalOverlay.destroy();
                this.showToast("SKOR DISIMPAN!");

                this.time.delayedCall(1000, () => this.scene.start('LeaderboardScene'));
            } catch (err) {
                bStxt.setText("ERROR!");
                btnSubmit.setInteractive();
            }
        });

        // Animasi Muncul
        card.setScale(0);
        this.tweens.add({
            targets: card,
            scale: 1,
            duration: 400,
            ease: 'Back.easeOut'
        });
    }
}