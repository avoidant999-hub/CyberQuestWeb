export class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.scale = scene.scale;
    this.calculateMetrics();
  }

  get width() { return this.scale.width; }
  get height() { return this.scale.height; }
  getCenterX() { return this.width / 2; }
  getCenterY() { return this.height / 2; }

  calculateMetrics() {
    const { width, height } = this.scale;
    this.horizontalPadding = width * 0.05;
    this.verticalPadding = height * 0.05;
    this.contentWidth = width - this.horizontalPadding * 2;
    this.contentHeight = height - this.verticalPadding * 2;
  }

  getFontSize(type = "body") {
    const h = this.height;
    const w = this.width;

    switch (type) {
      case "title":
        // Menggunakan lebar (w) agar font judul tetap besar di landscape
        return Math.max(24, Math.min(64, Math.floor(w * 0.08)));
      case "heading":
        return Math.max(18, Math.min(60, Math.floor(h * 0.07)));
      case "button":
        return Math.max(12, Math.min(28, Math.floor(h * 0.05)));
      case "body":
      default:
        return Math.max(10, Math.min(24, Math.floor(h * 0.025)));
    }
  }

  getButtonSize() {
    const btnWidth = Math.max(160, Math.min(350, this.contentWidth * 0.35));
    const btnHeight = Math.max(35, Math.min(70, this.height * 0.12));
    return { width: btnWidth, height: btnHeight };
  }

  getVerticalSpacing(factor = 0.08) {
    return Math.max(8, this.height * factor);
  }

  createParticleBackground() {
    const { width, height } = this;
    
    this.scene.add
      .rectangle(width / 2, height / 2, width, height, 0x0f172a)
      .setDepth(-100);

    if (!this.scene.textures.exists("particle_square")) {
      const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff);
      g.fillRect(0, 0, 8, 8);
      g.generateTexture("particle_square", 8, 8);
    }

    this.scene.add.particles(0, 0, "particle_square", {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      lifespan: 4000,
      speedY: { min: -50, max: 50 },
      speedX: { min: -50, max: 50 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.5, end: 0 },
      tint: [0xfacc15, 0x38bdf8, 0xf472b6, 0x4ade80],
      quantity: 1,
      frequency: 200,
      blendMode: "ADD"
    }).setDepth(-98);
  }
}