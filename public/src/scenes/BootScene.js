export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Event listener untuk error loading (sangat penting untuk debugging)
        this.load.on('loaderror', (file) => {
            console.error(`[BootScene] Gagal memuat: ${file.key} dari ${file.url}`);
        });

        try {
            this.createLoadingBar();
            
            // 1. Muat aset file eksternal (Gambar, Logo, Background)
            this.loadExternalAssets();
            
            // 2. Buat aset grafis placeholder (untuk Avatar, Icon Level, dll)
            // Logo Splash SUDAH DIHAPUS dari sini karena diganti gambar asli
            this.generateGameAssets();
            
        } catch (error) {
            console.error('[BootScene] Error during preload:', error);
        }
    }

    create() {
        // Setelah semua aset siap, langsung pindah ke SplashScene
        this.scene.start('SplashScene');
    }

    /**
     * Memuat aset eksternal (Gambar/Audio)
     * Menggunakan logo_cyberquest.jpeg sesuai permintaan
     */
    loadExternalAssets() {
        // Set path dasar agar tidak perlu mengetik ulang folder assets
        this.load.setPath('assets/images/');

        // --- ASET UTAMA ---
        // Pastikan file 'logo_cyberquest.jpeg' ada di folder 'assets/images/'
        this.load.image('logo_cyberquest', 'backgrounds/logo_cyberquest.jpeg'); 

        // --- BACKGROUNDS ---
        // Perhatikan struktur folder Anda, sesuaikan jika perlu
        this.load.image('bg-mainmenu', 'backgrounds/bg-mainmenu.png');
        this.load.image('bg-level1', 'backgrounds/bg-level1.png');
        this.load.image('bg-level2', 'backgrounds/bg-level2.png');
        this.load.image('chapter', 'backgrounds/chapter.png');
        
        // Reset path agar tidak mengganggu load scene lain jika ada
        this.load.setPath(''); 
    }

    /**
     * Membuat aset game prosedural (Graphics)
     * Hanya untuk elemen UI game (Avatar, Tombol), bukan Logo Splash lagi.
     */
    generateGameAssets() {
        // 1. Character Avatars
        this.createFilledCircle('hero_male', 120, 120, 60, 60, 50, 0x3b82f6);
        this.createFilledCircle('hero_female', 120, 120, 60, 60, 50, 0xec4899);

        // 2. Level Icons (Locked/Unlocked)
        this.createLevelLocked();
        this.createLevelUnlocked();

        // 3. UI Assets (Grid & Button)
        this.createBackgroundGrid();
        this.createButtonStart();
    }

    /**
     * Membuat Loading Bar Modern
     */
    createLoadingBar() {
        const { width, height } = this.cameras.main;

        // Background bar (Dark slate)
        this.add.rectangle(width / 2, height / 2, 400, 20, 0x1e293b).setOrigin(0.5);

        // Progress bar (Cyan)
        const bar = this.add.rectangle(width / 2 - 200, height / 2, 0, 20, 0x38bdf8).setOrigin(0, 0.5);

        // Update panjang bar berdasarkan progress load
        this.load.on('progress', (value) => {
            bar.width = 400 * value;
        });
    }

    // --- HELPER FUNCTIONS UNTUK GENERATE ASSETS ---

    createFilledCircle(key, width, height, centerX, centerY, radius, color) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(color, 1);
        graphics.fillCircle(centerX, centerY, radius);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    createLevelLocked() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x475569, 1);
        graphics.fillRoundedRect(0, 0, 100, 100, 15);
        graphics.fillStyle(0x1e293b, 1); // Lubang kunci
        graphics.fillCircle(50, 50, 20);
        graphics.generateTexture('level_locked', 100, 100);
        graphics.destroy();
    }

    createLevelUnlocked() {
        // Menggunakan Canvas API untuk kompatibilitas broad browser
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        this.drawRoundedRect(ctx, 0, 0, 100, 100, 15, '#0ea5e9', true);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GO', 50, 50);

        this.textures.addCanvas('level_unlocked', canvas);
    }

    createBackgroundGrid() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x0f172a, 1);
        graphics.fillRect(0, 0, 1280, 720);
        graphics.lineStyle(2, 0x1e293b, 1);
        
        const gridSize = 80;
        for (let i = 0; i <= 1280; i += gridSize) {
            graphics.moveTo(i, 0);
            graphics.lineTo(i, 720);
        }
        for (let i = 0; i <= 720; i += gridSize) {
            graphics.moveTo(0, i);
            graphics.lineTo(1280, i);
        }

        graphics.strokePath();
        graphics.generateTexture('bg_level', 1280, 720);
        graphics.destroy();
    }

    createButtonStart() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x38bdf8, 1);
        graphics.fillRoundedRect(0, 0, 250, 60, 12);
        graphics.generateTexture('btn_start', 250, 60);
        graphics.destroy();
    }

    // Helper untuk rounded rect di canvas
    drawRoundedRect(ctx, x, y, width, height, radius, color, fill = true) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (fill) { ctx.fillStyle = color; ctx.fill(); } 
        else { ctx.strokeStyle = color; ctx.stroke(); }
    }
}