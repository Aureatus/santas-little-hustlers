import Phaser from 'phaser';

export class Coin extends Phaser.Physics.Arcade.Sprite {
  private value: number = 10;
  private lifespan: number = 10000; // 10 seconds
  private lifespanTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number, value: number = 10) {
    super(scene, x, y, 'coin');
    
    this.value = value;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setDepth(8);
    
    // Spawn animation
    this.setScale(0);
    scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 200,
      ease: 'Back.out'
    });
    
    // Floating animation
    scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
    
    // Rotation
    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 2000,
      repeat: -1,
      ease: 'Linear'
    });
    
    // Spawn particles
    this.createSpawnParticles();
    
    // Auto-destroy after lifespan
    this.lifespanTimer = scene.time.delayedCall(this.lifespan, () => {
      this.fadeOut();
    });
  }

  private createSpawnParticles() {
    const particles = this.scene.add.particles(this.x, this.y, 'coin', {
      speed: { min: 20, max: 50 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 300,
      quantity: 5,
      blendMode: 'ADD'
    });
    
    particles.setDepth(7);
    
    this.scene.time.delayedCall(300, () => {
      particles.destroy();
    });
  }

  collect() {
    // Cancel the lifespan timer since we're being collected
    if (this.lifespanTimer) {
      this.lifespanTimer.destroy();
      this.lifespanTimer = undefined;
    }
    
    // Check if already destroyed or scene is invalid
    if (!this.scene || !this.active) {
      return;
    }

    // Create collection particles
    this.createCollectionParticles();
    
    // Collection animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 50,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  private createCollectionParticles() {
    const particles = this.scene.add.particles(this.x, this.y, 'coin', {
      speed: { min: 50, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 8,
      blendMode: 'ADD'
    });
    
    particles.setDepth(15);
    
    this.scene.time.delayedCall(400, () => {
      particles.destroy();
    });
  }

  private fadeOut() {
    // Check if already destroyed or scene is invalid
    if (!this.scene || !this.active) {
      return;
    }
    
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  getValue(): number {
    return this.value;
  }
}
