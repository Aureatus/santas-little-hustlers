import Phaser from 'phaser';
import { Building } from '../entities/Building';

export class BuildingInfoPanel {
  private scene: Phaser.Scene;
  private container?: Phaser.GameObjects.Container;
  private onUpgrade: (building: Building, cost: number) => void;
  private getCoins: () => number;

  constructor(
    scene: Phaser.Scene,
    onUpgrade: (building: Building, cost: number) => void,
    getCoins: () => number
  ) {
    this.scene = scene;
    this.onUpgrade = onUpgrade;
    this.getCoins = getCoins;
  }

  show(building: Building) {
    this.hide();
    
    const upgradeCost = building.getUpgradeCost();
    const canAfford = this.getCoins() >= upgradeCost;
    
    this.container = this.scene.add.container(512, 384);
    this.container.setDepth(250);
    this.container.setScrollFactor(0);
    
    const bg = this.scene.add.rectangle(0, 0, 400, 300, 0x2d5016, 0.98);
    const border = this.scene.add.rectangle(0, 0, 400, 300);
    border.setStrokeStyle(4, 0xffd700);
    
    const data = building.getData();
    const title = this.scene.add.text(0, -120, data.name, {
      fontSize: '28px',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    title.setOrigin(0.5);
    
    const levelText = this.scene.add.text(0, -80, `Level: ${building.getLevel()}`, {
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    levelText.setOrigin(0.5);
    
    const incomeText = this.scene.add.text(0, -45, `Income: ${building.getIncome()}/s`, {
      fontSize: '20px',
      color: '#90EE90',
      stroke: '#000000',
      strokeThickness: 2
    });
    incomeText.setOrigin(0.5);
    
    const upgradeBtn = this.scene.add.rectangle(0, 20, 300, 60, canAfford ? 0x4a7c4e : 0x333333);
    upgradeBtn.setStrokeStyle(3, canAfford ? 0xffd700 : 0x666666);
    if (canAfford) {
      upgradeBtn.setInteractive({ useHandCursor: true });
    }
    
    const upgradeBtnText = this.scene.add.text(0, 20, canAfford ? `Upgrade: ${upgradeCost} coins` : `Need ${upgradeCost} coins`, {
      fontSize: '22px',
      color: canAfford ? '#ffffff' : '#666666',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });
    upgradeBtnText.setOrigin(0.5);
    
    if (canAfford) {
      upgradeBtn.on('pointerdown', () => {
        this.onUpgrade(building, upgradeCost);
        this.hide();
      });
      
      upgradeBtn.on('pointerover', () => {
        upgradeBtn.setFillStyle(0x5a9c5e);
      });
      
      upgradeBtn.on('pointerout', () => {
        upgradeBtn.setFillStyle(0x4a7c4e);
      });
    }
    
    const closeBtn = this.scene.add.text(0, 100, 'Close', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#c41e3a',
      padding: { x: 15, y: 8 }
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.hide();
    });
    
    this.container.add([bg, border, title, levelText, incomeText, upgradeBtn, upgradeBtnText, closeBtn]);
  }

  hide() {
    if (this.container) {
      this.container.destroy();
      this.container = undefined;
    }
  }
}
