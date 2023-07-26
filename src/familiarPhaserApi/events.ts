import Phaser from 'phaser';

import dudePng from '../assets/dude.png';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../const';

const ANIMS_EVENTS = [
  // 'ADD_ANIMATION',
  // 'ANIMATION_COMPLETE',
  // 'ANIMATION_COMPLETE_KEY',
  // 'ANIMATION_REPEAT',
  // 'ANIMATION_RESTART',
  // 'ANIMATION_START',
  // 'ANIMATION_STOP',
  // 'ANIMATION_UPDATE',
  // 'PAUSE_ALL',
  // 'REMOVE_ANIMATION',
  // 'RESUME_ALL',
];

const CORE_EVENTS = [
  // 'BLUR',
  // 'BOOT',
  // 'CONTEXT_LOST',
  // 'CONTEXT_RESTORED',
  // 'DESTROY',
  // 'FOCUS',
  // 'HIDDEN',
  // 'PAUSE',
  // 'POST_RENDER',
  // 'POST_STEP',
  // 'PRE_RENDER',
  // 'PRE_STEP',
  // 'READY',
  // 'RESUME',
  // 'STEP',
  // 'VISIBLE',
];

let dude: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, cursors;

class EventScene extends Phaser.Scene {
  constructor() {
    super('event-scene');
  }

  preload() {
    this.load.spritesheet('dude', dudePng, {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    this.events.on('addedtoscene', (gameObject, scene) => {
      console.log(gameObject);
    });
    this.events.on('removedfromscene', (gameObject, scene) => {
      console.log(gameObject);
    });

    this.createAnimations();
    this.setDude();

    this.addAnimationEventsListener();
    this.addCoreEventsListener();

    // add dude keyboard listener
    cursors = this.input.keyboard.createCursorKeys();
    // this.physics.world.on('worldbounds', (...args) => console.log(...args));
    this.scale.on(
      Phaser.Scale.Events.RESIZE,
      (gameSize, baseSize, displaySize, previousWidth, previousHeight) => {
        console.log(displaySize);
      }
    );
  }

  update(time: number, delta: number): void {
    this.addDudeAnimation();
  }

  addAnimationEventsListener() {
    ANIMS_EVENTS.forEach(eventName => {
      dude.on(Phaser.Animations.Events[eventName], (...args) => {
        console.log(eventName, ...args);
      });
    });
  }

  addCoreEventsListener() {
    CORE_EVENTS.forEach(eventName => {
      this.game.events.on(Phaser.Core.Events[eventName], (...args) => {
        console.log(eventName, ...args);
      });
    });
  }

  addDudeAnimation() {
    if (cursors.left.isDown) {
      dude.setVelocityX(-100);
      dude.anims.play('left', true);
    } else if (cursors.right.isDown) {
      dude.setVelocityX(100);
      dude.anims.play('right', true);
    } else {
      dude.setVelocityX(0);
      dude.anims.play('turn');
    }
  }

  createAnimations() {
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 120,
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', {
        start: 5,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  setDude() {
    dude = this.physics.add.sprite(200, 200, 'dude');
    dude.setBounce(0.2);
    dude.setCollideWorldBounds(true);
    dude.body.onWorldBounds = true;
    dude.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, 32, 48),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      draggable: true,
      useHandCursor: true,
    });
    dude.on('dragstart', () => {
      dude.setVelocityY(0);
      dude.body.allowGravity = false;
    });
    dude.on('drag', (_, dragX, dragY) => {
      dude.x = dragX;
      dude.y = dragY;
    });
    dude.on('dragend', () => {
      dude.body.allowGravity = true;
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: WINDOW_WIDTH,
  height: WINDOW_HEIGHT,
  scene: EventScene,
  scale: {
    mode: Phaser.Scale.FIT,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 200,
      },
    },
  },
  audio: {
    disableWebAudio: true,
  },
};

function events() {
  const game = new Phaser.Game(config);
}

export default events;
