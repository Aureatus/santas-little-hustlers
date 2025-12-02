export class AudioManager {
  private scene: Phaser.Scene;
  private musicVolume: number = 0.3;
  private sfxVolume: number = 0.5;
  private bgMusic?: Phaser.Sound.BaseSound;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  playMusic(key: string, loop: boolean = true): void {
    if (this.bgMusic) {
      this.bgMusic.stop();
    }
    
    if (this.scene.sound.get(key)) {
      this.bgMusic = this.scene.sound.add(key, { 
        loop, 
        volume: this.musicVolume 
      });
      this.bgMusic.play();
    }
  }

  playSFX(key: string, volume?: number): void {
    if (this.scene.sound.get(key)) {
      this.scene.sound.play(key, { 
        volume: volume !== undefined ? volume : this.sfxVolume 
      });
    }
  }

  stopMusic(): void {
    if (this.bgMusic) {
      this.bgMusic.stop();
    }
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.bgMusic && 'setVolume' in this.bgMusic) {
      (this.bgMusic as any).setVolume(this.musicVolume);
    }
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
  }
}
