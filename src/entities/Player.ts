import * as Phaser from 'phaser';

export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private baseSpeed: number = 200;
  private speedMultiplier: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
  }

  update(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    wasd: any
  ) {
    let velocityX = 0;
    let velocityY = 0;
    const currentSpeed = this.baseSpeed * this.speedMultiplier;

    if (cursors.left?.isDown || wasd.left.isDown) {
      velocityX = -currentSpeed;
    } else if (cursors.right?.isDown || wasd.right.isDown) {
      velocityX = currentSpeed;
    }

    if (cursors.up?.isDown || wasd.up.isDown) {
      velocityY = -currentSpeed;
    } else if (cursors.down?.isDown || wasd.down.isDown) {
      velocityY = currentSpeed;
    }

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.sprite.setVelocity(velocityX, velocityY);
  }

  setSpeedMultiplier(multiplier: number) {
    this.speedMultiplier = Math.max(0.5, multiplier);
  }
}
