import * as Phaser from 'phaser';
import { BuffSystem, CookieType } from '../systems/BuffSystem';

export class CookieShop {
  private scene: Phaser.Scene;
  private panel?: Phaser.GameObjects.Container;
  private buffSystem: BuffSystem;
  private onCookiePurchased?: (type: CookieType, cost: number) => void;
  private onClose?: () => void;

  constructor(
    scene: Phaser.Scene,
    buffSystem: BuffSystem,
    onCookiePurchased?: (type: CookieType, cost: number) => void,
    onClose?: () => void
  ) {
    this.scene = scene;
    this.buffSystem = buffSystem;
    this.onCookiePurchased = onCookiePurchased;
    this.onClose = onClose;
  }

  show(currentCoins: number) {
    if (this.panel) {
      this.panel.destroy();
    }

    // Create main panel
    this.panel = this.scene.add.container(512, 384);
    this.panel.setDepth(100);

    // Background
    const bg = this.scene.add.rectangle(0, 0, 550, 520, 0x8b4513, 0.95);
    bg.setStrokeStyle(3, 0xffd700);
    this.panel.add(bg);

    // Title
    const title = this.scene.add.text(0, -220, '🍪 Cookie Bakery', {
      fontSize: '24px',
      color: '#ffd700',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    this.panel.add(title);

    // Subtitle
    const subtitle = this.scene.add.text(0, -190, 'Feed your elves special perks!', {
      fontSize: '14px',
      color: '#ffffff'
    });
    subtitle.setOrigin(0.5);
    this.panel.add(subtitle);

    // Cookie options
    this.createCookieOption('basic', 'Basic Cookie', '🍪', 50, 'Production +25% for 60s', -90, currentCoins);
    this.createCookieOption('chocolate', 'Chocolate Cookie', '🍫', 120, 'Production +50% for 90s', -30, currentCoins);
    this.createCookieOption('gingerbread', 'Gingerbread Cookie', '🍪', 250, 'Production +100% for 45s', 30, currentCoins);
    this.createCookieOption('magnet', 'North Pole Magnet', '🧲', 180, 'Pulls nearby coins to you for 45s', 90, currentCoins);
    this.createCookieOption('speed', 'Sugar Rush', '⚡', 200, 'Movement speed +50% for 45s', 150, currentCoins);

    // Active buffs display
    this.createActiveBuffsDisplay(210);

    // Close button
    const closeBtn = this.scene.add.rectangle(230, -230, 40, 30, 0xff6347, 0.8);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.hide();
      if (this.onClose) this.onClose();
    });
    this.panel.add(closeBtn);

    const closeText = this.scene.add.text(230, -230, '✕', {
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

  private createCookieOption(
    type: CookieType,
    name: string,
    icon: string,
    cost: number,
    description: string,
    y: number,
    currentCoins: number
  ) {
    if (!this.panel) return;

    const card = this.scene.add.container(0, y);
    this.panel.add(card);

    // Card background
    const canAfford = currentCoins >= cost;
    const bgColor = canAfford ? 0x2d5016 : 0x1a2f1a;
    
    const cardBg = this.scene.add.rectangle(0, 0, 450, 70, bgColor, 0.8);
    cardBg.setStrokeStyle(2, canAfford ? 0x90EE90 : 0x654321);
    card.add(cardBg);

    // Make interactive if affordable
    if (canAfford) {
      cardBg.setInteractive({ useHandCursor: true });
      cardBg.on('pointerdown', () => {
        this.purchaseCookie(type, cost);
      });
    }

    // Icon
    const iconText = this.scene.add.text(-180, 0, icon, {
      fontSize: '32px'
    });
    iconText.setOrigin(0.5);
    card.add(iconText);

    // Name
    const nameText = this.scene.add.text(-120, -15, name, {
      fontSize: '16px',
      color: '#ffd700',
      fontStyle: 'bold'
    });
    nameText.setOrigin(0, 0.5);
    card.add(nameText);

    // Description
    const descText = this.scene.add.text(-120, 5, description, {
      fontSize: '12px',
      color: '#cccccc'
    });
    descText.setOrigin(0, 0.5);
    card.add(descText);

    // Cost
    const costColor = canAfford ? '#90EE90' : '#ff6347';
    const costText = this.scene.add.text(150, 0, `${cost} 🪙`, {
      fontSize: '18px',
      color: costColor,
      fontStyle: 'bold'
    });
    costText.setOrigin(0.5);
    card.add(costText);
  }

  private createActiveBuffsDisplay(startY: number = 120) {
    if (!this.panel) return;
    const panel = this.panel;

    const activeBuffs = this.buffSystem.getActiveBuffs();
    const y = startY;

    // Title
    const title = this.scene.add.text(0, y, '🎯 Active Buffs', {
      fontSize: '16px',
      color: '#ffd700',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    panel.add(title);

    if (activeBuffs.length === 0) {
      const noBuffs = this.scene.add.text(0, y + 30, 'No active buffs', {
        fontSize: '14px',
        color: '#999999'
      });
      noBuffs.setOrigin(0.5);
      panel.add(noBuffs);
      return;
    }

    activeBuffs.forEach((buff, index) => {
      const buffY = y + 30 + (index * 25);
      const remainingTime = Math.ceil(this.buffSystem.getRemainingTime(buff.id) / 1000);
      
      const buffText = this.scene.add.text(0, buffY, `${buff.icon} ${buff.name} - ${remainingTime}s`, {
        fontSize: '14px',
        color: '#90EE90'
      });
      buffText.setOrigin(0.5);
      panel.add(buffText);
    });
  }

  private purchaseCookie(type: CookieType, cost: number) {
    if (this.onCookiePurchased) {
      this.onCookiePurchased(type, cost);
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