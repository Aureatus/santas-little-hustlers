import Phaser from 'phaser';

export class EnvironmentRenderer {
  private scene: Phaser.Scene;
  private snowEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createBackground() {
    // Snow-covered ground
    this.scene.add.rectangle(512, 384, 1024, 768, 0xf0f8ff);
    
    // Draw grid pattern
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(1, 0xd0e8f0, 0.3);
    
    for (let x = 0; x < 1024; x += 80) {
      graphics.lineBetween(x, 0, x, 768);
    }
    for (let y = 0; y < 768; y += 80) {
      graphics.lineBetween(0, y, 1024, y);
    }
  }

  createBorder() {
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(4, 0x8b4513, 1);
    graphics.strokeRect(20, 20, 984, 728);
    
    // Snow drifts
    graphics.fillStyle(0xffffff, 0.6);
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(30, 994);
      const y = Phaser.Math.Between(30, 50);
      graphics.fillCircle(x, y, 15);
      
      const x2 = Phaser.Math.Between(30, 994);
      const y2 = Phaser.Math.Between(718, 738);
      graphics.fillCircle(x2, y2, 15);
    }
  }

  createSnowEffect() {
    this.snowEmitter = this.scene.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: 1024 },
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
