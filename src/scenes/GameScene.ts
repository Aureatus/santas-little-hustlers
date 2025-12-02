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
import { EconomySystem } from '../systems/EconomySystem';
import { WorkshopLayout, BuildingSpot, TreeSpot } from '../systems/WorkshopLayout';
import { AssetCreator } from '../utils/AssetCreator';
import { EnvironmentRenderer } from '../rendering/EnvironmentRenderer';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  
  // Systems
  private economy!: EconomySystem;
  private audioManager!: AudioManager;
  
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
  
  // Collectibles
  private coinGroup!: Phaser.Physics.Arcade.Group;
  
  // Environment
  private environmentRenderer!: EnvironmentRenderer;
  
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    AssetCreator.createAllAssets(this);
  }

  create() {
    console.log('GameScene: create() started');
    
    // Initialize systems
    this.economy = new EconomySystem(50);
    this.audioManager = new AudioManager(this);
    console.log('GameScene: Systems initialized');
    
    // Render environment
    this.environmentRenderer = new EnvironmentRenderer(this);
    this.environmentRenderer.createBackground();
    this.environmentRenderer.createBorder();
    this.environmentRenderer.createSnowEffect();
    console.log('GameScene: Environment rendered');
    
    // Load or initialize workshop layout
    this.loadGame();
    console.log('GameScene: Game loaded, treeSpots:', this.treeSpots.length, 'buildingSpots:', this.buildingSpots.length);
    
    // Create all building spots (broken and active)
    this.createBuildings();
    
    // Create player
    this.player = new Player(this, 512, 384);
    
    // Setup controls
    this.setupControls();
    
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
    
    // Create trees and planting spots
    this.createTrees();
    
    // Start game loops
    this.startGameLoops();
  }

  update(time: number, delta: number) {
    this.player.update(this.cursors, this.wasd);
    this.buildings.forEach(building => building.update());
    this.trees.forEach(tree => tree.update(delta));
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
        // Setup click handler for repaired buildings - click sprite to show info
        building.getSprite().on('pointerdown', () => {
          this.buildingInfoPanel.show(building);
        });
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
    
    // Buildings spawn coins
    this.economy.getBuildings().forEach(building => {
      if (building.shouldSpawnCoin()) {
        this.spawnCoinAt(building.x, building.y);
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
  }

  private updateUI() {
    this.uiManager.updateCoins(this.economy.getCoins());
    this.uiManager.updateIncome(this.economy.calculateIncome());
    this.uiManager.updateBuildingCount(this.getRepairedBuildingCount());
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
    const value = coinObj.getValue();
    console.log(`[GAME] Collecting coin worth ${value}`);
    coinObj.collect();
    this.economy.addCoins(value);
    this.uiManager.updateCoins(this.economy.getCoins());
    this.uiManager.showFloatingText(coinObj.x, coinObj.y, `+${value}`, '#ffd700');
    this.updateAffordabilityIndicators();
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
}
