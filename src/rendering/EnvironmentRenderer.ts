import Phaser from 'phaser';

export class EnvironmentRenderer {
  private scene: Phaser.Scene;
  private snowEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private width: number;
  private height: number;
 
  constructor(scene: Phaser.Scene, width: number = 1024, height: number = 768) {
    this.scene = scene;
    this.width = width;
    this.height = height;
  }
 
  createBackground() {
    // Base snow tone
    const base = this.scene.add.graphics();
    base.setDepth(0);
    base.fillStyle(0xbfd8ef, 1);
    base.fillRect(0, 0, this.width, this.height);

    // Gentle glow in the middle to highlight the play space
    const light = this.scene.add.graphics();
    light.setDepth(0);
    const maxRadius = Math.max(this.width, this.height) * 0.7;
    const gradientSteps = [
      { color: 0xffffff, alpha: 0.35, scale: 1 },
      { color: 0xeaf6ff, alpha: 0.25, scale: 0.7 },
      { color: 0xd7eefc, alpha: 0.18, scale: 0.45 }
    ];
    gradientSteps.forEach(step => {
      light.fillStyle(step.color, step.alpha);
      light.fillCircle(this.width / 2, this.height / 2.5, maxRadius * step.scale);
    });

    // Wind-swept drifts
    const driftGraphics = this.scene.add.graphics();
    driftGraphics.setDepth(0.05);
    for (let i = 0; i < 20; i++) {
      driftGraphics.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.08, 0.18));
      const width = Phaser.Math.Between(120, 260);
      const height = Phaser.Math.Between(30, 60);
      const x = Phaser.Math.Between(-50, this.width + 50);
      const y = Phaser.Math.Between(0, this.height);
      driftGraphics.fillEllipse(x, y, width, height);
    }

    // Implied pathways for interest
    const pathGraphics = this.scene.add.graphics();
    pathGraphics.setDepth(0.08);
    pathGraphics.fillStyle(0xf2e7cd, 0.25);
    const pathWidth = 180;
    const midY = this.height * 0.65;
    pathGraphics.fillRoundedRect(this.width * 0.1, midY, this.width * 0.8, pathWidth, 90);
    pathGraphics.fillCircle(this.width * 0.1, midY + pathWidth / 2, pathWidth / 2);
    pathGraphics.fillCircle(this.width * 0.9, midY + pathWidth / 2, pathWidth / 2);

    // Evergreens in the distance
    const treeGraphics = this.scene.add.graphics();
    treeGraphics.setDepth(0.09);
    for (let i = 0; i < 25; i++) {
      const treeX = Phaser.Math.Between(-60, this.width + 60);
      const treeY = Phaser.Math.Between(-20, this.height * 0.4);
      const treeHeight = Phaser.Math.Between(60, 140);
      treeGraphics.fillStyle(0x1f5130, 0.25);
      treeGraphics.fillTriangle(
        treeX,
        treeY + treeHeight,
        treeX - treeHeight * 0.35,
        treeY,
        treeX + treeHeight * 0.35,
        treeY
      );
    }

    // Subtle tile overlay (adds snow-plate variation under the grid)
    const tiles = this.scene.add.graphics();
    tiles.setDepth(0.1);
    const tileSize = 64;
    for (let x = 0; x < this.width; x += tileSize) {
      for (let y = 0; y < this.height; y += tileSize) {
        if ((x / tileSize + y / tileSize) % 2 === 0) {
          tiles.fillStyle(0xffffff, 0.04);
          tiles.fillRect(x, y, tileSize, tileSize);
        }
      }
    }

    // Draw grid pattern on top of the textured ground
    const grid = this.scene.add.graphics();
    grid.setDepth(0.2);
    grid.lineStyle(1, 0xffffff, 0.08);
    for (let x = 0; x < this.width; x += 80) {
      grid.lineBetween(x, 0, x, this.height);
    }
    for (let y = 0; y < this.height; y += 80) {
      grid.lineBetween(0, y, this.width, y);
    }
  }
 
  createBorder() {
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(4, 0x8b4513, 1);
    graphics.strokeRect(20, 20, this.width - 40, this.height - 40);
    
    // Snow drifts
    graphics.fillStyle(0xffffff, 0.6);
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(30, this.width - 30);
      const y = Phaser.Math.Between(30, 50);
      graphics.fillCircle(x, y, 15);
      
      const x2 = Phaser.Math.Between(30, this.width - 30);
      const y2 = Phaser.Math.Between(this.height - 50, this.height - 30);
      graphics.fillCircle(x2, y2, 15);
    }
  }
 
  createSnowEffect() {
    const farSnow = this.scene.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: this.width },
      y: { min: -20, max: 0 },
      lifespan: 16000,
      speedY: { min: 10, max: 35 },
      speedX: { min: -15, max: 15 },
      scale: { min: 0.1, max: 0.35 },
      alpha: { min: 0.15, max: 0.35 },
      rotate: { min: -10, max: 10 },
      frequency: 120,
      blendMode: 'SCREEN'
    });
    farSnow.setDepth(120);

    const midSnow = this.scene.add.particles(0, 0, 'snowflake', {
      x: { min: -100, max: this.width + 100 },
      y: { min: -40, max: 0 },
      lifespan: 11000,
      speedY: { min: 35, max: 70 },
      speedX: { min: -25, max: 25 },
      scale: { min: 0.25, max: 0.6 },
      alpha: { min: 0.25, max: 0.55 },
      rotate: { min: -35, max: 35 },
      frequency: 90,
      blendMode: 'ADD'
    });
    midSnow.setDepth(150);

    this.snowEmitter = this.scene.add.particles(0, 0, 'snowflake', {
      x: { min: -200, max: this.width + 200 },
      y: { min: -50, max: 0 },
      lifespan: 7000,
      speedY: { min: 80, max: 140 },
      speedX: { min: -60, max: 60 },
      scale: { min: 0.4, max: 0.9 },
      alpha: { min: 0.35, max: 0.85 },
      rotate: { min: -70, max: 70 },
      frequency: 60,
      blendMode: 'ADD'
    });
    
    this.snowEmitter.setDepth(200);
  }
}

