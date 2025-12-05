import * as Phaser from 'phaser';

export class UIManager {
  private scene: Phaser.Scene;
  private coinsText!: Phaser.GameObjects.Text;
  private incomeText!: Phaser.GameObjects.Text;
  private buildingsCountText!: Phaser.GameObjects.Text;
  private researchPointsText!: Phaser.GameObjects.Text;
  private addTreeLabel?: Phaser.GameObjects.Text;
  private addBuildingLabel?: Phaser.GameObjects.Text;
  private treeCostProvider?: () => number;
  private buildingCostProvider?: () => number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(
    coins: number,
    income: number,
    buildingCount: number,
    onSave: () => void,
    onReset: () => void,
    onAddTreeSpot?: () => void,
    onAddBuildingSpot?: () => void,
    getTreeCost?: () => number,
    getBuildingCost?: () => number
  ) {
    const screenWidth = this.scene.scale.width;
    this.treeCostProvider = getTreeCost;
    this.buildingCostProvider = getBuildingCost;

    const uiBackground = this.scene.add.rectangle(10, 10, 280, 110, 0x2d5016, 0.9);

    uiBackground.setOrigin(0, 0);
    uiBackground.setDepth(50);
    uiBackground.setScrollFactor(0);
    
    this.coinsText = this.scene.add.text(20, 20, `Coins: ${coins}`, {
      fontSize: '28px',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.coinsText.setDepth(51);
    this.coinsText.setScrollFactor(0);
    
    this.incomeText = this.scene.add.text(20, 55, `Income: ${income}/s`, {
      fontSize: '20px',
      color: '#90EE90',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.incomeText.setDepth(51);
    this.incomeText.setScrollFactor(0);
    
    this.buildingsCountText = this.scene.add.text(20, 85, `Buildings: ${buildingCount}`, {
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.buildingsCountText.setDepth(51);
    this.buildingsCountText.setScrollFactor(0);
    
    this.researchPointsText = this.scene.add.text(20, 110, `RP: 0`, {
      fontSize: '18px',
      color: '#00ffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.researchPointsText.setOrigin(0, 0);
    this.researchPointsText.setDepth(51);
    this.researchPointsText.setScrollFactor(0);
    
    const instructionLines = [
      'WASD: Move  |  Click Trees to collect coins  |  Click Buildings to repair/upgrade',
      'Press R to open Research  |  Use Add buttons to place new trees/buildings'
    ];

    const instructions = this.scene.add.text(screenWidth / 2, 745, instructionLines.join('\n'), {
      fontSize: '16px',
      color: '#2d5016',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 },
      align: 'center'
    });
    instructions.setOrigin(0.5, 1);
    instructions.setDepth(51);
    instructions.setScrollFactor(0);
    
    // Save button
    const saveBtn = this.scene.add.rectangle(screenWidth - 110, 35, 140, 35, 0x2d5016, 0.9);
    saveBtn.setStrokeStyle(2, 0x173013);
    saveBtn.setDepth(51);
    saveBtn.setScrollFactor(0);
    saveBtn.setInteractive({ useHandCursor: true });
    saveBtn.on('pointerdown', () => {
      onSave();
      this.showFloatingText(saveBtn.x, saveBtn.y + 20, 'Saved!', '#90EE90');
    });

    const saveLabel = this.scene.add.text(screenWidth - 110, 35, '💾 Save', {
      fontSize: '18px',
      color: '#ffffff'
    });
    saveLabel.setOrigin(0.5);
    saveLabel.setDepth(52);
    saveLabel.setScrollFactor(0);
    
    const resetBtn = this.scene.add.rectangle(screenWidth - 110, 75, 140, 35, 0xc41e3a, 0.9);
    resetBtn.setStrokeStyle(2, 0x701c24);
    resetBtn.setDepth(51);
    resetBtn.setScrollFactor(0);
    resetBtn.setInteractive({ useHandCursor: true });
    resetBtn.on('pointerdown', () => {
      this.showResetConfirmation(onReset);
    });

    const resetLabel = this.scene.add.text(screenWidth - 110, 75, '🔄 Reset', {
      fontSize: '18px',
      color: '#ffffff'
    });
    resetLabel.setOrigin(0.5);
    resetLabel.setDepth(52);
    resetLabel.setScrollFactor(0);
    
    if (onAddTreeSpot) {
      const addTreeBtn = this.scene.add.rectangle(screenWidth - 360, 35, 180, 35, 0x3c7526, 0.9);
      addTreeBtn.setStrokeStyle(2, 0x1a3d14);
      addTreeBtn.setDepth(51);
      addTreeBtn.setScrollFactor(0);
      addTreeBtn.setInteractive({ useHandCursor: true });
      addTreeBtn.on('pointerdown', () => onAddTreeSpot());

      this.addTreeLabel = this.scene.add.text(screenWidth - 360, 35, '🌲 Add Tree', {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      this.addTreeLabel.setOrigin(0.5);
      this.addTreeLabel.setDepth(52);
      this.addTreeLabel.setScrollFactor(0);
    }
    
    if (onAddBuildingSpot) {
      const addBuildingBtn = this.scene.add.rectangle(screenWidth - 360, 75, 180, 35, 0x5b3d1f, 0.9);
      addBuildingBtn.setStrokeStyle(2, 0x2d1f0d);
      addBuildingBtn.setDepth(51);
      addBuildingBtn.setScrollFactor(0);
      addBuildingBtn.setInteractive({ useHandCursor: true });
      addBuildingBtn.on('pointerdown', () => onAddBuildingSpot());

      this.addBuildingLabel = this.scene.add.text(screenWidth - 360, 75, '🏗️ Add Building', {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      this.addBuildingLabel.setOrigin(0.5);
      this.addBuildingLabel.setDepth(52);
      this.addBuildingLabel.setScrollFactor(0);
    }

    this.updateAddButtonCosts(getTreeCost?.(), getBuildingCost?.());

    
    if (onAddBuildingSpot) {
      const addBuildingBtn = this.scene.add.rectangle(screenWidth - 360, 75, 180, 35, 0x5b3d1f, 0.9);
      addBuildingBtn.setStrokeStyle(2, 0x2d1f0d);
      addBuildingBtn.setDepth(51);
      addBuildingBtn.setScrollFactor(0);
      addBuildingBtn.setInteractive({ useHandCursor: true });
      addBuildingBtn.on('pointerdown', () => onAddBuildingSpot());

      const buildingLabelText = getBuildingCost ? `🏗️ Add Building (${getBuildingCost()}c)` : '🏗️ Add Building';
      const addBuildingLabel = this.scene.add.text(screenWidth - 360, 75, buildingLabelText, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      addBuildingLabel.setOrigin(0.5);
      addBuildingLabel.setDepth(52);
      addBuildingLabel.setScrollFactor(0);
    }
  }

  updateAddButtonCosts(treeCost?: number, buildingCost?: number) {
    const treeCostValue = treeCost ?? this.treeCostProvider?.();
    if (this.addTreeLabel) {
      this.addTreeLabel.setText(treeCostValue ? `🌲 Add Tree (${treeCostValue}c)` : '🌲 Add Tree');
    }

    const buildingCostValue = buildingCost ?? this.buildingCostProvider?.();
    if (this.addBuildingLabel) {
      this.addBuildingLabel.setText(buildingCostValue ? `🏗️ Add Building (${buildingCostValue}c)` : '🏗️ Add Building');
    }
  }
 
   private showResetConfirmation(onConfirm: () => void) {

    const { width, height } = this.scene.scale;

    // Dark overlay to block interactions behind the dialog
    const blocker = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.45);
    blocker.setDepth(299);
    blocker.setScrollFactor(0);
    blocker.setInteractive();

    // Create confirmation dialog
    const container = this.scene.add.container(width / 2, height / 2);
    container.setDepth(300);
    container.setScrollFactor(0);
    
    const bg = this.scene.add.rectangle(0, 0, 500, 250, 0x2d5016, 0.98);
    const border = this.scene.add.rectangle(0, 0, 500, 250);
    border.setStrokeStyle(4, 0xff6347);
    
    const title = this.scene.add.text(0, -80, '⚠️ Reset Game?', {
      fontSize: '32px',
      color: '#ff6347',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);
    
    const message = this.scene.add.text(0, -30, 'This will delete all progress!\nAre you sure?', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    });
    message.setOrigin(0.5);
    
    // Yes button
    const yesBtn = this.scene.add.rectangle(-100, 50, 150, 60, 0xc41e3a);
    yesBtn.setStrokeStyle(3, 0xff6347);
    yesBtn.setInteractive({ useHandCursor: true });
    yesBtn.setScrollFactor(0);
    
    const yesText = this.scene.add.text(-100, 50, 'Yes, Reset', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });
    yesText.setOrigin(0.5);
    
    yesBtn.on('pointerover', () => {
      yesBtn.setFillStyle(0xff0000);
    });
    
    yesBtn.on('pointerout', () => {
      yesBtn.setFillStyle(0xc41e3a);
    });
    
    yesBtn.on('pointerdown', () => {
      container.destroy();
      blocker.destroy();
      onConfirm();
      this.showFloatingText(width / 2, height / 2 - 80, 'Game Reset!', '#ff6347');
    });
    
    // No button
    const noBtn = this.scene.add.rectangle(100, 50, 150, 60, 0x2d5016);
    noBtn.setStrokeStyle(3, 0x90EE90);
    noBtn.setInteractive({ useHandCursor: true });
    noBtn.setScrollFactor(0);
    
    const noText = this.scene.add.text(100, 50, 'Cancel', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });
    noText.setOrigin(0.5);
    
    noBtn.on('pointerover', () => {
      noBtn.setFillStyle(0x4a7c4e);
    });
    
    noBtn.on('pointerout', () => {
      noBtn.setFillStyle(0x2d5016);
    });
    
    noBtn.on('pointerdown', () => {
      container.destroy();
      blocker.destroy();
    });
    
    container.add([bg, border, title, message, yesBtn, yesText, noBtn, noText]);
  }

  updateCoins(coins: number) {
    this.coinsText.setText(`Coins: ${coins}`);
  }

  updateIncome(income: number) {
    this.incomeText.setText(`Income: ${income}/s`);
  }

  updateBuildingCount(count: number) {
    this.buildingsCountText.setText(`Buildings: ${count}`);
  }

  updateResearchPoints(points: number) {
    this.researchPointsText.setText(`RP: ${points}`);
  }

  showFloatingText(x: number, y: number, text: string, color: string) {
    const floatingText = this.scene.add.text(x, y, text, {
      fontSize: '24px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    floatingText.setOrigin(0.5);
    floatingText.setDepth(100);
    
    this.scene.tweens.add({
      targets: floatingText,
      y: y - 60,
      alpha: 0,
      scale: 1.5,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        floatingText.destroy();
      }
    });
  }
}
