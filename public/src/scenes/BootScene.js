export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        try {
            this.createLoadingBar();
            this.generateAssets();
            this.loadExternalAssets();
        } catch (error) {
            console.error('[BootScene] Error during preload:', error);
        }
    }

    create() {
        try {
            this.scene.start('SplashScene');
        } catch (error) {
            console.error('[BootScene] Error starting SplashScene:', error);
        }
    }

    /**
     * Creates modern loading bar with progress indicator
     */
    createLoadingBar() {
        const { width, height } = this.cameras.main;

        // Background bar (dark background)
        this.add.rectangle(width / 2, height / 2, 400, 20, 0x1e293b).setOrigin(0.5);

        // Progress bar (cyan fill)
        const bar = this.add.rectangle(width / 2 - 200, height / 2, 0, 20, 0x38bdf8)
            .setOrigin(0, 0.5);

        // Update bar on progress
        this.load.on('progress', (value) => {
            bar.width = 400 * value;
        });
    }

    /**
     * Generates all dynamic game assets using Phaser Graphics API
     * Uses only standard, widely-supported methods for browser compatibility
     */
    generateAssets() {
        // 1. Splash Logo (Cyberpunk style with gradient)
        this.createGradientCircle(
            'logo_splash',
            140,
            140,
            70,
            70,
            50,
            '#ff006e',
            '#d91e63',
            '#00d9ff',
            'CQ'
        );

        // 2. Character Avatars
        this.createFilledCircle('hero_male', 120, 120, 60, 60, 50, 0x3b82f6);
        this.createFilledCircle('hero_female', 120, 120, 60, 60, 50, 0xec4899);

        // 3. Level Icons
        this.createLevelLocked();
        this.createLevelUnlocked();

        // 4. UI Assets
        this.createBackgroundGrid();
        this.createButtonStart();
    }

    /**
     * Loads external image assets from file system
     */
    loadExternalAssets() {
        this.load.image('bg-mainmenu', '/assets/images/backgrounds/bg-mainmenu.png');
        this.load.image('bg-level1', '/assets/images/backgrounds/bg-level1.png');
        this.load.image('bg-level2', '/assets/images/backgrounds/bg-level2.png');
        this.load.image('chapter', '/assets/images/backgrounds/chapter.png');
    }

    /**
     * Creates a gradient circle with text overlay
     * @param {string} key - Texture key name
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {number} centerX - Circle center X
     * @param {number} centerY - Circle center Y
     * @param {number} radius - Circle radius
     * @param {string} color1 - Gradient start color
     * @param {string} color2 - Gradient middle color
     * @param {string} color3 - Gradient end color
     * @param {string} text - Text to display
     */
    createGradientCircle(key, width, height, centerX, centerY, radius, color1, color2, color3, text) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error(`[BootScene] Failed to get 2D context for ${key}`);
            return;
        }

        // Dark background
        ctx.fillStyle = '#1a0033';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 15, 0, Math.PI * 2);
        ctx.fill();

        // Gradient circle
        const gradient = ctx.createLinearGradient(10, 10, width - 10, height - 10);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(0.5, color2);
        gradient.addColorStop(1, color3);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Border stroke
        ctx.strokeStyle = color3;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Text overlay
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 60px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, centerX, centerY);

        // Add to texture manager
        this.textures.addCanvas(key, canvas);
    }

    /**
     * Creates a simple filled circle texture
     * @param {string} key - Texture key name
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {number} centerX - Circle center X
     * @param {number} centerY - Circle center Y
     * @param {number} radius - Circle radius
     * @param {number} color - Hex color value
     */
    createFilledCircle(key, width, height, centerX, centerY, radius, color) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(color, 1);
        graphics.fillCircle(centerX, centerY, radius);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    /**
     * Creates locked level icon (gray box with lock symbol)
     */
    createLevelLocked() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // Gray rounded box
        graphics.fillStyle(0x475569, 1);
        graphics.fillRoundedRect(0, 0, 100, 100, 15);

        // Lock hole (center circle)
        graphics.fillStyle(0x1e293b, 1);
        graphics.fillCircle(50, 50, 20);

        graphics.generateTexture('level_locked', 100, 100);
        graphics.destroy();
    }

    /**
     * Creates unlocked level icon (blue box with "GO" text)
     * Uses canvas with manual rounded corners for broad browser support
     */
    createLevelUnlocked() {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('[BootScene] Failed to create level_unlocked texture');
            return;
        }

        // Draw rounded rectangle manually (compatible with all browsers)
        this.drawRoundedRect(ctx, 0, 0, 100, 100, 15, '#0ea5e9', true);

        // Draw text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GO', 50, 50);

        this.textures.addCanvas('level_unlocked', canvas);
    }

    /**
     * Creates background grid texture
     */
    createBackgroundGrid() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // Dark background
        graphics.fillStyle(0x0f172a, 1);
        graphics.fillRect(0, 0, 1280, 720);

        // Grid lines
        graphics.lineStyle(2, 0x1e293b, 1);
        const gridSize = 80;

        // Vertical lines
        for (let i = 0; i <= 1280; i += gridSize) {
            graphics.moveTo(i, 0);
            graphics.lineTo(i, 720);
        }

        // Horizontal lines
        for (let i = 0; i <= 720; i += gridSize) {
            graphics.moveTo(0, i);
            graphics.lineTo(1280, i);
        }

        graphics.strokePath();
        graphics.generateTexture('bg_level', 1280, 720);
        graphics.destroy();
    }

    /**
     * Creates start button texture
     */
    createButtonStart() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x38bdf8, 1);
        graphics.fillRoundedRect(0, 0, 250, 60, 12);
        graphics.generateTexture('btn_start', 250, 60);
        graphics.destroy();
    }

    /**
     * Draws a rounded rectangle on canvas context
     * Compatible with all browsers (manual implementation without ctx.roundRect)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Rectangle X position
     * @param {number} y - Rectangle Y position
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {number} radius - Corner radius
     * @param {string} color - Fill color (hex or CSS color)
     * @param {boolean} fill - Whether to fill (true) or stroke (false)
     */
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

        if (fill) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.stroke();
        }
    }
}