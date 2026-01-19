export class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.scale = scene.scale;
    this.calculateMetrics();
  }

  get width() { return this.scale.width; }
  get height() { return this.scale.height; }
  getCenterX() { return this.width / 2; }

  calculateMetrics() {
    this.contentWidth = this.width * 0.9;
    this.contentHeight = this.height * 0.9;
  }

  getFontSize(type = "body") {
    const w = this.width;
    // Logika font responsif yang lebih aman
    let size = 16;
    if (type === "title") size = Math.min(w * 0.1, 64);
    else if (type === "heading") size = Math.min(w * 0.06, 48);
    else if (type === "button") size = Math.min(w * 0.045, 24);
    else size = Math.min(w * 0.035, 18);

    // Minimum size agar terbaca di HP
    if (type === "button" && size < 14) size = 14; 
    
    return Math.floor(size);
  }

  getButtonSize() {
    // Tombol tidak boleh terlalu lebar atau terlalu sempit
    const btnWidth = Math.min(350, Math.max(200, this.width * 0.4));
    const btnHeight = Math.min(70, Math.max(45, this.height * 0.08));
    return { width: btnWidth, height: btnHeight };
  }

  getVerticalSpacing(factor = 0.05) {
    return this.height * factor;
  }

  // Efek Partikel Background (Opsional, mempercantik menu)
  createParticleBackground() {
    // Jika tidak dibutuhkan, biarkan kosong atau hapus
  }
}