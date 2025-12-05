import * as Phaser from 'phaser';
import { ResearchSystem, ResearchUpgrade, ResearchCategory } from '../systems/ResearchSystem';

const CATEGORY_DEFINITIONS: Array<{ key: ResearchCategory; label: string; icon: string }> = [
  { key: 'tree', label: 'Trees', icon: '🎄' },
  { key: 'building', label: 'Buildings', icon: '🏭' },
  { key: 'universal', label: 'Other', icon: '✨' }
];

export class ResearchPanel {

  private scene: Phaser.Scene;
  private panel?: Phaser.GameObjects.Container;
  private coinsText?: Phaser.GameObjects.Text;
  private cardsContainer?: Phaser.GameObjects.Container;
  private researchSystem: ResearchSystem;
  private onUpgradePurchased?: (upgrade: ResearchUpgrade) => boolean;
  private onClose?: () => void;
  private activeCategory: ResearchCategory = 'tree';
  private categoryButtons: Map<ResearchCategory, Phaser.GameObjects.Rectangle> = new Map();
  private lastShownCoins: number = 0;

  constructor(

    scene: Phaser.Scene,
    researchSystem: ResearchSystem,
    onUpgradePurchased?: (upgrade: ResearchUpgrade) => boolean,
    onClose?: () => void
  ) {
    this.scene = scene;
    this.researchSystem = researchSystem;
    this.onUpgradePurchased = onUpgradePurchased;
    this.onClose = onClose;
  }

  show(currentCoins: number) {
    this.lastShownCoins = currentCoins;

    if (!this.panel) {
      this.createPanel(currentCoins);
    } else {
      this.updateCoins(currentCoins);
    }

    this.refreshCards(currentCoins);
  }


  private createPanel(currentCoins: number) {
    // Create main panel
    const camera = this.scene.cameras.main;
    const centerX = camera.scrollX + (camera.width / 2);
    const centerY = camera.scrollY + (camera.height / 2);
    this.panel = this.scene.add.container(centerX, centerY);
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

    // Coins display
    this.coinsText = this.scene.add.text(0, -180, `Available Coins: ${currentCoins}`, {
      fontSize: '18px',
      color: '#90EE90'
    });
    this.coinsText.setOrigin(0.5);
    this.panel.add(this.coinsText);

    this.createCategoryTabs();

    // Container for upgrade cards
    this.cardsContainer = this.scene.add.container(0, 0);
    this.panel.add(this.cardsContainer);


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

  private updateCoins(currentCoins: number) {
    if (this.coinsText) {
      this.coinsText.setText(`Available Coins: ${currentCoins}`);
    }
  }

  private createCategoryTabs() {
    if (!this.panel) return;

    const startX = -200;
    CATEGORY_DEFINITIONS.forEach((category, index) => {
      const x = startX + (index * 200);
      const y = -130;

      const bg = this.scene.add.rectangle(x, y, 180, 40, 0x1a2f1a, 0.85);
      bg.setStrokeStyle(2, 0x654321);
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => {
        this.switchCategory(category.key);
      });
      this.panel!.add(bg);

      const label = this.scene.add.text(x, y, `${category.icon} ${category.label}`, {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);
      this.panel!.add(label);

      this.categoryButtons.set(category.key, bg);
    });

    this.updateCategoryHighlights();
  }

  private switchCategory(category: ResearchCategory) {
    if (this.activeCategory === category) return;
    this.activeCategory = category;
    this.refreshCards(this.lastShownCoins);
  }

  private updateCategoryHighlights() {
    this.categoryButtons.forEach((button, key) => {
      const isActive = key === this.activeCategory;
      button.setFillStyle(isActive ? 0x3c7526 : 0x1a2f1a, isActive ? 0.95 : 0.7);
      button.setStrokeStyle(2, isActive ? 0xffd700 : 0x654321);
    });
  }

  private refreshCards(currentCoins: number) {
    if (!this.cardsContainer) return;

    this.lastShownCoins = currentCoins;
    this.cardsContainer.removeAll(true);

    const upgrades = this.researchSystem.getUpgradesByCategory(this.activeCategory);
    const cardHeight = 90;
    const startY = -80;

    upgrades.forEach((upgrade, index) => {
      const y = startY + (index * cardHeight);
      this.createUpgradeCard(upgrade, y, currentCoins);
    });

    this.updateCategoryHighlights();
  }


  private createUpgradeCard(upgrade: ResearchUpgrade, y: number, currentCoins: number) {
    if (!this.cardsContainer) return;

    const card = this.scene.add.container(0, y);
    this.cardsContainer.add(card);

    // Card background
    const canAfford = currentCoins >= upgrade.cost;
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
      statusText = `${upgrade.cost} Coins`;
      statusColor = '#90EE90';
    } else {
      statusText = `${upgrade.cost} Coins`;
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
    const effectPercent = (totalEffect * 100).toFixed(0);
    const sign = upgrade.effectDisplayType === 'decrease' ? '-' : '+';
    const effectLabel = upgrade.effectText ? upgrade.effectText : `${sign}${effectPercent}%`;
    const effectText = this.scene.add.text(240, 0, effectLabel, {
      fontSize: '14px',
      color: isMaxed ? '#999999' : '#90EE90',
      fontStyle: 'bold'
    });
    effectText.setOrigin(0.5);
    card.add(effectText);
  }

  private purchaseUpgrade(upgrade: ResearchUpgrade) {
    if (this.onUpgradePurchased) {
      const success = this.onUpgradePurchased(upgrade);
      // The scene calls refresh(), so we don't need to do anything here except triggering the callback
    }
  }

  // Helper to refresh with new coins
  refresh(currentCoins: number) {
    this.show(currentCoins);
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
            this.coinsText = undefined;
            this.cardsContainer = undefined;
            this.categoryButtons.clear();
            this.activeCategory = 'tree';
          }
        }
      });
    }
  }

  isVisible(): boolean {
    return this.panel !== undefined;
  }
}
