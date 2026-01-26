export class UIManager {
  constructor(scene) {
    this.scene = scene;
    // Cache ukuran layar saat inisialisasi
    this.refreshMetrics();
    
    // Auto-refresh saat layar di-resize
    this.scene.scale.on('resize', () => this.refreshMetrics());
  }

  // --- GETTERS (Shorthand untuk akses cepat) ---
  get width() { return this.scene.scale.width; }
  get height() { return this.scene.scale.height; }
  get cx() { return this.width / 2; } // Center X
  get cy() { return this.height / 2; } // Center Y

  /**
   * Mengupdate metrik saat layar berubah ukuran/orientasi
   */
  refreshMetrics() {
    this.isPortrait = this.height > this.width;
    this.contentWidth = this.width * 0.9;
    this.contentHeight = this.height * 0.9;
  }

  /**
   * Menghitung ukuran font responsif berdasarkan lebar layar
   * @param {string} type - 'title', 'heading', 'body', 'button'
   */
  getFontSize(type = "body") {
    const w = this.width;
    let size = 16;

    switch (type) {
      case "title":
        size = Math.min(w * 0.1, 64); // Max 64px
        break;
      case "heading":
        size = Math.min(w * 0.06, 48); // Max 48px
        break;
      case "button":
        size = Math.min(w * 0.045, 24); // Max 24px
        break;
      case "caption":
        size = Math.min(w * 0.03, 14); // Kecil
        break;
      default: // "body"
        size = Math.min(w * 0.035, 18);
    }
    return Math.max(12, Math.floor(size));
  }

  /**
   * Menghitung dimensi tombol yang proporsional
   * @returns {object} {width, height, radius}
   */
  getButtonSize() {
    // Tombol responsif: 40% lebar layar, min 200px, max 350px
    const btnWidth = Phaser.Math.Clamp(this.width * 0.4, 200, 350);
    // Tinggi tombol: 8% tinggi layar, min 45px, max 70px
    const btnHeight = Phaser.Math.Clamp(this.height * 0.08, 45, 70);
    
    return { 
        width: btnWidth, 
        height: btnHeight,
        radius: 12 
    };
  }

  /**
   * [DITAMBAHKAN] Menghitung jarak vertikal (spacing) responsif
   * Ini memperbaiki ERROR FATAL di MenuScene
   * @param {number} ratio - Persentase dari tinggi layar (default 0.05)
   */
  getVerticalSpacing(ratio = 0.05) {
    return this.height * ratio;
  }

  /**
   * [OPSIONAL] Placeholder untuk partikel agar MenuScene tidak error saat check
   * Jika nanti mau ditambahkan efek partikel, logic-nya taruh di sini.
   */
  createParticleBackground() {
    // Saat ini dikosongkan agar performa ringan (Clean Code).
    // Keberadaan fungsi kosong ini mencegah error jika MenuScene memanggilnya tanpa "if check" yang ketat.
  }

  /**
   * Helper untuk menempatkan objek di tengah secara presisi
   */
  centerObject(object, offsetX = 0, offsetY = 0) {
    object.setPosition(this.cx + offsetX, this.cy + offsetY);
  }

  /**
   * Helper untuk membuat Container UI melayang (Overlay Hitam)
   */
  createModalOverlay(alpha = 0.8) {
    const overlay = this.scene.add.rectangle(
        this.cx, this.cy, 
        this.width, this.height, 
        0x000000, alpha
    );
    overlay.setInteractive(); // Blokir input di belakangnya
    return overlay;
  }
}