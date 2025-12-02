import Phaser from 'phaser';

export enum BuildingType {
  TOY_MAKER = 'toy_maker',
  GIFT_WRAPPER = 'gift_wrapper',
  COOKIE_FACTORY = 'cookie_factory',
  ELF_HOUSE = 'elf_house',
  REINDEER_STABLE = 'reindeer_stable',
  CANDY_CANE_FORGE = 'candy_cane_forge',
  STOCKING_STUFFER = 'stocking_stuffer',
  SNOWGLOBE_FACTORY = 'snowglobe_factory',
  ORNAMENT_WORKSHOP = 'ornament_workshop',
  SANTAS_OFFICE = 'santas_office'
}

export enum BuildingState {
  BROKEN = 'broken',
  ACTIVE = 'active'
}

export interface BuildingData {
  type: BuildingType;
  name: string;
  baseCost: number;
  baseIncome: number;
  description: string;
}

export const BUILDING_DATA: Record<BuildingType, BuildingData> = {
  [BuildingType.TOY_MAKER]: {
    type: BuildingType.TOY_MAKER,
    name: 'Toy Maker',
    baseCost: 100,
    baseIncome: 5,
    description: 'Crafts wooden toys'
  },
  [BuildingType.GIFT_WRAPPER]: {
    type: BuildingType.GIFT_WRAPPER,
    name: 'Gift Wrapper',
    baseCost: 250,
    baseIncome: 15,
    description: 'Wraps presents beautifully'
  },
  [BuildingType.COOKIE_FACTORY]: {
    type: BuildingType.COOKIE_FACTORY,
    name: 'Cookie Factory',
    baseCost: 500,
    baseIncome: 35,
    description: 'Bakes festive cookies'
  },
  [BuildingType.ELF_HOUSE]: {
    type: BuildingType.ELF_HOUSE,
    name: 'Elf House',
    baseCost: 1000,
    baseIncome: 100,
    description: 'Houses productive elves'
  },
  [BuildingType.REINDEER_STABLE]: {
    type: BuildingType.REINDEER_STABLE,
    name: 'Reindeer Stable',
    baseCost: 2500,
    baseIncome: 250,
    description: 'Trains magical reindeer'
  },
  [BuildingType.CANDY_CANE_FORGE]: {
    type: BuildingType.CANDY_CANE_FORGE,
    name: 'Candy Cane Forge',
    baseCost: 5000,
    baseIncome: 500,
    description: 'Forges striped candy canes'
  },
  [BuildingType.STOCKING_STUFFER]: {
    type: BuildingType.STOCKING_STUFFER,
    name: 'Stocking Stuffer',
    baseCost: 10000,
    baseIncome: 1000,
    description: 'Fills stockings with goodies'
  },
  [BuildingType.SNOWGLOBE_FACTORY]: {
    type: BuildingType.SNOWGLOBE_FACTORY,
    name: 'Snow Globe Factory',
    baseCost: 25000,
    baseIncome: 2500,
    description: 'Creates magical snow globes'
  },
  [BuildingType.ORNAMENT_WORKSHOP]: {
    type: BuildingType.ORNAMENT_WORKSHOP,
    name: 'Ornament Workshop',
    baseCost: 50000,
    baseIncome: 5000,
    description: 'Crafts delicate ornaments'
  },
  [BuildingType.SANTAS_OFFICE]: {
    type: BuildingType.SANTAS_OFFICE,
    name: "Santa's Office",
    baseCost: 100000,
    baseIncome: 10000,
    description: 'The big man himself!'
  }
};

export class Building {
  public x: number;
  public y: number;
  public id: string;
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite;
  private type: BuildingType;
  private baseIncome: number;
  private level: number = 1;
  private state: BuildingState;
  private coinSpawnTimer: number = 0;
  private coinSpawnInterval: number = 5000;
  private incomeText?: Phaser.GameObjects.Text;
  private levelBadge?: Phaser.GameObjects.Container;
  private repairPrompt?: Phaser.GameObjects.Container;
  private onRepairClick?: () => void;

