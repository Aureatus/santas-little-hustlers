import Phaser from 'phaser';

export class UIManager {
  private scene: Phaser.Scene;
  private coinsText!: Phaser.GameObjects.Text;
  private incomeText!: Phaser.GameObjects.Text;
  private buildingsCountText!: Phaser.GameObjects.Text;
  private researchPointsText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(
    coins: number,
    income: number,
    buildingCount: number,
    onSave: () => void,
    onReset: () => void
  ) {
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
    
    this.buildingsCountText = this.scene.add.text(20, 85, `Buildings: ${buildingCount}/10`, {
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
    
    const instructions = this.scene.add.text(512, 745, 'WASD: Move | Click Tree: Get Coins | Click Buildings: Repair/Upgrade | Research Lab: Open Research', {
      fontSize: '16px',
      color: '#2d5016',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 }
    });
    instructions.setOrigin(0.5, 1);
    instructions.setDepth(51);
    instructions.setScrollFactor(0);
    
    // Save button
    const saveBtn = this.scene.add.text(900, 20, '💾 Save', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#2d5016',
      padding: { x: 10, y: 5 }
    });
    saveBtn.setDepth(51);
    saveBtn.setScrollFactor(0);
    saveBtn.setInteractive({ useHandCursor: true });
    saveBtn.on('pointerdown', () => {
      onSave();
      this.showFloatingText(saveBtn.x, saveBtn.y + 30, 'Saved!', '#90EE90');
    });
    
    // Reset button
    const resetBtn = this.scene.add.text(900, 60, '🔄 Reset', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#c41e3a',
      padding: { x: 10, y: 5 }
    });
    resetBtn.setDepth(51);
    resetBtn.setScrollFactor(0);
    resetBtn.setInteractive({ useHandCursor: true });
    resetBtn.on('pointerdown', () => {
      this.showResetConfirmation(onReset);
    });
  }

  private showResetConfirmation(onConfirm: () => void) {
    // Create confirmation dialog
    const container = this.scene.add.container(512, 384);
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
      onConfirm();
      this.showFloatingText(512, 300, 'Game Reset!', '#ff6347');
    });
    
    // No button
    const noBtn = this.scene.add.rectangle(100, 50, 150, 60, 0x2d5016);
    noBtn.setStrokeStyle(3, 0x90EE90);
    noBtn.setInteractive({ useHandCursor: true });
    
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
    this.buildingsCountText.setText(`Buildings: ${count}/11`);
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
