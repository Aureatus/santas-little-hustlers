import { BuildingType } from '../entities/Building';

export interface BuildingSpot {
  id: string;
  type: BuildingType;
  x: number;
  y: number;
  unlockOrder: number;
  repaired: boolean;
}

export interface TreeSpot {
  id: string;
  x: number;
  y: number;
  unlockOrder: number;
  planted: boolean;
  cost: number;
}

export class WorkshopLayout {
  // Right side - Buildings area (10 buildings)
  static readonly BUILDING_SPOTS: BuildingSpot[] = [
    // Row 1 - Starter buildings
    { id: 'toy_1', type: BuildingType.TOY_MAKER, x: 600, y: 250, unlockOrder: 1, repaired: false },
    { id: 'toy_2', type: BuildingType.TOY_MAKER, x: 740, y: 240, unlockOrder: 2, repaired: false },
    
    // Row 2 - Early production
    { id: 'gift_1', type: BuildingType.GIFT_WRAPPER, x: 600, y: 360, unlockOrder: 3, repaired: false },
    { id: 'cookie_1', type: BuildingType.COOKIE_FACTORY, x: 740, y: 370, unlockOrder: 4, repaired: false },
    { id: 'gift_2', type: BuildingType.GIFT_WRAPPER, x: 880, y: 300, unlockOrder: 5, repaired: false },
    
    // Row 3 - Mid game
    { id: 'elf_1', type: BuildingType.ELF_HOUSE, x: 600, y: 480, unlockOrder: 6, repaired: false },
    { id: 'cookie_2', type: BuildingType.COOKIE_FACTORY, x: 740, y: 490, unlockOrder: 7, repaired: false },
    { id: 'reindeer_1', type: BuildingType.REINDEER_STABLE, x: 880, y: 430, unlockOrder: 8, repaired: false },
    
    // Row 4 - Late game
    { id: 'elf_2', type: BuildingType.ELF_HOUSE, x: 670, y: 590, unlockOrder: 9, repaired: false },
    { id: 'research_lab', type: BuildingType.RESEARCH_LAB, x: 810, y: 600, unlockOrder: 10, repaired: false },
    { id: 'santas_office', type: BuildingType.SANTAS_OFFICE, x: 950, y: 550, unlockOrder: 11, repaired: false },
  ];

  // Left side - Tree planting area (6 spots)
  // Trees give active income but require clicking
  // Each tree gives 6 coins per shake (2 coins × 3 value, 20s cooldown)
  static readonly TREE_SPOTS: TreeSpot[] = [
    // Starter tree (free/pre-planted)
    { id: 'tree_1', x: 200, y: 300, unlockOrder: 1, planted: true, cost: 0 },
    
    // Purchasable trees - need multiple shakes to afford next tree
    // Start: 50 coins, each shake: +6 coins (2 drops × 3 value, 20s cooldown)
    // Need ~3 shakes (1 min) to afford tree 2
    { id: 'tree_2', x: 200, y: 450, unlockOrder: 2, planted: false, cost: 70 },
    { id: 'tree_3', x: 350, y: 250, unlockOrder: 3, planted: false, cost: 150 },
    { id: 'tree_4', x: 350, y: 400, unlockOrder: 4, planted: false, cost: 300 },
    { id: 'tree_5', x: 200, y: 600, unlockOrder: 5, planted: false, cost: 600 },
    { id: 'tree_6', x: 350, y: 550, unlockOrder: 6, planted: false, cost: 1200 },
  ];

  static getInitialBuildingSpots(): BuildingSpot[] {
    return this.BUILDING_SPOTS.map(spot => ({ ...spot }));
  }

  static getInitialTreeSpots(): TreeSpot[] {
    return this.TREE_SPOTS.map(spot => ({ ...spot }));
  }

  static getNextUnrepairedBuilding(spots: BuildingSpot[]): BuildingSpot | null {
    return spots
      .filter(spot => !spot.repaired)
      .sort((a, b) => a.unlockOrder - b.unlockOrder)[0] || null;
  }

  static getNextUnplantedTree(spots: TreeSpot[]): TreeSpot | null {
    return spots
      .filter(spot => !spot.planted)
      .sort((a, b) => a.unlockOrder - b.unlockOrder)[0] || null;
  }

  static getRepairedBuildingCount(spots: BuildingSpot[]): number {
    return spots.filter(spot => spot.repaired).length;
  }

  static getPlantedTreeCount(spots: TreeSpot[]): number {
    return spots.filter(spot => spot.planted).length;
  }

  static getTotalBuildingCount(): number {
    return this.BUILDING_SPOTS.length;
  }

  static getTotalTreeCount(): number {
    return this.TREE_SPOTS.length;
  }
}
