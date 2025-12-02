import Phaser from 'phaser';

export class TreePlantingSpot {
  private scene: Phaser.Scene;
  public x: number;
  public y: number;
  public id: string;
  private cost: number;
  private graphics: Phaser.GameObjects.Graphics;
  private promptContainer?: Phaser.GameObjects.Container;
  private onPlantClick?: () => void;

  constructor(
    scene: Phaser.Scene,
    id: string,
    x: number,
    y: number,
    cost: number
  ) {
    this.scene = scene;
    this.id = id;
    this.x = x;
    this.y = y;
    this.cost = cost;

    this.graphics = scene.add.graphics();
    this.createEmptySpot();
    this.createPlantPrompt(0);
  }

  private createEmptySpot() {
    this.graphics.setDepth(3);
    
    // Draw empty dirt patch
    this.graphics.fillStyle(0x8b4513, 0.6);
    this.graphics.fillCircle(this.x, this.y + 10, 50);
    
    // Draw some grass around
    this.graphics.fillStyle(0x4a7c4e, 0.4);
    this.graphics.fillCircle(this.x - 30, this.y + 15, 20);
    this.graphics.fillCircle(this.x + 30, this.y + 15, 20);
    
    // Draw outline
    this.graphics.lineStyle(2, 0x654321, 0.8);
    this.graphics.strokeCircle(this.x, this.y + 10, 50);

    // Make interactive
    const hitArea = new Phaser.Geom.Circle(this.x, this.y, 50);
    this.graphics.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
    
    // Hover effect
    this.graphics.on('pointerover', () => {
      this.graphics.clear();
      this.graphics.fillStyle(0x8b4513, 0.8);
      this.graphics.fillCircle(this.x, this.y + 10, 50);
      this.graphics.fillStyle(0x4a7c4e, 0.6);
      this.graphics.fillCircle(this.x - 30, this.y + 15, 20);
      this.graphics.fillCircle(this.x + 30, this.y + 15, 20);
      this.graphics.lineStyle(3, 0xffd700, 1);
      this.graphics.strokeCircle(this.x, this.y + 10, 50);
    });
    
    this.graphics.on('pointerout', () => {
      this.createEmptySpot();
    });
  }

  private createPlantPrompt(currentCoins: number) {
    const canAfford = currentCoins >= this.cost;
    
    this.promptContainer = this.scene.add.container(this.x, this.y - 60);
    this.promptContainer.setDepth(10);
    
    // Background - highlight if affordable
    const bgColor = canAfford ? 0x90EE90 : 0x2d5016;
    const bg = this.scene.add.rectangle(0, 0, 140, 50, bgColor, 0.9);
    bg.setStrokeStyle(2, canAfford ? 0x2d5016 : 0xffd700);
    
    // Make the prompt interactive
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => {
      if (this.onPlantClick) {
        this.onPlantClick();
      }
    });
    
    const icon = this.scene.add.text(0, -10, '🌱 Plant Tree', {
      fontSize: '16px',
      color: canAfford ? '#2d5016' : '#90EE90',
      fontStyle: 'bold'
    });
    icon.setOrigin(0.5);
    
    const costText = this.scene.add.text(0, 10, `${this.cost} coins`, {
      fontSize: '14px',
      color: canAfford ? '#2d5016' : '#ffd700'
    });
    costText.setOrigin(0.5);
    
    this.promptContainer.add([bg, icon, costText]);
    
    // More dramatic pulsing if affordable
    this.scene.tweens.add({
      targets: this.promptContainer,
      scale: canAfford ? 1.1 : 1.05,
      duration: canAfford ? 800 : 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  getGraphics(): Phaser.GameObjects.Graphics {
    return this.graphics;
  }

  getCost(): number {
    return this.cost;
  }

  setPlantClickHandler(handler: () => void) {
    this.onPlantClick = handler;
  }

  updatePlantPrompt(currentCoins: number) {
    if (this.promptContainer) {
      this.promptContainer.destroy();
      this.createPlantPrompt(currentCoins);
    }
  }

  destroy() {
    if (this.graphics) this.graphics.destroy();
    if (this.promptContainer) this.promptContainer.destroy();
  }
}
