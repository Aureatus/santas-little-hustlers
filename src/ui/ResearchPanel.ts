import Phaser from 'phaser';
import { ResearchSystem, ResearchUpgrade, ResearchType } from '../systems/ResearchSystem';

export class ResearchPanel {
  private scene: Phaser.Scene;
  private panel?: Phaser.GameObjects.Container;
  private researchSystem: ResearchSystem;
  private onUpgradePurchased?: (upgrade: ResearchUpgrade) => void;
  private onClose?: () => void;

  constructor(
    scene: Phaser.Scene,
    researchSystem: ResearchSystem,
    onUpgradePurchased?: (upgrade: ResearchUpgrade) => void,
    onClose?: () => void
  ) {
    this.scene = scene;
    this.researchSystem = researchSystem;
    this.onUpgradePurchased = onUpgradePurchased;
    this.onClose = onClose;
  }

  show() {
    if (this.panel) {
      this.panel.destroy();
    }

    // Create main panel
    this.panel = this.scene.add.container(512, 384);
    this.panel.setDepth(100);

    // Background
    const bg = this.scene.add.rectangle(0, 0, 600, 500, 0x2d5016, 0.95);
    bg.setStrokeStyle(3, 0xffd700);
    this.panel.add(bg);

    // Title
    const title = this.scene.add.text(0, -220, '🔬 Research Lab', {
      fontSize: '24px',
      color: '#ffd700',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    this.panel.add(title);

    // Research points display
    const pointsText = this.scene.add.text(0, -180, `Research Points: ${this.researchSystem.getResearchPoints()}`, {
      fontSize: '18px',
      color: '#90EE90'
    });
    pointsText.setOrigin(0.5);
    this.panel.add(pointsText);

    // Create upgrade cards
    const upgrades = this.researchSystem.getAllUpgrades();
    const cardHeight = 80;
    const startY = -120;

    upgrades.forEach((upgrade, index) => {
      const y = startY + (index * cardHeight);
      this.createUpgradeCard(upgrade, y);
    });

    // Close button
    const closeBtn = this.scene.add.rectangle(250, -220, 40, 30, 0xff6347, 0.8);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.hide();
      if (this.onClose) this.onClose();
    });
    this.panel.add(closeBtn);

    const closeText = this.scene.add.text(250, -220, '✕', {
      fontSize: '20px',
      color: '#ffffff'
    });
    closeText.setOrigin(0.5);
    this.panel.add(closeText);

    // Entrance animation
    this.panel.setScale(0);
    this.scene.tweens.add({
      targets: this.panel,
      scale: 1,
      duration: 300,
      ease: 'Back.out'
    });
  }

  private createUpgradeCard(upgrade: ResearchUpgrade, y: number) {
    if (!this.panel) return;

    const card = this.scene.add.container(0, y);
    this.panel.add(card);

    // Card background
    const canAfford = this.researchSystem.getResearchPoints() >= upgrade.cost;
    const isMaxed = upgrade.currentLevel >= upgrade.maxLevel;
    const bgColor = isMaxed ? 0x666666 : (canAfford ? 0x2d5016 : 0x1a2f1a);
    
    const cardBg = this.scene.add.rectangle(0, 0, 550, 70, bgColor, 0.8);
    cardBg.setStrokeStyle(2, canAfford ? 0x90EE90 : 0x654321);
    card.add(cardBg);

    // Make interactive if not maxed
    if (!isMaxed && canAfford) {
      cardBg.setInteractive({ useHandCursor: true });
      cardBg.on('pointerdown', () => {
        this.purchaseUpgrade(upgrade);
      });
    }

    // Icon
    const icon = this.scene.add.text(-240, 0, upgrade.icon, {
      fontSize: '24px'
    });
    icon.setOrigin(0.5);
    card.add(icon);

    // Name
    const name = this.scene.add.text(-180, -15, upgrade.name, {
      fontSize: '16px',
      color: isMaxed ? '#999999' : '#ffd700',
      fontStyle: 'bold'
    });
    name.setOrigin(0, 0.5);
    card.add(name);

    // Description
    const desc = this.scene.add.text(-180, 5, upgrade.description, {
      fontSize: '12px',
      color: isMaxed ? '#666666' : '#cccccc'
    });
    desc.setOrigin(0, 0.5);
    card.add(desc);

    // Level display
    const levelText = this.scene.add.text(150, -15, `Level: ${upgrade.currentLevel}/${upgrade.maxLevel}`, {
      fontSize: '14px',
      color: isMaxed ? '#999999' : '#90EE90'
    });
    levelText.setOrigin(0.5);
    card.add(levelText);

    // Cost or status
    let statusText = '';
    let statusColor = '#ffffff';
    
    if (isMaxed) {
      statusText = 'MAXED';
      statusColor = '#ffd700';
    } else if (canAfford) {
      statusText = `${upgrade.cost} RP`;
      statusColor = '#90EE90';
    } else {
      statusText = `${upgrade.cost} RP`;
      statusColor = '#ff6347';
    }

    const costText = this.scene.add.text(150, 10, statusText, {
      fontSize: '14px',
      color: statusColor,
      fontStyle: isMaxed ? 'bold' : 'normal'
    });
    costText.setOrigin(0.5);
    card.add(costText);

    // Effect indicator
    const totalEffect = upgrade.currentLevel * upgrade.effectPerLevel;
    const effectText = this.scene.add.text(240, 0, `+${(totalEffect * 100).toFixed(0)}%`, {
      fontSize: '14px',
      color: isMaxed ? '#999999' : '#90EE90',
      fontStyle: 'bold'
    });
    effectText.setOrigin(0.5);
    card.add(effectText);
  }

  private purchaseUpgrade(upgrade: ResearchUpgrade) {
    if (this.researchSystem.purchaseUpgrade(upgrade.id)) {
      // Refresh the panel
      this.show();
      
      // Callback
      if (this.onUpgradePurchased) {
        this.onUpgradePurchased(upgrade);
      }
    }
  }

  hide() {
    if (this.panel) {
      this.scene.tweens.add({
        targets: this.panel,
        scale: 0,
        duration: 200,
        ease: 'Back.in',
        onComplete: () => {
          if (this.panel) {
            this.panel.destroy();
            this.panel = undefined;
          }
        }
      });
    }
  }

  isVisible(): boolean {
    return this.panel !== undefined;
  }
}