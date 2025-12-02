import Phaser from 'phaser';

export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private speed: number = 200;

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

    if (cursors.left?.isDown || wasd.left.isDown) {
      velocityX = -this.speed;
    } else if (cursors.right?.isDown || wasd.right.isDown) {
      velocityX = this.speed;
    }

    if (cursors.up?.isDown || wasd.up.isDown) {
      velocityY = -this.speed;
    } else if (cursors.down?.isDown || wasd.down.isDown) {
      velocityY = this.speed;
    }

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.sprite.setVelocity(velocityX, velocityY);
  }
}
