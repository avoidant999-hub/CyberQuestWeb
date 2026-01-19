import { LeaderboardSystem } from '../systems/LeaderboardSystem.js';
import { UIManager } from '../systems/UIManager.js';

export class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super('LeaderboardScene');
    }

    create() {
        this.uiManager = new UIManager(this);
        const { width, height } = this.scale;

        // 1. BACKGROUND
        const bg = this.add.image(width / 2, height / 2, "bg-mainmenu");
        bg.setDisplaySize(width, height);

        // 2. JUDUL (DIPERKECIL UNTUK MOBILE)
        const titleText = this.add.text(width / 2, height * 0.12, "TOP AGENTS", {
            fontFamily: 'Poppins', 
            fontSize: Math.min(width * 0.08, 42) + 'px', // Responsif
            color: '#facc15', 
            fontStyle: '900',
            stroke: '#000000', 
            strokeThickness: 6,
            shadow: { blur: 10, color: '#b45309', stroke: true, fill: true }
        }).setOrigin(0.5);

        // 3. TABEL LEADERBOARD (DINAMIS)
        // Naikkan posisi tabel agar ada ruang di bawah untuk tombol
        const cardW = Math.min(width * 0.8, 600);
        const cardH = height * 0.5; // Menggunakan persentase tinggi
        const container = this.add.container(width / 2, height * 0.48); 

        const tableBg = this.add.rectangle(0, 0, cardW, cardH, 0x000000, 0.8)
            .setStrokeStyle(3, 0xffffff);
        container.add(tableBg);

        // Header Kolom
        const headerY = -cardH/2 + 30;
        const hStyle = { fontSize: '18px', color: '#38bdf8', fontStyle:'bold' };
        const h1 = this.add.text(-cardW * 0.35, headerY, "RANK", hStyle).setOrigin(0.5);
        const h2 = this.add.text(0, headerY, "AGENT", hStyle).setOrigin(0.5);
        const h3 = this.add.text(cardW * 0.35, headerY, "SKOR", hStyle).setOrigin(0.5);
        
        const line = this.add.rectangle(0, headerY + 25, cardW * 0.9, 2, 0xffffff).setOrigin(0.5);
        container.add([h1, h2, h3, line]);

        // Loading Data
        this.loadingText = this.add.text(0, 0, "MENCARI DATA...", {
            fontFamily: 'Poppins', fontSize: '18px', color: '#ffffff'
        }).setOrigin(0.5);
        container.add(this.loadingText);

        this.leaderboardContainer = container;
        this.cardW = cardW;
        this.cardH = cardH;

        LeaderboardSystem.getTopScores().then(scores => {
            if (this.loadingText && this.loadingText.active) this.loadingText.destroy();
            this.displayScores(scores);
        });

        // 4. TOMBOL KEMBALI (POSISI AMAN)
        // Letakkan di 88% tinggi layar agar tidak terpotong address bar
        const btnY = height * 0.82; 
        this.createPixelButton(width / 2, btnY, "KEMBALI", 0xff006e, () => {
            this.scene.start('MenuScene');
        });
    }

    displayScores(scores) {
        const startY = -this.cardH/2 + 85;
        const rowHeight = (this.cardH - 100) / 6; // Hitung tinggi baris otomatis

        if (scores.length === 0) {
            this.leaderboardContainer.add(this.add.text(0, 0, "BELUM ADA DATA", { color: '#fff' }).setOrigin(0.5));
            return;
        }

        scores.forEach((data, index) => {
            if (index > 5) return; // Batasi 6 data agar tidak berhimpitan di layar kecil

            const y = startY + (index * rowHeight);
            let rankColor = '#ffffff';
            let icon = "#" + (index + 1);
            
            if (index === 0) { rankColor = '#facc15'; icon = "👑"; }
            else if (index === 1) { rankColor = '#94a3b8'; icon = "🥈"; }
            else if (index === 2) { rankColor = '#b45309'; icon = "🥉"; }

            const txtRank = this.add.text(-this.cardW * 0.35, y, icon, { 
                fontSize: '18px', color: rankColor 
            }).setOrigin(0.5);

            let safeName = (data.name || "Anonim").substring(0, 10);
            const txtName = this.add.text(0, y, safeName, { 
                fontSize: '16px', color: '#ffffff'
            }).setOrigin(0.5);

            const txtScore = this.add.text(this.cardW * 0.35, y, data.score, { 
                fontSize: '18px', color: '#f472b6', fontStyle: 'bold' 
            }).setOrigin(0.5);

            this.leaderboardContainer.add([txtRank, txtName, txtScore]);
        });
    }

    createPixelButton(x, y, text, color, callback) {
        const btn = this.add.container(x, y);
        const w = 180; 
        const h = 45;

        const bg = this.add.rectangle(0, 0, w, h, color).setStrokeStyle(2, 0xffffff);
        const txt = this.add.text(0, 0, text, {
            fontFamily: 'Poppins', fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        const hit = this.add.rectangle(0, 0, w, h, 0x000000, 0).setInteractive({ useHandCursor: true });
        hit.on('pointerdown', callback);
        
        btn.add([bg, txt, hit]);
        return btn;
    }
}