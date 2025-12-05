import * as Phaser from 'phaser';

export interface DecorationData {
  id: string;
  name: string;
  icon: string;
  cost: number;
  description: string;
  bonus: number; // Productivity bonus percentage
  color: number;
  size: { width: number; height: number };
}

export class PlacedDecoration {
  private scene: Phaser.Scene;
  private decorationId: string;
  private sprite?: Phaser.GameObjects.Sprite;
  private data: DecorationData;
  public x: number;
  public y: number;

  constructor(scene: Phaser.Scene, data: DecorationData, x: number, y: number) {
    this.scene = scene;
    this.decorationId = data.id;
    this.data = data;
    this.x = x;
    this.y = y;
    
    this.createSprite();
  }

  private createSprite() {
    // Create decoration sprite based on type
    this.sprite = this.scene.add.sprite(this.x, this.y, 'decoration');
    this.sprite.setTint(this.data.color);
    this.sprite.setDepth(3);
    
    // Set size
    this.sprite.displayWidth = this.data.size.width;
    this.sprite.displayHeight = this.data.size.height;
    
    // Make interactive for potential future features
    this.sprite.setInteractive({ useHandCursor: true });
    
    // Add hover effect
    this.sprite.on('pointerover', () => {
      this.scene.tweens.add({
        targets: this.sprite,
        scale: 1.1,
        duration: 200,
        ease: 'Back.out'
      });
    });
    
    this.sprite.on('pointerout', () => {
      this.scene.tweens.add({
        targets: this.sprite,
        scale: 1,
        duration: 200,
        ease: 'Back.out'
      });
    });
  }

  getBonus(): number {
    return this.data.bonus;
  }

  getData(): DecorationData {
    return this.data;
  }

  getId(): string {
    return this.decorationId;
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    if (this.sprite) {
      this.sprite.x = x;
      this.sprite.y = y;
    }
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}

export class DecorationSystem {
  private scene: Phaser.Scene;
  private decorations: Map<string, PlacedDecoration>;
  private availableDecorations: DecorationData[];
  private totalBonus: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.decorations = new Map();
    this.availableDecorations = this.initializeDecorations();
  }

  private initializeDecorations(): DecorationData[] {
    return [
      {
        id: 'lights_1',
        name: 'Christmas Lights',
        icon: '🎆',
        cost: 500,
        description: 'Productivity +2%',
        bonus: 0.02,
        color: 0xffff00,
        size: { width: 60, height: 40 }
      },
      {
        id: 'ornament_1',
        name: 'Glass Ornament',
        icon: '🎄',
        cost: 300,
        description: 'Productivity +1%',
        bonus: 0.01,
        color: 0xff69b4,
        size: { width: 30, height: 30 }
      },
      {
        id: 'candy_cane_1',
        name: 'Candy Cane',
        icon: '🍬',
        cost: 200,
        description: 'Productivity +1%',
        bonus: 0.01,
        color: 0xff0000,
        size: { width: 20, height: 50 }
      },
      {
        id: 'snowman_1',
        name: 'Snowman',
        icon: '⛄',
        cost: 800,
        description: 'Productivity +3%',
        bonus: 0.03,
        color: 0xffffff,
        size: { width: 50, height: 60 }
      },
      {
        id: 'wreath_1',
        name: 'Wreath',
        icon: '🌿',
        cost: 600,
        description: 'Productivity +2.5%',
        bonus: 0.025,
        color: 0x228b22,
        size: { width: 40, height: 40 }
      },
      {
        id: 'star_1',
        name: 'North Star',
        icon: '⭐',
        cost: 1500,
        description: 'Productivity +5%',
        bonus: 0.05,
        color: 0xffd700,
        size: { width: 40, height: 40 }
      }
    ];
  }

  placeDecoration(decorationData: DecorationData, x: number, y: number): boolean {
    const decoration = new PlacedDecoration(this.scene, decorationData, x, y);
    this.decorations.set(decorationData.id, decoration);
    this.updateTotalBonus();
    return true;
  }

  removeDecoration(decorationId: string): boolean {
    const decoration = this.decorations.get(decorationId);
    if (decoration) {
      decoration.destroy();
      this.decorations.delete(decorationId);
      this.updateTotalBonus();
      return true;
    }
    return false;
  }

  getAvailableDecorations(): DecorationData[] {
    return this.availableDecorations;
  }

  getPlacedDecorations(): PlacedDecoration[] {
    return Array.from(this.decorations.values());
  }

  getTotalBonus(): number {
    return this.totalBonus;
  }

  private updateTotalBonus() {
    this.totalBonus = Array.from(this.decorations.values())
      .reduce((total, decoration) => total + decoration.getBonus(), 0);
  }

  // Save/Load functionality
  getSaveData(): any {
    return {
      decorations: Array.from(this.decorations.values()).map(d => ({
        id: d.getId(),
        data: d.getData(),
        x: d.x || 0,
        y: d.y || 0
      }))
    };
  }

  loadSaveData(data: any): void {
    if (data.decorations) {
      data.decorations.forEach((savedDecoration: any) => {
        const decoration = new PlacedDecoration(
          this.scene,
          savedDecoration.data,
          savedDecoration.x,
          savedDecoration.y
        );
        this.decorations.set(savedDecoration.id, decoration);
      });
      this.updateTotalBonus();
    }
  }

  destroy() {
    this.decorations.forEach(decoration => decoration.destroy());
    this.decorations.clear();
  }
}