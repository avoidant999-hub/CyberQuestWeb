import { GameState } from '../systems/GameState.js';

export class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super('CharacterSelectScene');
    }

    create() {
        const { width, height } = this.scale;

        // --- 1. BACKGROUND FIX ---
        // MENGGUNAKAN KEY 'bg-mainmenu' (Bukan bg_menu)
        // Kita cek apakah texture ada, jika tidak pakai warna solid (fallback)
        if (this.textures.exists('bg-mainmenu')) {
            const bg = this.add.image(width / 2, height / 2, 'bg-mainmenu');
            const scale = Math.max(width / bg.width, height / bg.height);
            bg.setScale(scale).setScrollFactor(0).setTint(0x222222); // Gelapkan agar kartu menonjol
        } else {
            this.add.rectangle(0, 0, width, height, 0x0f172a).setOrigin(0);
        }

        // --- 2. HEADER ---
        this.add.text(width / 2, height * 0.1, "PILIH AGENT", {
            fontFamily: 'Poppins',
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontStyle: '900',
            color: '#ffffff',
            stroke: '#8b5cf6',
            strokeThickness: 2,
            shadow: { blur: 15, color: '#8b5cf6', stroke: true, fill: true }
        }).setOrigin(0.5);

        // --- 3. GRID SYSTEM ---
        // Cek data GameState agar tidak crash
        if (GameState && GameState.characters) {
            this.createCharacterGrid(width, height);
        }

        // --- 4. TOMBOL KEMBALI ---
        this.createBackButton();
    }

    createCharacterGrid(screenWidth, screenHeight) {
        const characters = GameState.characters;
        
        const cardWidth = 220;
        const cardHeight = 320;
        const gap = 40;

        // Responsive Columns
        const cols = screenWidth > 1000 ? 3 : screenWidth > 700 ? 2 : 1;
        
        // Centering Math
        const rows = Math.ceil(characters.length / cols);
        const gridWidth = (cols * cardWidth) + ((cols - 1) * gap);
        const gridHeight = (rows * cardHeight) + ((rows - 1) * gap);

        const startX = (screenWidth - gridWidth) / 2 + (cardWidth / 2);
        const startY = (screenHeight * 0.55) - (gridHeight / 2) + (cardHeight / 2);

        characters.forEach((char, index) => {
            const isUnlocked = GameState.player.unlockedCharacters.includes(char.id);

            const row = Math.floor(index / cols);
            const col = index % cols;

            const x = startX + (col * (cardWidth + gap));
            const y = startY + (row * (cardHeight + gap));

            this.createCard(x, y, char, isUnlocked, cardWidth, cardHeight);
        });
    }

    createCard(x, y, charData, isUnlocked, w, h) {
        const container = this.add.container(x, y);

        // --- Visual Kartu Modern ---
        const bg = this.add.graphics();
        
        const updateStyle = (hover) => {
            bg.clear();
            const color = isUnlocked ? 0x1e1b4b : 0x0f172a; // Biru Tua vs Hitam
            const borderColor = isUnlocked ? 0x8b5cf6 : 0x334155; // Ungu Neon vs Abu
            
            // Background
            bg.fillStyle(hover ? 0x2e1065 : color, 0.9);
            bg.fillRoundedRect(-w/2, -h/2, w, h, 20);
            
            // Border Neon
            bg.lineStyle(hover ? 4 : 2, hover ? 0xc4b5fd : borderColor, 1);
            bg.strokeRoundedRect(-w/2, -h/2, w, h, 20);
        };

        updateStyle(false);
        container.add(bg);

        if (isUnlocked) {
            // Placeholder Image Area
            const imgBox = this.add.rectangle(0, -h/4, w - 30, h/2 - 40, 0x000000, 0.3);
            const imgText = this.add.text(0, -h/4, "AVATAR", { fontSize: '14px', color: '#475569' }).setOrigin(0.5);

            // Nama & Stats
            const name = this.add.text(0, 25, charData.name.toUpperCase(), {
                fontFamily: 'Poppins', fontSize: '22px', fontStyle: 'bold', color: '#fff'
            }).setOrigin(0.5);

            const stats = this.add.text(0, 65, `PWR: ${charData.power}  SPD: ${charData.speed}`, {
                fontFamily: 'Inter', fontSize: '12px', color: '#cbd5e1'
            }).setOrigin(0.5);

            // Tombol Pilih Kecil
            const selectTxt = this.add.text(0, 110, "PILIH", {
                fontFamily: 'Inter', fontSize: '14px', fontStyle:'bold', color: '#8b5cf6'
            }).setOrigin(0.5);

            container.add([imgBox, imgText, name, stats, selectTxt]);

            // Interaksi
            container.setSize(w, h);
            container.setInteractive({ useHandCursor: true });

            container.on('pointerover', () => {
                updateStyle(true);
                this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
            });
            container.on('pointerout', () => {
                updateStyle(false);
                this.tweens.add({ targets: container, scale: 1, duration: 100 });
            });
            
            // Logic Klik
            container.on('pointerdown', () => {
                this.tweens.add({
                    targets: container,
                    scale: 0.95,
                    duration: 50,
                    yoyo: true,
                    onComplete: () => {
                        // Jalankan fungsi select
                        GameState.selectCharacter(charData.id);
                        this.scene.start('GameScene'); 
                    }
                });
            });

        } else {
            // Tampilan Locked
            const icon = this.add.text(0, -10, '🔒', { fontSize: '40px' }).setOrigin(0.5);
            const label = this.add.text(0, 30, "TERKUNCI", {
                fontFamily: 'Inter', fontSize: '12px', color: '#64748b'
            }).setOrigin(0.5);
            container.add([icon, label]);
        }

        // Animasi Muncul
        container.setScale(0);
        this.tweens.add({
            targets: container, scale: 1, duration: 400, delay: charData.id * 100, ease: 'Back.out'
        });
    }

    createBackButton() {
        const btn = this.add.container(60, 60);
        const bg = this.add.graphics();
        bg.fillStyle(0xef4444, 1);
        bg.fillCircle(0, 0, 24);
        const arrow = this.add.text(0, 0, '←', { fontSize: '28px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setPadding(0, 0, 0, 2);

        btn.add([bg, arrow]);
        btn.setSize(50, 50);
        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            this.tweens.add({ targets: btn, scale: 1.15, duration: 100 });
            bg.clear(); bg.fillStyle(0xf87171, 1); bg.fillCircle(0, 0, 24);
        });
        btn.on('pointerout', () => {
            this.tweens.add({ targets: btn, scale: 1, duration: 100 });
            bg.clear(); bg.fillStyle(0xef4444, 1); bg.fillCircle(0, 0, 24);
        });

        // KEMBALI KE LEVEL SELECT (Alur yang benar)
        btn.on('pointerdown', () => this.scene.start('LevelSelectScene'));
    }
}