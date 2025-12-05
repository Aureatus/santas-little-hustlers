import * as Phaser from 'phaser';
import { TreeResearchEffects } from '../systems/ResearchSystem';

export class ChristmasTree {

  private scene: Phaser.Scene;
  private sprite!: Phaser.GameObjects.Graphics;
  private x: number;
  private y: number;
  private cooldown: number = 0;
  private readonly baseMaxCooldown: number = 2000;
  private readonly baseCoinValue: number = 1;
  private readonly baseCoinCount: number = 2;
  private maxCooldown: number = this.baseMaxCooldown; // 2 seconds between shakes
  private coinValue: number = this.baseCoinValue; // Reduced from 3 to 1
  private coinCount: number = this.baseCoinCount;
  private cooldownBar?: Phaser.GameObjects.Graphics;
  private promptText?: Phaser.GameObjects.Text;
  private onCoinDrop: (x: number, y: number, value: number) => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    onCoinDrop: (x: number, y: number, value: number) => void
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.onCoinDrop = onCoinDrop;

    this.createTree();
    this.createPrompt();
    this.createCooldownBar();
  }

  private createTree() {
    this.sprite = this.scene.add.graphics();
    this.sprite.setDepth(4);
    
    // Draw a Christmas tree
    // Tree layers (green triangles)
    this.sprite.fillStyle(0x2d5016, 1);
    this.sprite.fillTriangle(this.x, this.y - 80, this.x - 40, this.y - 40, this.x + 40, this.y - 40);
    this.sprite.fillTriangle(this.x, this.y - 60, this.x - 50, this.y - 60, this.x + 50, this.y - 60);
    this.sprite.fillTriangle(this.x, this.y - 40, this.x - 60, this.y - 40, this.x + 60, this.y - 40);
    
    // Trunk
    this.sprite.fillStyle(0x8b4513, 1);
    this.sprite.fillRect(this.x - 10, this.y, 20, 20);
    
    // Star on top
    this.sprite.fillStyle(0xffd700, 1);
    this.sprite.fillCircle(this.x, this.y - 85, 8);
    
    // Ornaments
    const ornamentColors = [0xff0000, 0x0000ff, 0xffd700, 0xff69b4];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const ornamentX = this.x + Math.cos(angle) * 35;
      const ornamentY = this.y - 60 + Math.sin(angle) * 30;
      this.sprite.fillStyle(ornamentColors[i % ornamentColors.length], 1);
      this.sprite.fillCircle(ornamentX, ornamentY, 4);
    }

    // Make it interactive
    const hitArea = new Phaser.Geom.Rectangle(this.x - 60, this.y - 90, 120, 110);
    this.sprite.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    this.sprite.on('pointerdown', () => this.shake());
    
    // Hover effect - highlight but don't move
    this.sprite.on('pointerover', () => {
      if (this.cooldown <= 0) {
        this.scene.tweens.add({
          targets: this.sprite,
          alpha: 0.9,
          duration: 150,
          yoyo: true,
          repeat: 0
        });
      }
    });
    
    this.sprite.on('pointerout', () => {
      this.sprite.setAlpha(1);
    });
  }

  private createPrompt() {
    this.promptText = this.scene.add.text(this.x, this.y - 110, '🎄 Click me!', {
      fontSize: '18px',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.promptText.setOrigin(0.5);
    this.promptText.setDepth(10);
    
    // Pulsing animation
    this.scene.tweens.add({
      targets: this.promptText,
      scale: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  private createCooldownBar() {
    this.cooldownBar = this.scene.add.graphics();
    this.cooldownBar.setDepth(10);
  }

  private createShakeParticles() {
    // Enhanced snowflakes and magical particles
    const particles = this.scene.add.particles(this.x, this.y - 40, 'snowflake', {
      speed: { min: 50, max: 100 },
      angle: { min: 60, max: 120 },
      scale: { start: 0.8, end: 0.3 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 15,
      gravityY: 200
    });
    
    // Add magical sparkles
    const sparkles = this.scene.add.particles(this.x, this.y - 40, 'star', {
      speed: { min: 30, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 800,
      quantity: 8,
      tint: 0x00ffff,
      blendMode: 'ADD'
    });
    
    particles.setDepth(15);
    sparkles.setDepth(16);
    
    this.scene.time.delayedCall(600, () => {
      particles.destroy();
    });
    
    this.scene.time.delayedCall(800, () => {
      sparkles.destroy();
    });
  }

  private shake() {
    if (this.cooldown > 0) return; // Still on cooldown

    // Start cooldown
    this.cooldown = this.maxCooldown;

    // Hide prompt during cooldown
    if (this.promptText) {
      this.promptText.setVisible(false);
    }

    // Shake animation
    const originalX = this.sprite.x;
    this.scene.tweens.add({
      targets: this.sprite,
      x: originalX - 5,
      duration: 50,
      yoyo: true,
      repeat: 5,
      ease: 'Sine.inOut'
    });

    // Create particle effect
    this.createShakeParticles();

    // Drop coins - just 2 coins per shake for slow progression (modified by research)
    console.log(`[TREE] Shaking tree, dropping ${this.coinCount} coins of ${this.coinValue} value each = ${this.coinCount * this.coinValue} total`);
    for (let i = 0; i < this.coinCount; i++) {
      const offsetX = Phaser.Math.Between(-30, 30);
      const offsetY = Phaser.Math.Between(-20, 20);
      
      this.scene.time.delayedCall(i * 100, () => {
        console.log(`[TREE] Dropping coin ${i+1} with value ${this.coinValue}`);
        this.onCoinDrop(this.x + offsetX, this.y + offsetY, this.coinValue);
      });
    }
    
    // Visual feedback
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 0.95,
      scaleY: 1.05,
      duration: 100,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.inOut'
    });
  }

  update(delta: number) {
    if (this.cooldown > 0) {
      this.cooldown -= delta;
      
      // Update cooldown bar
      if (this.cooldownBar) {
        this.cooldownBar.clear();
        
        const barWidth = 80;
        const barHeight = 8;
        const progress = 1 - (this.cooldown / this.maxCooldown);
        
        // Background
        this.cooldownBar.fillStyle(0x666666, 0.8);
        this.cooldownBar.fillRect(this.x - barWidth / 2, this.y + 30, barWidth, barHeight);
        
        // Progress
        this.cooldownBar.fillStyle(0x90EE90, 1);
        this.cooldownBar.fillRect(this.x - barWidth / 2, this.y + 30, barWidth * progress, barHeight);
        
        // Border
        this.cooldownBar.lineStyle(2, 0x000000, 1);
        this.cooldownBar.strokeRect(this.x - barWidth / 2, this.y + 30, barWidth, barHeight);
      }
      
      if (this.cooldown <= 0) {
        // Cooldown complete
        this.cooldown = 0;
        if (this.cooldownBar) {
          this.cooldownBar.clear();
        }
        if (this.promptText) {
          this.promptText.setVisible(true);
        }
      }
    }
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  applyResearchEffects(effects: TreeResearchEffects) {
    const newCoinValue = Math.max(1, Math.floor(this.baseCoinValue * effects.coinValueMultiplier));
    const newCooldown = Math.max(400, Math.floor(this.baseMaxCooldown * effects.cooldownMultiplier));
    const newCoinCount = Math.max(1, Math.round(this.baseCoinCount * effects.coinBatchMultiplier));

    this.coinValue = newCoinValue;
    this.maxCooldown = newCooldown;
    this.coinCount = newCoinCount;

    if (this.cooldown > this.maxCooldown) {
      this.cooldown = this.maxCooldown;
    }
  }
 
   destroy() {

    if (this.sprite) this.sprite.destroy();
    if (this.promptText) this.promptText.destroy();
    if (this.cooldownBar) this.cooldownBar.destroy();
  }
}
