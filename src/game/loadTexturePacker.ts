import 'phaser';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../const';

let capguy;

class ownScene extends Phaser.Scene {
  preload() {
    const scene: Phaser.Scene = this;

    scene.load.multiatlas('cityscene', 'assets/cityscene.json', 'assets');
  }

  create() {
    const scene: Phaser.Scene = this;

    const background = scene.add.sprite(0, 0, 'cityscene', 'background');

    background.displayWidth = WINDOW_WIDTH;
    background.displayHeight = WINDOW_HEIGHT;

    capguy = scene.add.sprite(
      0,
      WINDOW_HEIGHT / 1.5,
      'cityscene',
      'capguy/walk/0001'
    );
    capguy.setScale(0.7);

    const frameNames = scene.anims.generateFrameNames('cityscene', {
      start: 1,
      end: 8,
      prefix: 'capguy/walk/',
      zeroPad: 4,
    });

    scene.anims.create({
      key: 'walk',
      frames: frameNames,
      frameRate: 10,
      repeat: -1,
    });

    capguy.anims.play('walk');
  }

  update(time: number, delta: number): void {
    capguy.x += delta / 5;
    if (capguy.x > WINDOW_WIDTH + 50) {
      capguy.x = -50;
    }
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: WINDOW_WIDTH,
  height: WINDOW_HEIGHT,
  scene: ownScene,
};

function loadTexturePacker() {
  const game = new Phaser.Game(config);
}

export default loadTexturePacker;
