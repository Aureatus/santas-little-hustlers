export enum ResearchType {
  PRODUCTION_SPEED = 'production_speed',
  UPGRADE_COST = 'upgrade_cost',
  COIN_VALUE = 'coin_value',
  BUILDING_EFFICIENCY = 'building_efficiency'
}

export interface ResearchUpgrade {
  id: string;
  type: ResearchType;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
  currentLevel: number;
  effectPerLevel: number;
  icon: string;
}

export class ResearchSystem {
  private upgrades: Map<string, ResearchUpgrade>;
  private researchPoints: number = 0;

  constructor() {
    this.upgrades = new Map();
    this.initializeUpgrades();
  }

  private initializeUpgrades() {
    const upgrades: ResearchUpgrade[] = [
      {
        id: 'prod_speed_1',
        type: ResearchType.PRODUCTION_SPEED,
        name: 'Faster Production',
        description: 'Increase all building production speed by 5%',
        cost: 100,
        maxLevel: 10,
        currentLevel: 0,
        effectPerLevel: 0.05,
        icon: '⚡'
      },
      {
        id: 'upgrade_cost_1',
        type: ResearchType.UPGRADE_COST,
        name: 'Cheaper Upgrades',
        description: 'Reduce all building upgrade costs by 3%',
        cost: 150,
        maxLevel: 10,
        currentLevel: 0,
        effectPerLevel: 0.03,
        icon: '💰'
      },
      {
        id: 'coin_value_1',
        type: ResearchType.COIN_VALUE,
        name: 'Valuable Coins',
        description: 'Increase coin value from all sources by 2%',
        cost: 200,
        maxLevel: 10,
        currentLevel: 0,
        effectPerLevel: 0.02,
        icon: '🪙'
      },
      {
        id: 'building_efficiency_1',
        type: ResearchType.BUILDING_EFFICIENCY,
        name: 'Efficient Buildings',
        description: 'All buildings produce 4% more income',
        cost: 250,
        maxLevel: 10,
        currentLevel: 0,
        effectPerLevel: 0.04,
        icon: '🏭'
      }
    ];

    upgrades.forEach(upgrade => {
      this.upgrades.set(upgrade.id, upgrade);
    });
  }

  addResearchPoints(points: number) {
    this.researchPoints += points;
  }

  spendResearchPoints(cost: number): boolean {
    if (this.researchPoints >= cost) {
      this.researchPoints -= cost;
      return true;
    }
    return false;
  }

  getResearchPoints(): number {
    return this.researchPoints;
  }

  getUpgrade(id: string): ResearchUpgrade | undefined {
    return this.upgrades.get(id);
  }

  getAllUpgrades(): ResearchUpgrade[] {
    return Array.from(this.upgrades.values());
  }

  purchaseUpgrade(id: string): boolean {
    const upgrade = this.upgrades.get(id);
    if (!upgrade) return false;

    if (upgrade.currentLevel >= upgrade.maxLevel) return false;
    if (this.researchPoints < upgrade.cost) return false;

    this.researchPoints -= upgrade.cost;
    upgrade.currentLevel++;
    
    // Increase cost for next level
    upgrade.cost = Math.floor(upgrade.cost * 1.5);
    
    return true;
  }

  // Get multipliers based on research
  getProductionSpeedMultiplier(): number {
    const upgrade = this.upgrades.get('prod_speed_1');
    return upgrade ? 1 + (upgrade.currentLevel * upgrade.effectPerLevel) : 1;
  }

  getUpgradeCostMultiplier(): number {
    const upgrade = this.upgrades.get('upgrade_cost_1');
    return upgrade ? 1 - (upgrade.currentLevel * upgrade.effectPerLevel) : 1;
  }

  getCoinValueMultiplier(): number {
    const upgrade = this.upgrades.get('coin_value_1');
    return upgrade ? 1 + (upgrade.currentLevel * upgrade.effectPerLevel) : 1;
  }

  getBuildingEfficiencyMultiplier(): number {
    const upgrade = this.upgrades.get('building_efficiency_1');
    return upgrade ? 1 + (upgrade.currentLevel * upgrade.effectPerLevel) : 1;
  }

  // Save/Load functionality
  getSaveData(): any {
    return {
      researchPoints: this.researchPoints,
      upgrades: Array.from(this.upgrades.values()).map(u => ({
        id: u.id,
        currentLevel: u.currentLevel,
        cost: u.cost
      }))
    };
  }

  loadSaveData(data: any) {
    this.researchPoints = data.researchPoints || 0;
    
    if (data.upgrades) {
      data.upgrades.forEach((savedUpgrade: any) => {
        const upgrade = this.upgrades.get(savedUpgrade.id);
        if (upgrade) {
          upgrade.currentLevel = savedUpgrade.currentLevel;
          upgrade.cost = savedUpgrade.cost;
        }
      });
    }
  }
}