  constructor(
    scene: Phaser.Scene,
    id: string,
    x: number,
    y: number,
    type: BuildingType,
    income: number,
    state: BuildingState = BuildingState.BROKEN,
    level: number = 1
  ) {
    this.scene = scene;
    this.id = id;
    this.x = x;
    this.y = y;
    this.type = type;
    this.baseIncome = income;
    this.state = state;
    this.level = level;

    this.sprite = scene.add.sprite(x, y, type);
    this.sprite.setDepth(5);
    this.sprite.setInteractive({ useHandCursor: true });
    
    if (this.state === BuildingState.BROKEN) {
      this.showBrokenState();
    } else {
      this.showActiveState();
    }
  }

  showBrokenState(currentCoins: number = 0) {
    // Darken and desaturate the sprite
    this.sprite.setTint(0x666666);
    this.sprite.setAlpha(0.5);
    
    // Show repair prompt
    this.createRepairPrompt(currentCoins);
    
    // No floating animation for broken buildings
  }

  private showActiveState() {
    // Clear any tint/alpha
    this.sprite.clearTint();
    this.sprite.setAlpha(1);
    
    // Remove repair prompt if exists
    if (this.repairPrompt) {
      this.repairPrompt.destroy();
      this.repairPrompt = undefined;
    }
    
    // Spawn animation
    this.sprite.setScale(0);
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 1,
      duration: 300,
      ease: 'Back.out'
    });
    
    // Add floating animation
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.y - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    // Create income indicator
    this.createIncomeIndicator();
    
    // Create level badge
    this.createLevelBadge();
  }

  private createRepairPrompt(currentCoins: number) {
    const data = BUILDING_DATA[this.type];
    const canAfford = currentCoins >= data.baseCost;
    
    this.repairPrompt = this.scene.add.container(this.x, this.y - 50);
    this.repairPrompt.setDepth(15);
    
    // Background - highlight if affordable
    const bgColor = canAfford ? 0x90EE90 : 0xffd700;
    const bg = this.scene.add.rectangle(0, 0, 120, 40, bgColor, 0.9);
    bg.setStrokeStyle(2, canAfford ? 0x2d5016 : 0x000000);
    
    // Make the prompt interactive
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => {
      if (this.onRepairClick) {
        this.onRepairClick();
      }
    });
    
    // Repair icon and text
    const text = this.scene.add.text(0, -8, `🔧 Repair`, {
      fontSize: '16px',
      color: '#000000',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);
    
    const costText = this.scene.add.text(0, 8, `${data.baseCost} coins`, {
      fontSize: '14px',
      color: canAfford ? '#2d5016' : '#654321'
    });
    costText.setOrigin(0.5);
    
    this.repairPrompt.add([bg, text, costText]);
    
    // More dramatic pulsing if affordable
    this.scene.tweens.add({
      targets: this.repairPrompt,
      scale: canAfford ? 1.15 : 1.1,
      duration: canAfford ? 600 : 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
    
    // Floating
    this.scene.tweens.add({
      targets: this.repairPrompt,
      y: this.y - 60,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  private createIncomeIndicator() {
    this.incomeText = this.scene.add.text(this.x, this.y - 40, `+${this.getIncome()}/s`, {
      fontSize: '14px',
      color: '#90EE90',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.incomeText.setOrigin(0.5);
    this.incomeText.setDepth(6);
    this.incomeText.setAlpha(0.8);
  }

  private createLevelBadge() {
    const badgeSize = Math.min(12 + this.level * 2, 24); // Grows with level, max 24px
    const badgeColor = this.getLevelBadgeColor();
    
    this.levelBadge = this.scene.add.container(this.x + 25, this.y - 25);
    this.levelBadge.setDepth(7);

    const badge = this.scene.add.circle(0, 0, badgeSize, badgeColor);
    badge.setStrokeStyle(2, 0x000000);
    
    const levelText = this.scene.add.text(0, 0, `${this.level}`, {
      fontSize: `${Math.min(14 + this.level, 22)}px`,
      color: '#000000',
      fontStyle: 'bold'
    });
    levelText.setOrigin(0.5);

    this.levelBadge.add([badge, levelText]);
    
    // Pulsing animation for high levels
    if (this.level >= 3) {
      this.scene.tweens.add({
        targets: this.levelBadge,
        scale: 1.1,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
    }
  }

  private getLevelBadgeColor(): number {
    if (this.level >= 10) return 0xff00ff; // Purple for max level
    if (this.level >= 7) return 0xff0000;  // Red for very high
    if (this.level >= 5) return 0xff6347;  // Orange for high
    if (this.level >= 3) return 0xffa500;  // Light orange for mid
    return 0xffd700; // Gold for low levels
  }

  repair() {
    if (this.state === BuildingState.BROKEN) {
      this.state = BuildingState.ACTIVE;
      this.showActiveState();
      
      // Play repair animation
      this.createRepairParticles();
    }
  }

  private createRepairParticles() {
    const particles = this.scene.add.particles(this.x, this.y, 'coin', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      quantity: 20,
      blendMode: 'ADD'
    });
    
    particles.setDepth(20);
    
    this.scene.time.delayedCall(800, () => {
      particles.destroy();
    });
  }

  update() {
    if (this.state !== BuildingState.ACTIVE) return;
    
    this.coinSpawnTimer += this.getIncome() * 16;
  }

  shouldSpawnCoin(): boolean {
    if (this.state !== BuildingState.ACTIVE) return false;
    
    if (this.coinSpawnTimer >= this.coinSpawnInterval) {
      this.coinSpawnTimer = 0;
      return true;
    }
    return false;
  }

  getIncome(): number {
    if (this.state !== BuildingState.ACTIVE) return 0;
    return Math.floor(this.baseIncome * Math.pow(1.5, this.level - 1));
  }

  getUpgradeCost(): number {
    const data = BUILDING_DATA[this.type];
    return Math.floor(data.baseCost * Math.pow(2, this.level));
  }

  getRepairCost(): number {
    return BUILDING_DATA[this.type].baseCost;
  }

  upgrade() {
    if (this.state !== BuildingState.ACTIVE) return;
    
    this.level++;
    
    if (this.levelBadge) {
      this.levelBadge.destroy();
      this.createLevelBadge();
    }
    
    if (this.incomeText) {
      this.incomeText.setText(`+${this.getIncome()}/s`);
      // Flash the income text
      this.scene.tweens.add({
        targets: this.incomeText,
        scale: 1.5,
        duration: 200,
        yoyo: true,
        ease: 'Back.out'
      });
    }

    // More dramatic upgrade animation
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 1.3,
      duration: 300,
      yoyo: true,
      ease: 'Elastic.out'
    });
    
    // Brief glow effect
    this.sprite.setTint(0xffff00);
    this.scene.time.delayedCall(300, () => {
      this.sprite.clearTint();
    });

    this.createUpgradeParticles();
  }

  private createUpgradeParticles() {
    const particles = this.scene.add.particles(this.x, this.y, 'coin', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 10,
      blendMode: 'ADD'
    });
    
    particles.setDepth(20);
    
    this.scene.time.delayedCall(500, () => {
      particles.destroy();
    });
  }

  getLevel(): number {
    return this.level;
  }

  getType(): BuildingType {
    return this.type;
  }

  getState(): BuildingState {
    return this.state;
  }

  isRepaired(): boolean {
    return this.state === BuildingState.ACTIVE;
  }

  getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }

  getData(): BuildingData {
    return BUILDING_DATA[this.type];
  }

  setRepairClickHandler(handler: () => void) {
    this.onRepairClick = handler;
  }

  updateRepairPrompt(currentCoins: number) {
    if (this.repairPrompt && this.state === BuildingState.BROKEN) {
      this.repairPrompt.destroy();
      this.createRepairPrompt(currentCoins);
    }
  }

  destroy() {
    if (this.incomeText) this.incomeText.destroy();
    if (this.levelBadge) this.levelBadge.destroy();
    if (this.repairPrompt) this.repairPrompt.destroy();
    if (this.sprite) this.sprite.destroy();
  }
}
