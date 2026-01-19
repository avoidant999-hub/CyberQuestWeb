import { UIManager } from "../systems/UIManager.js";

export class SplashScene extends Phaser.Scene {
    constructor() { 
        super('SplashScene');
        this.tweens = [];
    }

    create() {
        const { width, height } = this.scale;
        
        // Initialize UIManager
        const uiManager = new UIManager(this);

        // Background dengan gradient cyberpunk (purple to deep blue)
        this.cameras.main.setBackgroundColor('#0a0e27');
        
        // Add glow effect background
        const bgGradient = this.add.rectangle(width/2, height/2, width, height, 0x0f172a);
        bgGradient.setOrigin(0.5);
        bgGradient.setDepth(0);

        // Logo Container dengan background glow
        const container = this.add.container(width/2, height/2);
        container.setDepth(1);
        
        // Glow background circle
        const glowBg = this.add.circle(0, -20, 90, 0xff006e);
        glowBg.setAlpha(0.15);
        
        const logo = this.add.image(0, -20, 'logo_splash');
        logo.setScale(1.2);
        
        // Responsive font size
        const fontSize = uiManager.getFontSize("heading");
        
        const text = this.add.text(0, 60, "KELOMPOK 4\nLITERASI DIGITAL", {
            fontFamily: 'Poppins', 
            fontSize: fontSize + 'px',
            fontStyle: 'bold',
            align: 'center', 
            color: '#00d9ff',
            stroke: '#ff006e',
            strokeThickness: 1
        }).setOrigin(0.5);
        
        container.add([glowBg, logo, text]);
        container.setAlpha(0); // Mulai transparan

        // Animasi Fade In -> Wait -> Fade Out
        const fadeInTween = this.tweens.add({
            targets: container,
            alpha: 1,
            y: height/2 - 30, // Sedikit gerak ke atas
            duration: 1200,
            ease: 'Power2.easeInOut',
            onComplete: () => {
                // Scale animation saat display
                const scaleTween = this.tweens.add({
                    targets: logo,
                    scale: 1.3,
                    duration: 600,
                    yoyo: true,
                    ease: 'Sine.easeInOut'
                });
                
                this.time.delayedCall(1500, () => {
                    const fadeOutTween = this.tweens.add({
                        targets: container,
                        alpha: 0,
                        duration: 1000,
                        ease: 'Power2.easeIn',
                        onComplete: () => this.scene.start('MenuScene')
                    });
                });
            }
        });

        // Handle resize event to maintain centered position
        this.scale.on("resize", () => {
            const newWidth = this.scale.width;
            const newHeight = this.scale.height;
            container.setPosition(newWidth / 2, newHeight / 2);
            bgGradient.setDisplaySize(newWidth, newHeight);
        });
    }

    shutdown() {
        // Clean up event listeners and tweens
        try {
            if (this.scale) {
                this.scale.off("resize");
            }
            // Phaser automatically stops tweens on scene shutdown
            console.log("[SplashScene] Cleanup complete");
        } catch (error) {
            console.warn("[SplashScene] Error during shutdown:", error);
        }
    }
}