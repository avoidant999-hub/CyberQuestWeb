/**
 * LayoutManager - Bootstrap 5 + Phaser Integration
 * Handles responsive scaling, safe areas, and device-specific layout calculations
 * 
 * RESPONSIBILITIES:
 * - Provide responsive metrics for UI elements
 * - Handle responsive canvas scaling
 * - Calculate safe play areas for different devices
 * - Provide helper methods for positioning & sizing
 * 
 * ARCHITECTURE:
 * - Layer between Bootstrap layout and Phaser game logic
 * - Bridges CSS responsive design with JavaScript calculations
 * - Device-aware breakpoints: mobile (landscape), tablet, desktop
 */

export class LayoutManager {
  constructor(scene) {
    this.scene = scene;
    this.game = scene.game;
    
    // Cache metrics to avoid repeated calculations
    this.metrics = this.calculateMetrics();
    
    // Listen for resize events
    this.setupResizeListener();
  }

  /**
   * Calculate all responsive metrics based on current viewport
   */
  calculateMetrics() {
    const width = this.game.canvas.width;
    const height = this.game.canvas.height;
    const scale = this.game.scale;
    
    // Device classification
    const isMobileWidthRange = scale.displaySize.width < 768;
    const isTabletWidthRange = scale.displaySize.width >= 768 && scale.displaySize.width <= 1024;
    const isDesktopWidthRange = scale.displaySize.width > 1024;
    
    // Determine device type based on viewport
    const isLandscape = width >= height;
    const isMobileLandscape = isMobileWidthRange && isLandscape;
    const isTabletLandscape = isTabletWidthRange && isLandscape;
    const isDesktopLandscape = isDesktopWidthRange && isLandscape;
    
    return {
      // Canvas dimensions
      width,
      height,
      centerX: width / 2,
      centerY: height / 2,
      
      // Device type
      device: {
        isMobile: isMobileWidthRange,
        isTablet: isTabletWidthRange,
        isDesktop: isDesktopWidthRange,
        isLandscape,
        isMobileLandscape,
        isTabletLandscape,
        isDesktopLandscape,
      },
      
      // Responsive units (base on width for landscape priority)
      scale: this.calculateScaleFactor(width, height),
      
      // Font sizes (responsive)
      fontSize: {
        title: this.getFontSize('title', width, height),
        heading: this.getFontSize('heading', width, height),
        button: this.getFontSize('button', width, height),
        body: this.getFontSize('body', width, height),
        small: this.getFontSize('small', width, height),
      },
      
      // Component sizes (responsive)
      componentSize: {
        button: this.getButtonSize(width, height),
        card: this.getCardSize(width, height),
        modal: this.getModalSize(width, height),
      },
      
      // Spacing (responsive)
      spacing: {
        padding: this.getPadding(width, height),
        gap: this.getGap(width, height),
        margin: this.getMargin(width, height),
      },
      
      // Safe play area (accounting for UI elements)
      safeArea: this.getSafeArea(width, height),
    };
  }

  /**
   * Calculate overall scale factor for responsive sizing
   */
  calculateScaleFactor(width, height) {
    // Base scale at 1280x720 (desktop default)
    const baseWidth = 1280;
    const baseHeight = 720;
    
    // Scale relative to width (landscape priority)
    return width / baseWidth;
  }

  /**
   * Get responsive font size based on context
   */
  getFontSize(type, width, height) {
    const scale = this.calculateScaleFactor(width, height);
    const baseSize = {
      title: 48,      // Main menu titles
      heading: 32,    // Section headings
      button: 20,     // Button text
      body: 16,       // Body text
      small: 12,      // Small labels
    };
    
    const size = baseSize[type] || 16;
    const scaledSize = Math.floor(size * scale);
    
    // Clamp to reasonable ranges
    const min = baseSize[type] * 0.6;
    const max = baseSize[type] * 1.4;
    
    return Math.max(min, Math.min(scaledSize, max));
  }

  /**
   * Get responsive button size
   */
  getButtonSize(width, height) {
    const scale = this.calculateScaleFactor(width, height);
    
    return {
      width: Math.floor(160 * scale),
      height: Math.floor(50 * scale),
    };
  }

  /**
   * Get responsive card size
   */
  getCardSize(width, height, variant = 'medium') {
    const scale = this.calculateScaleFactor(width, height);
    
    const sizes = {
      small: { width: 100, height: 120 },
      medium: { width: 200, height: 240 },
      large: { width: 300, height: 360 },
    };
    
    const size = sizes[variant] || sizes.medium;
    
    return {
      width: Math.floor(size.width * scale),
      height: Math.floor(size.height * scale),
    };
  }

  /**
   * Get responsive modal/dialog size
   */
  getModalSize(width, height) {
    const scale = this.calculateScaleFactor(width, height);
    const maxWidth = width * 0.8;
    const maxHeight = height * 0.8;
    
    return {
      width: Math.floor(Math.min(600 * scale, maxWidth)),
      height: Math.floor(Math.min(400 * scale, maxHeight)),
    };
  }

  /**
   * Get responsive padding
   */
  getPadding(width, height) {
    const scale = this.calculateScaleFactor(width, height);
    
    return {
      normal: Math.floor(16 * scale),
      tight: Math.floor(8 * scale),
      loose: Math.floor(32 * scale),
    };
  }

