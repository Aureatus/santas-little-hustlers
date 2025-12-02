import { Building } from '../entities/Building';

export class EconomySystem {
  private coins: number;
  private totalEarned: number;
  private buildings: Building[];

  constructor(initialCoins: number = 50) {
    this.coins = initialCoins;
    this.totalEarned = 0;
    this.buildings = [];
  }

  addCoins(amount: number) {
    this.coins += amount;
    this.totalEarned += amount;
  }

  spendCoins(amount: number): boolean {
    if (this.coins >= amount) {
      this.coins -= amount;
      return true;
    }
    return false;
  }

  getCoins(): number {
    return this.coins;
  }

  getTotalEarned(): number {
    return this.totalEarned;
  }

  setCoins(amount: number) {
    this.coins = amount;
  }

  setTotalEarned(amount: number) {
    this.totalEarned = amount;
  }

  addBuilding(building: Building) {
    this.buildings.push(building);
  }

  getBuildings(): Building[] {
    return this.buildings;
  }

  calculateIncome(): number {
    return this.buildings.reduce((total, building) => {
      return total + building.getIncome();
    }, 0);
  }

  processIncome() {
    const income = this.calculateIncome();
    this.addCoins(income);
    return income;
  }
}
