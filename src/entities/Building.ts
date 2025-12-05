import * as Phaser from 'phaser';

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
  SANTAS_OFFICE = 'santas_office',
  COOKIE_BAKERY = 'cookie_bakery',
  GIFT_WRAPPING_STATION = 'gift_wrapping_station',
  ELF_DORMITORY = 'elf_dormitory',
  REINDEER_STABLES = 'reindeer_stables'
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
  },
  [BuildingType.COOKIE_BAKERY]: {
    type: BuildingType.COOKIE_BAKERY,
    name: 'Cookie Bakery',
    baseCost: 8000,
    baseIncome: 200,
    description: 'Bakes cookies for elf productivity'
  },
  [BuildingType.GIFT_WRAPPING_STATION]: {
    type: BuildingType.GIFT_WRAPPING_STATION,
    name: 'Gift Wrapping Station',
    baseCost: 12000,
    baseIncome: 300,
    description: 'Adds value to collected coins'
  },
  [BuildingType.ELF_DORMITORY]: {
    type: BuildingType.ELF_DORMITORY,
    name: 'Elf Dormitory',
    baseCost: 20000,
    baseIncome: 150,
    description: 'Houses more productive elves'
  },
  [BuildingType.REINDEER_STABLES]: {
    type: BuildingType.REINDEER_STABLES,
    name: 'Reindeer Stables',
    baseCost: 25000,
    baseIncome: 400,
    description: 'Faster coin collection and delivery'
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
  private animationContainer?: Phaser.GameObjects.Container;
  private productionParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
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
    
    // Remove broken label if exists
    if ((this as any).brokenLabel) {
      (this as any).brokenLabel.destroy();
      (this as any).brokenLabel = undefined;
    }
    
    // Spawn animation
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
    
    // Remove broken label if exists
    if ((this as any).brokenLabel) {
      (this as any).brokenLabel.destroy();
      (this as any).brokenLabel = undefined;
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
    
    // Create production animations
    this.createProductionAnimations();

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
    
    const costString = data.baseCost === 0 ? 'FREE!' : `${data.baseCost} coins`;
    const costText = this.scene.add.text(0, 8, costString, {
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
    return Math.floor(data.baseCost * Math.pow(2.2, this.level));
  }
 
  getRepairCost(): number {
    return Math.floor(BUILDING_DATA[this.type].baseCost * 1.15);
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

  private createProductionAnimations() {
    if (this.state !== BuildingState.ACTIVE) return;
    
    this.animationContainer = this.scene.add.container(this.x, this.y);
    this.animationContainer.setDepth(6);
    
    // Create different animations based on building type
    switch (this.type) {
      case BuildingType.TOY_MAKER:
        this.createToyMakerAnimation();
        break;
      case BuildingType.GIFT_WRAPPER:
        this.createGiftWrapperAnimation();
        break;
      case BuildingType.COOKIE_FACTORY:
        this.createCookieFactoryAnimation();
        break;
      case BuildingType.ELF_HOUSE:
        this.createElfHouseAnimation();
        break;
      case BuildingType.REINDEER_STABLE:
        this.createReindeerStableAnimation();
        break;
      case BuildingType.CANDY_CANE_FORGE:
        this.createCandyCaneAnimation();
        break;
      case BuildingType.STOCKING_STUFFER:
        this.createStockingStufferAnimation();
        break;
      case BuildingType.SNOWGLOBE_FACTORY:
        this.createSnowglobeAnimation();
        break;
      case BuildingType.ORNAMENT_WORKSHOP:
        this.createOrnamentAnimation();
        break;
      case BuildingType.SANTAS_OFFICE:
        this.createSantaOfficeAnimation();
        break;
      case BuildingType.COOKIE_BAKERY:
        this.createCookieBakeryAnimation();
        break;
      case BuildingType.GIFT_WRAPPING_STATION:
        this.createGiftWrappingAnimation();
        break;
      case BuildingType.ELF_DORMITORY:
        this.createElfDormitoryAnimation();
        break;
      case BuildingType.REINDEER_STABLES:
        this.createReindeerStablesAnimation();
        break;
    }
  }

  private createToyMakerAnimation() {
    // Hammer animation
    const hammer = this.scene.add.rectangle(-10, -20, 8, 15, 0x8b4513);
    hammer.setOrigin(0.5);
    this.animationContainer!.add(hammer);
    
    this.scene.tweens.add({
      targets: hammer,
      y: -30,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  private createGiftWrapperAnimation() {
    // Ribbon animation
    const ribbon = this.scene.add.rectangle(0, -15, 20, 3, 0xff0000);
    ribbon.setOrigin(0.5);
    this.animationContainer!.add(ribbon);
    
    this.scene.tweens.add({
      targets: ribbon,
      scaleX: 1.2,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  private createCookieFactoryAnimation() {
    // Steam animation
    this.productionParticles = this.scene.add.particles(0, -10, 'steam', {
      speed: { min: 20, max: 40 },
      angle: { min: 240, max: 300 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 1000,
      quantity: 1
    });
    this.productionParticles.setDepth(7);
  }

  private createElfHouseAnimation() {
    // Window light animation
    const windowLight = this.scene.add.circle(0, -10, 8, 0xffff00, 0.8);
    windowLight.setOrigin(0.5);
    this.animationContainer!.add(windowLight);
    
    this.scene.tweens.add({
      targets: windowLight,
      alpha: 0.3,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  private createReindeerStableAnimation() {
    // Reindeer antlers animation
    const antlers = this.scene.add.rectangle(-5, -25, 3, 8, 0x8b4513);
    antlers.setOrigin(0.5);
    this.animationContainer!.add(antlers);
    
    this.scene.tweens.add({
      targets: antlers,
      angle: 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  private createCandyCaneAnimation() {
    // Sparkle animation
    for (let i = 0; i < 3; i++) {
      const sparkle = this.scene.add.circle(
        Phaser.Math.Between(-15, 15),
        -20,
        2,
        0xff0000
      );
      sparkle.setOrigin(0.5);
      this.animationContainer!.add(sparkle);
      
      this.scene.tweens.add({
        targets: sparkle,
        alpha: 0,
        scale: 2,
        duration: 1000,
        delay: i * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
    }
  }

  private createStockingStufferAnimation() {
    // Stuffing animation
    const stuffing = this.scene.add.rectangle(0, -15, 12, 8, 0xff0000);
    stuffing.setOrigin(0.5);
    this.animationContainer!.add(stuffing);
    
    this.scene.tweens.add({
      targets: stuffing,
      scaleY: 1.3,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  private createSnowglobeAnimation() {
    // Snow inside globe
    const snow = this.scene.add.circle(0, -10, 6, 0xffffff);
    snow.setOrigin(0.5);
    this.animationContainer!.add(snow);
    
    this.scene.tweens.add({
      targets: snow,
      y: -5,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  private createOrnamentAnimation() {
    // Rotating ornament
    const ornament = this.scene.add.circle(0, -15, 4, 0x69b4ff);
    ornament.setOrigin(0.5);
    this.animationContainer!.add(ornament);
    
    this.scene.tweens.add({
      targets: ornament,
      angle: 360,
      duration: 4000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  private createSantaOfficeAnimation() {
    // Santa's hat bob
    const hat = this.scene.add.rectangle(0, -30, 20, 10, 0xff0000);
    hat.setOrigin(0.5);
    this.animationContainer!.add(hat);
    
    this.scene.tweens.add({
      targets: hat,
      y: -35,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  private createCookieBakeryAnimation() {
    // Rising steam from oven
    this.productionParticles = this.scene.add.particles(0, -10, 'steam', {
      speed: { min: 30, max: 50 },
      angle: { min: 240, max: 300 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 1200,
      quantity: 2
    });
    this.productionParticles.setDepth(7);
  }

  private createGiftWrappingAnimation() {
    // Moving conveyor belt
    const belt = this.scene.add.rectangle(-15, -10, 30, 3, 0x654321);
    belt.setOrigin(0.5);
    this.animationContainer!.add(belt);
    
    this.scene.tweens.add({
      targets: belt,
      x: 15,
      duration: 2000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  private createElfDormitoryAnimation() {
    // Chimney smoke
    this.productionParticles = this.scene.add.particles(0, -25, 'smoke', {
      speed: { min: 10, max: 20 },
      angle: { min: 240, max: 300 },
      scale: { start: 0.2, end: 0.5 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 2000,
      quantity: 1
    });
    this.productionParticles.setDepth(7);
  }

  private createReindeerStablesAnimation() {
    // Reindeer movement
    const reindeer = this.scene.add.rectangle(-10, -15, 20, 10, 0x8b4513);
    reindeer.setOrigin(0.5);
    this.animationContainer!.add(reindeer);
    
    this.scene.tweens.add({
      targets: reindeer,
      x: 10,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
  }

  destroy() {
    if (this.incomeText) this.incomeText.destroy();
    if (this.levelBadge) this.levelBadge.destroy();
    if (this.repairPrompt) this.repairPrompt.destroy();
    if ((this as any).brokenLabel) (this as any).brokenLabel.destroy();
    if (this.animationContainer) this.animationContainer.destroy();
    if (this.productionParticles) this.productionParticles.destroy();
    if (this.sprite) this.sprite.destroy();
  }
}
