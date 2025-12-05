import * as Phaser from 'phaser';

export class AssetCreator {
  static createAllAssets(scene: Phaser.Scene) {
    const graphics = scene.add.graphics();
    
    this.createPlayer(graphics);
    this.createCoin(graphics);
    this.createSnowflake(graphics);
    this.createBuildings(graphics);
    
    graphics.destroy();
  }

  private static createPlayer(graphics: Phaser.GameObjects.Graphics) {
    graphics.fillStyle(0x2d5016, 1);
    graphics.fillCircle(16, 20, 12);
    graphics.fillStyle(0xc41e3a, 1);
    graphics.fillTriangle(16, 8, 8, 18, 24, 18);
    graphics.fillStyle(0xffd700, 1);
    graphics.fillCircle(16, 26, 3);
    graphics.generateTexture('player', 32, 32);
    graphics.clear();
  }

  private static createCoin(graphics: Phaser.GameObjects.Graphics) {
    graphics.fillStyle(0xffd700, 1);
    graphics.fillCircle(8, 8, 7);
    graphics.fillStyle(0xffed4e, 1);
    graphics.fillCircle(8, 8, 5);
    graphics.generateTexture('coin', 16, 16);
    graphics.clear();
  }

  private static createSnowflake(graphics: Phaser.GameObjects.Graphics) {
    graphics.fillStyle(0xffffff, 1);
    // Draw a simple cross for snowflake
    graphics.fillRect(3, 0, 2, 8);
    graphics.fillRect(0, 3, 8, 2);
    graphics.generateTexture('snowflake', 8, 8);
    graphics.clear();
  }

  private static createBuildings(graphics: Phaser.GameObjects.Graphics) {
    // Toy Maker
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(0, 20, 60, 40);
    graphics.fillStyle(0xc41e3a, 1);
    graphics.fillTriangle(30, 5, 5, 20, 55, 20);
    graphics.fillStyle(0x4a4a4a, 1);
    graphics.fillRect(20, 35, 20, 15);
    graphics.generateTexture('toy_maker', 60, 60);
    graphics.clear();
    
    // Gift Wrapper
    graphics.fillStyle(0xc41e3a, 1);
    graphics.fillRect(0, 20, 60, 40);
    graphics.fillStyle(0x2d5016, 1);
    graphics.fillRect(25, 20, 10, 40);
    graphics.fillRect(0, 37, 60, 6);
    graphics.fillStyle(0xffd700, 1);
    graphics.fillCircle(30, 30, 8);
    graphics.generateTexture('gift_wrapper', 60, 60);
    graphics.clear();
    
    // Cookie Factory
    graphics.fillStyle(0xa0522d, 1);
    graphics.fillRect(0, 15, 60, 45);
    graphics.fillStyle(0x654321, 1);
    graphics.fillRect(5, 25, 20, 15);
    graphics.fillStyle(0xff6347, 1);
    graphics.fillRect(18, 5, 24, 15);
    graphics.fillCircle(30, 40, 8);
    graphics.generateTexture('cookie_factory', 60, 60);
    graphics.clear();
    
    // Elf House
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(5, 25, 50, 35);
    graphics.fillStyle(0xc41e3a, 1);
    graphics.fillTriangle(30, 10, 5, 25, 55, 25);
    graphics.fillStyle(0xffd700, 1);
    graphics.fillCircle(30, 15, 3);
    graphics.fillStyle(0x87ceeb, 1);
    graphics.fillRect(20, 35, 12, 15);
    graphics.fillRect(35, 35, 10, 10);
    graphics.generateTexture('elf_house', 60, 60);
    graphics.clear();
    
    // Reindeer Stable
    graphics.fillStyle(0x5d4037, 1);
    graphics.fillRect(0, 20, 60, 40);
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(15, 30, 10, 15);
    graphics.fillRect(35, 30, 10, 15);
    graphics.fillStyle(0xd84315, 1);
    graphics.fillCircle(30, 25, 8);
    graphics.generateTexture('reindeer_stable', 60, 60);
    graphics.clear();
    
    // Candy Cane Forge
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(10, 20, 40, 40);
    graphics.fillStyle(0xc41e3a, 1);
    graphics.fillRect(25, 20, 10, 40);
    graphics.fillCircle(30, 35, 12);
    graphics.fillStyle(0xff6347, 1);
    graphics.fillRect(20, 10, 20, 15);
    graphics.generateTexture('candy_cane_forge', 60, 60);
    graphics.clear();
    
    // Stocking Stuffer
    graphics.fillStyle(0xc41e3a, 1);
    graphics.fillRect(15, 20, 30, 35);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(15, 20, 30, 8);
    graphics.fillStyle(0x2d5016, 1);
    graphics.fillCircle(20, 30, 4);
    graphics.fillCircle(30, 35, 5);
    graphics.fillCircle(40, 30, 4);
    graphics.generateTexture('stocking_stuffer', 60, 60);
    graphics.clear();
    
    // Snow Globe Factory
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(10, 45, 40, 15);
    graphics.fillStyle(0x87ceeb, 0.6);
    graphics.fillCircle(30, 30, 20);
    graphics.fillStyle(0x2d5016, 1);
    graphics.fillTriangle(30, 20, 20, 35, 40, 35);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(20, 25, 2);
    graphics.fillCircle(35, 30, 2);
    graphics.generateTexture('snowglobe_factory', 60, 60);
    graphics.clear();
    
    // Ornament Workshop
    graphics.fillStyle(0x6a1b9a, 1);
    graphics.fillRect(5, 25, 50, 35);
    graphics.fillStyle(0xffd700, 1);
    graphics.fillTriangle(30, 10, 10, 25, 50, 25);
    graphics.fillStyle(0xc41e3a, 1);
    graphics.fillCircle(20, 35, 8);
    graphics.fillStyle(0x2d5016, 1);
    graphics.fillCircle(40, 40, 8);
    graphics.generateTexture('ornament_workshop', 60, 60);
    graphics.clear();
    
    // Santa's Office
    graphics.fillStyle(0xc41e3a, 1);
    graphics.fillRect(0, 20, 60, 40);
    graphics.fillStyle(0xffd700, 1);
    graphics.fillTriangle(30, 5, 5, 20, 55, 20);
    graphics.fillStyle(0xffeb3b, 1);
    graphics.fillRect(20, 30, 20, 20);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(30, 15, 5);
    graphics.fillCircle(15, 35, 3);
    graphics.fillCircle(45, 35, 3);
    graphics.generateTexture('santas_office', 60, 60);
    graphics.clear();
  }
}
