import Phaser from 'phaser';
import { Building, BuildingType, BuildingState, BUILDING_DATA } from '../entities/Building';
import { Player } from '../entities/Player';
import { Coin } from '../entities/Coin';
import { ChristmasTree } from '../entities/ChristmasTree';
import { TreePlantingSpot } from '../entities/TreePlantingSpot';
import { SaveManager, SaveData } from '../utils/SaveManager';
import { AudioManager } from '../utils/AudioManager';
import { UIManager } from '../ui/UIManager';
import { BuildingInfoPanel } from '../ui/BuildingInfoPanel';
import { ResearchPanel } from '../ui/ResearchPanel';
import { CookieShop } from '../ui/CookieShop';
import { EconomySystem } from '../systems/EconomySystem';
import { WorkshopLayout, BuildingSpot, TreeSpot } from '../systems/WorkshopLayout';
import { ResearchSystem } from '../systems/ResearchSystem';
import { BuffSystem, BuffType, CookieType } from '../systems/BuffSystem';
import { GridSystem } from '../systems/GridSystem';
import { DecorationSystem } from '../systems/DecorationSystem';
import { AssetCreator } from '../utils/AssetCreator';
import { EnvironmentRenderer } from '../rendering/EnvironmentRenderer';

const WORLD_WIDTH = 4096;
const WORLD_HEIGHT = 3072;

export class GameScene extends Phaser.Scene {

  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  
  // Systems
  private economy!: EconomySystem;
  private audioManager!: AudioManager;
  private researchSystem!: ResearchSystem;
  private buffSystem!: BuffSystem;
  private gridSystem!: GridSystem;
  private decorationSystem!: DecorationSystem;
  
  // Buildings
  private buildingSpots: BuildingSpot[] = [];
  private buildings: Map<string, Building> = new Map();
  private buildingLevels: Map<string, number> = new Map();
  
  // Trees
  private treeSpots: TreeSpot[] = [];
  private trees: Map<string, ChristmasTree> = new Map();
  private plantingSpots: Map<string, TreePlantingSpot> = new Map();
  
  // UI
  private uiManager!: UIManager;
  private buildingInfoPanel!: BuildingInfoPanel;
  private researchPanel!: ResearchPanel;
  private cookieShop!: CookieShop;
  
  // Collectibles
  private coinGroup!: Phaser.Physics.Arcade.Group;
  
  // Environment
  private environmentRenderer!: EnvironmentRenderer;
  
