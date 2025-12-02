export interface SaveData {
  coins: number;
  buildings: {
    type: string;
    x: number;
    y: number;
    level: number;
    slotIndex: number;
  }[];
  totalEarned: number;
  lastSaveTime: number;
}

export class SaveManager {
  private static SAVE_KEY = 'elf_economy_save';

  static save(data: SaveData): void {
    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
      console.log('Game saved!');
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  static load(): SaveData | null {
    try {
      const saved = localStorage.getItem(this.SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved) as SaveData;
        console.log('Game loaded!');
        return data;
      }
    } catch (error) {
      console.error('Failed to load game:', error);
    }
    return null;
  }

  static clear(): void {
    localStorage.removeItem(this.SAVE_KEY);
    console.log('Save cleared!');
  }

  static exists(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }
}
