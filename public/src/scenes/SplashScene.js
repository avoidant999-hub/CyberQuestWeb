export class SplashScene extends Phaser.Scene {
    constructor() {
        super('SplashScene');
    }

    create() {
        const { width, height } = this.scale;

        // 1. Background Deep Cyberpunk Blue
        // Menggunakan warna hex gelap agar neon logo lebih 'pop'
        this.cameras.main.setBackgroundColor('#0a0e27');

        // 2. Container Pusat
        // Kita bungkus semua elemen dalam container agar animasinya menyatu
        const container = this.add.container(width / 2, height / 2);
        container.setDepth(1);
        container.setAlpha(0); // Mulai transparan (invisible)
        container.setScale(0.9); // Mulai sedikit lebih kecil

        // --- Visual Enhancements (Glow Effects) ---
        // Layer 1: Glow Ungu (Di belakang sekali, lebih besar)
        const glowPurple = this.add.circle(0, 0, 140, 0xb026ff);
        glowPurple.setAlpha(0.2);
        glowPurple.setBlendMode(Phaser.BlendModes.ADD); // Efek cahaya menyatu

        // Layer 2: Glow Cyan (Di tengah, lebih kecil)
        const glowCyan = this.add.circle(0, 0, 100, 0x00f7ff);
        glowCyan.setAlpha(0.15);
        glowCyan.setBlendMode(Phaser.BlendModes.ADD);

        // --- Main Logo ---
        // Pastikan key 'logo_cyberquest' sesuai dengan yang Anda load di PreloadScene
        const logo = this.add.image(0, 0, 'logo_cyberquest');
        
        // Sesuaikan skala ini agar pas di layar (tergantung resolusi asli gambar Anda)
        // Jika gambar asli besar, gunakan 0.5 atau 0.6
        logo.setScale(0.8); 

        // Tambahkan elemen ke container (Urutan: Glow dulu, baru Logo)
        container.add([glowPurple, glowCyan, logo]);


        // --- ANIMATION SEQUENCE (Industry Standard Approach) ---

        // Fase 1: Entrance (Muncul Elegan)
        this.tweens.add({
            targets: container,
            alpha: 1,
            scale: 1, // Kembali ke ukuran normal
            duration: 1200,
            ease: 'Cubic.easeOut', // Gerakan cepat di awal, melambat di akhir
            onComplete: () => {
                
                // Fase 2: Idle "Breathing" (Bernapas pelan saat diam)
                // Memberikan kesan logo hidup, tidak statis kaku
                this.tweens.add({
                    targets: container,
                    scale: 1.03, // Membesar sangat sedikit
                    duration: 1500,
                    yoyo: true, // Bolak-balik (besar-kecil)
                    repeat: 0,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        
                        // Fase 3: Exit (Transisi Masuk ke Game)
                        // Logo membesar ke arah kamera sambil menghilang
                        this.tweens.add({
                            targets: container,
                            alpha: 0,
                            scale: 1.2, // Zoom in effect
                            duration: 800,
                            ease: 'Cubic.easeIn',
                            onComplete: () => {
                                this.scene.start('MenuScene');
                            }
                        });
                    }
                });
                
                // Animasi tambahan khusus Glow (berdenyut independen)
                this.tweens.add({
                    targets: [glowPurple, glowCyan],
                    alpha: 0.3,
                    scale: 1.1,
                    duration: 1500,
                    yoyo: true,
                    repeat: 0,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        // --- Responsiveness ---
        // Menjaga posisi tetap di tengah jika browser di-resize
        this.scale.on("resize", (gameSize) => {
            const newWidth = gameSize.width;
            const newHeight = gameSize.height;
            container.setPosition(newWidth / 2, newHeight / 2);
        });
    }

    shutdown() {
        // Membersihkan event listener saat scene berpindah
        if (this.scale) {
            this.scale.off("resize");
        }
    }
}