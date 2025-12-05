import * as Phaser from 'phaser';
import { Building } from '../entities/Building';
import { ChristmasTree } from '../entities/ChristmasTree';

interface MiniMapOptions {
  width?: number;
  height?: number;
}

export class MiniMap {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Rectangle;
  private graphics: Phaser.GameObjects.Graphics;
  private worldWidth: number;
  private worldHeight: number;
  private width: number;
  private height: number;

  constructor(scene: Phaser.Scene, worldWidth: number, worldHeight: number, options: MiniMapOptions = {}) {
    this.scene = scene;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.width = options.width ?? 220;
    this.height = options.height ?? 160;

    const screenWidth = this.scene.scale.width;

    this.container = this.scene.add.container(screenWidth - this.width / 2 - 20, this.height / 2 + 120);
    this.container.setDepth(60);
    this.container.setScrollFactor(0);

    this.background = this.scene.add.rectangle(0, 0, this.width, this.height, 0x0f1a2c, 0.8);
    this.background.setStrokeStyle(2, 0xffffff, 0.3);
    this.background.setInteractive({ useHandCursor: true });

    this.graphics = this.scene.add.graphics();
    this.graphics.setDepth(61);

    this.container.add([this.background, this.graphics]);
  }

  update(player: Phaser.Physics.Arcade.Sprite, trees: Map<string, ChristmasTree>, buildings: Map<string, Building>) {
    const scaleX = this.width / this.worldWidth;
    const scaleY = this.height / this.worldHeight;

    this.graphics.clear();

    // Draw horizon shading
    this.graphics.fillStyle(0xffffff, 0.04);
    this.graphics.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Draw player view rectangle (camera bounds)
    const camera = this.scene.cameras.main;
    const viewX = (camera.worldView.x / this.worldWidth - 0.5) * this.width;
    const viewY = (camera.worldView.y / this.worldHeight - 0.5) * this.height;
    const viewWidth = camera.worldView.width * scaleX;
    const viewHeight = camera.worldView.height * scaleY;

    this.graphics.lineStyle(1, 0xffffff, 0.4);
    this.graphics.strokeRect(viewX, viewY, viewWidth, viewHeight);

    // Draw buildings (active only)
    buildings.forEach(building => {
      if (!building.isRepaired()) return;
      const x = (building.x / this.worldWidth - 0.5) * this.width;
      const y = (building.y / this.worldHeight - 0.5) * this.height;
      this.graphics.fillStyle(0xffd700, 0.95);
      this.graphics.fillCircle(x, y, 4);
    });

    // Draw trees
    trees.forEach(tree => {
      const position = tree.getPosition();
      const x = (position.x / this.worldWidth - 0.5) * this.width;
      const y = (position.y / this.worldHeight - 0.5) * this.height;
      this.graphics.fillStyle(0x00ff95, 0.9);
      this.graphics.fillCircle(x, y, 3);
    });

    // Player indicator
    const playerX = (player.x / this.worldWidth - 0.5) * this.width;
    const playerY = (player.y / this.worldHeight - 0.5) * this.height;
    this.graphics.fillStyle(0xff4d6d, 1);
    this.graphics.fillCircle(playerX, playerY, 4);
    this.graphics.lineStyle(1, 0xffffff, 0.5);
    this.graphics.strokeCircle(playerX, playerY, 6);
  }
}
