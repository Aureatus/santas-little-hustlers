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
    // Snow-covered ground
    this.scene.add.rectangle(this.width / 2, this.height / 2, this.width, this.height, 0xf0f8ff);
    
    // Draw grid pattern
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(1, 0xd0e8f0, 0.15);
    
    for (let x = 0; x < this.width; x += 80) {
      graphics.lineBetween(x, 0, x, this.height);
    }
    for (let y = 0; y < this.height; y += 80) {
      graphics.lineBetween(0, y, this.width, y);
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
    this.snowEmitter = this.scene.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: this.width },
      y: -10,
      lifespan: 10000,
      speedY: { min: 20, max: 50 },
      speedX: { min: -10, max: 10 },
      scale: { min: 0.3, max: 0.8 },
      alpha: { min: 0.3, max: 0.8 },
      frequency: 200,
      blendMode: 'ADD'
    });
    
    this.snowEmitter.setDepth(100);
  }
}