  private magnetActiveLastFrame: boolean = false;
  
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    AssetCreator.createAllAssets(this);
  }

  create() {
    console.log('GameScene: create() started');
    
    // Initialize systems
    this.economy = new EconomySystem(0);
    this.audioManager = new AudioManager(this);
    this.researchSystem = new ResearchSystem();
    this.buffSystem = new BuffSystem(this);
    this.gridSystem = new GridSystem(this, WORLD_WIDTH, WORLD_HEIGHT);
    this.decorationSystem = new DecorationSystem(this);
    
    // Initialize audio
    this.audioManager.playBackgroundMusic();
    console.log('GameScene: Systems initialized');
    
    // Render environment
    this.environmentRenderer = new EnvironmentRenderer(this, WORLD_WIDTH, WORLD_HEIGHT);
    this.environmentRenderer.createBackground();
    this.environmentRenderer.createSnowEffect();
    console.log('GameScene: Environment rendered');
    
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    
    // Load or initialize workshop layout
    this.loadGame();
    console.log('GameScene: Game loaded, treeSpots:', this.treeSpots.length, 'buildingSpots:', this.buildingSpots.length);
    
    // Create all building spots (broken and active)
    this.createBuildings();
    
    // Create player
    this.player = new Player(this, 512, 384);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
    this.cameras.main.setBackgroundColor(0x1b3b5a);
    
    // Setup controls
    this.setupControls();
    this.setupDragAndDrop();
    
    // Create coin group for collectibles
    this.coinGroup = this.physics.add.group({
      classType: Coin,
      runChildUpdate: true
    });
    
    // Setup collisions
    this.physics.add.overlap(
      this.player.sprite,
      this.coinGroup,
      this.collectCoin,
      undefined,
      this
    );
    
    // Initialize UI
    this.uiManager = new UIManager(this);
    this.uiManager.create(
      this.economy.getCoins(),
      this.economy.calculateIncome(),
      this.getRepairedBuildingCount(),
      () => this.saveGame(),
      () => this.resetGame()
    );
    
    this.buildingInfoPanel = new BuildingInfoPanel(
      this,
      (building, cost) => this.upgradeBuilding(building, cost),
      () => this.economy.getCoins()
    );
    
    this.researchPanel = new ResearchPanel(
      this,
      this.researchSystem,
      (upgrade) => this.onResearchUpgradePurchased(upgrade),
      () => this.onResearchPanelClosed()
    );
    
    this.cookieShop = new CookieShop(
      this,
      this.buffSystem,
      (type, cost) => this.onCookiePurchased(type, cost),
      () => this.onCookieShopClosed()
    );
    
    // Create trees and planting spots
    this.createTrees();
    this.refreshTreeResearchEffects();
    
    // Start game loops
    this.startGameLoops();
  }

  update(time: number, delta: number) {
    this.buffSystem.update();

    const buffSpeed = this.buffSystem.getMultiplier(BuffType.SPEED_BOOST);
    const researchSpeed = this.researchSystem.getPlayerSpeedMultiplier();
    const speedMultiplier = Math.max(1, buffSpeed * researchSpeed);
    this.player.setSpeedMultiplier(speedMultiplier);
    this.player.update(this.cursors, this.wasd);

    this.buildings.forEach(building => building.update());
    this.trees.forEach(tree => tree.update(delta));

    const magnetResearchLevel = this.researchSystem.getMagnetResearchLevel();
    const hasMagnetBuff = this.buffSystem.hasBuffOfType(BuffType.MAGNETIC_PULL);
    const magnetStrength = hasMagnetBuff ? Math.max(magnetResearchLevel, 2) : magnetResearchLevel;
    const magnetActive = magnetStrength > 0;

    if (magnetActive) {
      this.applyMagnetPerk(magnetStrength);
    } else if (this.magnetActiveLastFrame) {
      this.resetMagnetizedCoins();
    }
    this.magnetActiveLastFrame = magnetActive;
  }

  private createTrees() {
    this.treeSpots.forEach(spot => {
      if (spot.planted) {
        // Create planted tree
        const tree = new ChristmasTree(
          this,
          spot.x,
          spot.y,
          (x, y, value) => this.spawnCoinAt(x, y, value)
        );
        this.trees.set(spot.id, tree);
      } else {
        // Create planting spot
        const plantingSpot = new TreePlantingSpot(
          this,
          spot.id,
          spot.x,
          spot.y,
          spot.cost
        );
        
        // Set click handler on the prompt button
        plantingSpot.setPlantClickHandler(() => {
          this.attemptPlantTree(spot, plantingSpot);
        });
        
        // Update the prompt with current coins
        plantingSpot.updatePlantPrompt(this.economy.getCoins());
        
        this.plantingSpots.set(spot.id, plantingSpot);
      }
    });
  }

  private refreshTreeResearchEffects() {
    const effects = this.researchSystem.getTreeResearchEffects();
    this.trees.forEach(tree => tree.applyResearchEffects(effects));
  }

  private attemptPlantTree(spot: TreeSpot, plantingSpot: TreePlantingSpot) {

    const cost = spot.cost;
    
    // Just check if you can afford it
    if (!this.economy.spendCoins(cost)) {
      this.uiManager.showFloatingText(
        spot.x,
        spot.y - 60,
        `Need ${cost} coins!`,
        '#ff6347'
      );
      return;
    }
    
    // Plant the tree!
    spot.planted = true;
    plantingSpot.destroy();
    this.plantingSpots.delete(spot.id);
    
    const tree = new ChristmasTree(
      this,
      spot.x,
      spot.y,
      (x, y, value) => this.spawnCoinAt(x, y, value)
    );
    this.trees.set(spot.id, tree);
    tree.applyResearchEffects(this.researchSystem.getTreeResearchEffects());
    
    this.updateUI();
    this.uiManager.showFloatingText(
      spot.x,
      spot.y - 60,
      'PLANTED!',
      '#90EE90'
    );
  }

  private setupControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
    
    this.input.keyboard!.on('keydown-S', () => {
      this.saveGame();
      this.uiManager.showFloatingText(512, 100, 'Game Saved!', '#90EE90');
    });

    this.input.keyboard!.on('keydown-R', () => {
      this.openResearchPanel();
    });
  }

  private createBuildings() {
    this.buildingSpots.forEach(spot => {
      const data = BUILDING_DATA[spot.type];
      const state = spot.repaired ? BuildingState.ACTIVE : BuildingState.BROKEN;
      const level = this.buildingLevels.get(spot.id) || 1;
      
      const building = new Building(
        this,
        spot.id,
        spot.x,
        spot.y,
        spot.type,
        data.baseIncome,
        state,
        level
      );
      
      if (building.isRepaired()) {
        // Setup click handler for repaired buildings
        building.getSprite().on('pointerdown', () => {
          if (building.getType() === BuildingType.COOKIE_BAKERY) {
            this.openCookieShop();
          } else {
            this.buildingInfoPanel.show(building);
          }
        });
        
        // Add to grid
        this.gridSystem.addBuilding(building);
        this.economy.addBuilding(building);
      } else {
        // For broken buildings, set click handler on the repair button
        building.setRepairClickHandler(() => {
          this.attemptRepair(building, spot);
        });
        // Update the repair prompt with current coins
        building.updateRepairPrompt(this.economy.getCoins());
      }
      
      this.buildings.set(spot.id, building);
    });
  }

  private attemptRepair(building: Building, spot: BuildingSpot) {
    const cost = building.getRepairCost();
    
    // Just check if you can afford it
    if (!this.economy.spendCoins(cost)) {
      this.uiManager.showFloatingText(
        building.x,
        building.y - 60,
        `Need ${cost} coins!`,
        '#ff6347'
      );
      return;
    }
    
    // Repair the building
    building.repair();
    spot.repaired = true;
    this.economy.addBuilding(building);
    
    this.updateUI();
    this.uiManager.showFloatingText(
      building.x,
      building.y - 60,
      'REPAIRED!',
      '#ffd700'
    );
    this.audioManager.playBuildingRepairSound();
  }

  private startGameLoops() {
    // Update income every second
    this.time.addEvent({
      delay: 1000,
      callback: this.processIncome,
      callbackScope: this,
      loop: true
    });
    
    // Autosave every 30 seconds
    this.time.addEvent({
      delay: 30000,
      callback: this.saveGame,
      callbackScope: this,
      loop: true
    });
  }

  private processIncome() {
    this.economy.processIncome();
    this.uiManager.updateCoins(this.economy.getCoins());
    this.updateAffordabilityIndicators();
    
    // Buildings spawn coins or research points
    this.economy.getBuildings().forEach(building => {
      if (building.shouldSpawnCoin()) {
        // Generate regular coins with production boost and value multipliers
          const baseIncome = building.getIncome();
          const productionMultiplier = this.researchSystem.getProductionSpeedMultiplier() * this.buffSystem.getMultiplier(BuffType.PRODUCTION_BOOST);
          const valueMultiplier = this.researchSystem.getCoinValueMultiplier();
          const efficiencyMultiplier = this.researchSystem.getBuildingEfficiencyMultiplier();
          const decorationMultiplier = 1 + this.decorationSystem.getTotalBonus();
          const synergyMultiplier = this.researchSystem.getHolidaySynergyMultiplier();
          const adjustedIncome = Math.floor(baseIncome * productionMultiplier * valueMultiplier * efficiencyMultiplier * decorationMultiplier * synergyMultiplier);
          
          // Special handling for Gift Wrapping Station
          if (building.getType() === BuildingType.GIFT_WRAPPING_STATION) {
            // Gift Wrapping Station adds bonus to ALL coins collected
            this.spawnCoinAt(building.x, building.y, adjustedIncome);
          } else {
            // Spawn multiple coins for higher income
            const coinValue = Math.max(10, Math.floor(adjustedIncome / 5)); // Minimum 10, split into ~5 coins
            const coinCount = Math.ceil(adjustedIncome / coinValue);
            
            for (let i = 0; i < coinCount; i++) {
              const offsetX = Phaser.Math.Between(-30, 30);
              const offsetY = Phaser.Math.Between(-20, 20);
            this.time.delayedCall(i * 50, () => {
              this.spawnCoinAt(building.x + offsetX, building.y + offsetY, coinValue);
            });
          }
        }
      }
    });
  }

  private upgradeBuilding(building: Building, cost: number) {
    if (!this.economy.spendCoins(cost)) {
      return;
    }
    
    building.upgrade();
    this.updateUI();
    this.uiManager.showFloatingText(building.x, building.y - 50, 'UPGRADED!', '#ffd700');
    this.audioManager.playBuildingUpgradeSound();
  }

  private updateUI() {
    this.uiManager.updateCoins(this.economy.getCoins());
    this.uiManager.updateIncome(this.economy.calculateIncome());
    this.uiManager.updateBuildingCount(this.getRepairedBuildingCount());
    // Research points removed
    this.updateAffordabilityIndicators();
  }

  private updateAffordabilityIndicators() {
    const currentCoins = this.economy.getCoins();
    
    // Update all broken building repair prompts
    this.buildings.forEach(building => {
      if (!building.isRepaired()) {
        building.updateRepairPrompt(currentCoins);
      }
    });
    
    // Update all tree planting prompts
    this.plantingSpots.forEach(spot => {
      spot.updatePlantPrompt(currentCoins);
    });
  }

  private getRepairedBuildingCount(): number {
    return WorkshopLayout.getRepairedBuildingCount(this.buildingSpots);
  }

  private spawnCoinAt(x: number, y: number, value: number = 10) {
    console.log(`[GAME] Spawning coin at (${x}, ${y}) with value ${value}`);
    const coin = new Coin(this, x, y, value);
    this.coinGroup.add(coin);
  }

  private collectCoin(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody,
    coin: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody
  ) {
    const coinObj = coin as unknown as Coin;
    this.finalizeCoinCollection(coinObj);
  }

  private finalizeCoinCollection(coinObj: Coin) {
    if (!coinObj.active) return;

    let value = coinObj.getValue();
    
    // Apply gift wrapping multiplier if station is active
    const hasGiftWrapping = this.economy.getBuildings().some(b => 
      b.getType() === BuildingType.GIFT_WRAPPING_STATION && b.isRepaired()
    );
    
    if (hasGiftWrapping) {
      const giftWrappingBonus = 1.25;
      value = Math.floor(value * giftWrappingBonus);
    }
    
    // Apply reindeer stable collection bonus
    const hasReindeerStables = this.economy.getBuildings().some(b => 
      b.getType() === BuildingType.REINDEER_STABLES && b.isRepaired()
    );
    
    if (hasReindeerStables) {
      value = Math.floor(value * 1.5); // 50% collection bonus
    }
    
    coinObj.collect();
    this.economy.addCoins(value);
    this.uiManager.updateCoins(this.economy.getCoins());
    this.uiManager.showFloatingText(coinObj.x, coinObj.y, `+${value}`, '#ffd700');
    this.audioManager.playCoinCollectSound();
    this.updateAffordabilityIndicators();
  }

  private applyMagnetPerk(strength: number) {
    if (!this.coinGroup) return;
    const playerSprite = this.player.sprite;
    const captureRadius = 25 + (strength * 10);
    const magnetRange = 140 + (strength * 60);
    const magnetSpeed = 350 + (strength * 80);

    this.coinGroup.children.each(child => {
      const coinObj = child as Coin;
      if (!coinObj.active) return true;
      const distance = Phaser.Math.Distance.Between(coinObj.x, coinObj.y, playerSprite.x, playerSprite.y);

      if (distance <= captureRadius) {
        this.finalizeCoinCollection(coinObj);
        return true;
      }

      if (distance <= magnetRange) {
        this.physics.moveToObject(coinObj, playerSprite, magnetSpeed);
      }

      return true;
    }, this);
  }

  private resetMagnetizedCoins() {
    if (!this.coinGroup) return;
    this.coinGroup.children.each(child => {
      const coinObj = child as Coin;
      const body = coinObj.body as Phaser.Physics.Arcade.Body | null;
      if (body) {
        body.setVelocity(0, 0);
      }
      return true;
    }, this);
  }

  private saveGame() {
    const saveData: any = {
      coins: this.economy.getCoins(),
      buildings: this.buildingSpots
        .filter(spot => spot.repaired)
        .map(spot => {
          const building = this.buildings.get(spot.id);
          return {
            type: spot.type,
            x: spot.x,
            y: spot.y,
            level: building ? building.getLevel() : 1,
            slotIndex: 0,
            spotId: spot.id
          };
        }),
      trees: this.treeSpots
        .filter(spot => spot.planted)
        .map(spot => ({
          spotId: spot.id,
          x: spot.x,
          y: spot.y
        })),
      research: this.researchSystem.getSaveData(),
      buffs: this.buffSystem.getSaveData(),
      totalEarned: this.economy.getTotalEarned(),
      lastSaveTime: Date.now()
    };
    
    SaveManager.save(saveData);
  }

  private loadGame() {
    const saveData = SaveManager.load();
    
    if (saveData) {
      try {
      this.economy.setCoins(saveData.coins);
      this.economy.setTotalEarned(saveData.totalEarned || 0);
      
      // Calculate offline earnings (max 1 hour)
      const timeDiff = Math.min(Date.now() - saveData.lastSaveTime, 3600000);
      const offlineIncome = this.calculateOfflineIncome(saveData);
      const offlineEarnings = Math.floor((timeDiff / 1000) * offlineIncome);
      
      if (offlineEarnings > 0) {
        this.economy.addCoins(offlineEarnings);
        setTimeout(() => {
          this.uiManager.showFloatingText(512, 200, `Offline Earnings: +${offlineEarnings}`, '#90EE90');
        }, 500);
      }
      
      // Initialize building spots from save
      this.buildingSpots = WorkshopLayout.getInitialBuildingSpots();
      this.treeSpots = WorkshopLayout.getInitialTreeSpots();
      
      // Mark repaired buildings
      saveData.buildings.forEach(buildingData => {
        const spot = this.buildingSpots.find(s => 
          (buildingData as any).spotId ? s.id === (buildingData as any).spotId : 
          (s.type === buildingData.type && s.x === buildingData.x && s.y === buildingData.y)
        );
        if (spot) {
          spot.repaired = true;
        }
      });
      
      // Mark planted trees (from save data if available)
      const savedTrees = (saveData as any).trees || [];
      savedTrees.forEach((treeData: any) => {
        const spot = this.treeSpots.find(s => s.id === treeData.spotId);
        if (spot) {
          spot.planted = true;
        }
      });
      
      // Store levels for restoration
      this.buildingLevels = new Map(
        saveData.buildings.map(b => [
          (b as any).spotId || `${b.type}_${b.x}_${b.y}`,
          b.level
        ])
      );
      
      // Load research data
      if (saveData.research) {
        this.researchSystem.loadSaveData(saveData.research);
      }
      
      // Load buff data
      if (saveData.buffs) {
        this.buffSystem.loadSaveData(saveData.buffs);
      }
      } catch (error) {
        console.error('Error loading save data, starting fresh:', error);
        // Clear corrupted save
        SaveManager.clear();
        this.buildingSpots = WorkshopLayout.getInitialBuildingSpots();
        this.treeSpots = WorkshopLayout.getInitialTreeSpots();
      }
    } else {
      // Fresh start
      this.buildingSpots = WorkshopLayout.getInitialBuildingSpots();
      this.treeSpots = WorkshopLayout.getInitialTreeSpots();
    }
  }

  private calculateOfflineIncome(saveData: SaveData): number {
    let income = 0;
    saveData.buildings.forEach(buildingData => {
      const data = BUILDING_DATA[buildingData.type as BuildingType];
      income += Math.floor(data.baseIncome * Math.pow(1.5, buildingData.level - 1));
    });
    return income;
  }

  private resetGame() {
    console.log('Resetting game and clearing localStorage...');
    
    // Clear save data (localStorage)
    SaveManager.clear();
    
    // Destroy all buildings
    this.buildings.forEach(building => building.destroy());
    this.buildings.clear();
    
    // Clear all coins
    this.coinGroup.clear(true, true);
    
    // Destroy all trees
    this.trees.forEach(tree => tree.destroy());
    this.trees.clear();
    this.plantingSpots.forEach(spot => spot.destroy());
    this.plantingSpots.clear();
    
    // Restart the scene
    this.scene.restart();
    
    console.log('Game reset complete!');
  }

  private onResearchUpgradePurchased(upgrade: any): boolean {
    const currentCoins = this.economy.getCoins();
    if (this.economy.spendCoins(upgrade.cost)) {
      this.researchSystem.unlockUpgradeLevel(upgrade.id);
      this.updateUI();
      this.uiManager.showFloatingText(512, 200, 'Research Complete!', '#90EE90');
      this.audioManager.playBuildingUpgradeSound();
      
      // Refresh panel
      this.researchPanel.refresh(this.economy.getCoins());
      this.refreshTreeResearchEffects();
      return true;
    }
    
    this.uiManager.showFloatingText(512, 200, 'Not enough coins!', '#ff6347');
    return false;
  }

  private onResearchPanelClosed() {
    // Panel closed - no action needed
  }

  private openResearchPanel() {
    this.researchPanel.show(this.economy.getCoins());
  }

  private onCookiePurchased(type: CookieType, cost: number) {
    if (this.economy.spendCoins(cost)) {
      this.buffSystem.consumeCookie(type);
      this.updateUI();
      this.uiManager.showFloatingText(512, 200, 'Cookie Fed!', '#8b4513');
    }
  }

  private onCookieShopClosed() {
    // Panel closed - no action needed
  }

  private openCookieShop() {
    this.cookieShop.show(this.economy.getCoins());
  }

  private setupDragAndDrop() {
    // Enable drag and drop for all repaired buildings
    this.buildings.forEach(building => {
      if (building.isRepaired()) {
        const sprite = building.getSprite();
        sprite.setInteractive({ draggable: true });
        
        sprite.on('dragstart', (pointer: Phaser.Input.Pointer) => {
          this.gridSystem.startDrag(building, pointer);
        });
        
        sprite.on('drag', (pointer: Phaser.Input.Pointer) => {
          this.gridSystem.updateDrag(pointer);
        });
        
        sprite.on('dragend', () => {
          this.gridSystem.endDrag();
        });
      }
    });
  }
}