  /**
   * Get responsive gap between elements
   */
  getGap(width, height) {
    const scale = this.calculateScaleFactor(width, height);
    
    return {
      small: Math.floor(8 * scale),
      normal: Math.floor(16 * scale),
      large: Math.floor(24 * scale),
    };
  }

  /**
   * Get responsive margin
   */
  getMargin(width, height) {
    const scale = this.calculateScaleFactor(width, height);
    
    return {
      small: Math.floor(8 * scale),
      normal: Math.floor(16 * scale),
      large: Math.floor(32 * scale),
    };
  }

  /**
   * Get safe play area (accounting for UI borders, headers, etc.)
   */
  getSafeArea(width, height) {
    // Leave margins from edges for UI
    const margin = 32;
    
    return {
      x: margin,
      y: margin,
      width: width - (margin * 2),
      height: height - (margin * 2),
    };
  }

  /**
   * Get center X coordinate
   */
  getCenterX() {
    return this.metrics.centerX;
  }

  /**
   * Get center Y coordinate
   */
  getCenterY() {
    return this.metrics.centerY;
  }

  /**
   * Get device type string for conditionals
   */
  getDeviceType() {
    if (this.metrics.device.isMobileLandscape) return 'mobile-landscape';
    if (this.metrics.device.isTabletLandscape) return 'tablet-landscape';
    if (this.metrics.device.isDesktopLandscape) return 'desktop-landscape';
    return 'unknown';
  }

  /**
   * Check if device is mobile
   */
  isMobile() {
    return this.metrics.device.isMobile;
  }

  /**
   * Check if device is tablet
   */
  isTablet() {
    return this.metrics.device.isTablet;
  }

  /**
   * Check if device is desktop
   */
  isDesktop() {
    return this.metrics.device.isDesktop;
  }

  /**
   * Calculate grid item size for responsive grids
   */
  getGridItemSize(columnsCount) {
    const safeArea = this.metrics.safeArea;
    const gap = this.metrics.spacing.gap.normal;
    
    // Account for gaps between items
    const totalGapSpace = gap * (columnsCount - 1);
    const availableWidth = safeArea.width - totalGapSpace;
    const itemWidth = availableWidth / columnsCount;
    
    // Maintain aspect ratio (square items)
    const itemHeight = itemWidth;
    
    return {
      width: Math.floor(itemWidth),
      height: Math.floor(itemHeight),
    };
  }

  /**
   * Setup resize listener for responsive updates
   */
  setupResizeListener() {
    // Use Phaser's built-in resize event
    this.scene.scale.on('resize', () => {
      this.metrics = this.calculateMetrics();
      this.onResize();
    });
  }

  /**
   * Hook for scenes to implement custom resize logic
   * Override in scene: onResize() { ... }
   */
  onResize() {
    // Default: do nothing
    // Scenes can override this method
  }

  /**
   * Helper: Create a positioned Phaser text object
   */
  createText(x, y, text, style = {}) {
    const defaultStyle = {
      fontSize: `${this.metrics.fontSize.body}px`,
      fontFamily: '"Poppins", sans-serif',
      color: '#e2e8f0',
      ...style,
    };
    
    return this.scene.add.text(x, y, text, defaultStyle);
  }

  /**
   * Helper: Create a positioned Phaser button
   */
  createButton(x, y, label, callback, style = {}) {
    const btnSize = this.metrics.componentSize.button;
    const defaultStyle = {
      fontSize: `${this.metrics.fontSize.button}px`,
      fontFamily: '"Poppins", sans-serif',
      color: '#0f172a',
      backgroundColor: '#06b6d4',
      padding: '10 20',
      border: '2px solid #06b6d4',
      borderRadius: '8px',
      ...style,
    };
    
    const btn = this.scene.add.text(x, y, label, defaultStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', callback);
    
    // Add hover effects
    btn.on('pointerover', () => {
      btn.setStyle({ backgroundColor: '#0ea5e9' });
    });
    
    btn.on('pointerout', () => {
      btn.setStyle({ backgroundColor: '#06b6d4' });
    });
    
    return btn;
  }

  /**
   * Debug: Log all current metrics to console
   */
  debugMetrics() {
    console.group('📊 LayoutManager Metrics');
    console.table({
      'Canvas Size': `${this.metrics.width}x${this.metrics.height}`,
      'Device Type': this.getDeviceType(),
      'Scale Factor': this.metrics.scale.toFixed(2),
      'Center': `(${this.metrics.centerX}, ${this.metrics.centerY})`,
    });
    
    console.group('Font Sizes');
    console.table(this.metrics.fontSize);
    console.groupEnd();
    
    console.group('Component Sizes');
    console.table({
      'Button': `${this.metrics.componentSize.button.width}x${this.metrics.componentSize.button.height}`,
      'Card': `${this.metrics.componentSize.card.width}x${this.metrics.componentSize.card.height}`,
      'Modal': `${this.metrics.componentSize.modal.width}x${this.metrics.componentSize.modal.height}`,
    });
    console.groupEnd();
    
    console.group('Safe Area');
    console.table(this.metrics.safeArea);
    console.groupEnd();
    
    console.groupEnd();
  }

  /**
   * Cleanup on scene shutdown
   */
  shutdown() {
    this.scene.scale.off('resize');
  }
}