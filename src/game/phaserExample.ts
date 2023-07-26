import * as Phaser from 'phaser';

import { WINDOW_WIDTH, WINDOW_HEIGHT } from '../const';

import skyPng from '../assets/space3.png';
import logoPng from '../assets/phaser3-logo.png';
import redPng from '../assets/red.png';

function preload() {
  const currentScene: Phaser.Scene = this;
  const { load } = currentScene;

  load.image('sky', skyPng);
  load.image('logo', logoPng);
  load.image('red', redPng);
}

function create() {
  const currentScene: Phaser.Scene = this;
  currentScene.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'sky');

  const particles = currentScene.add.particles('red');
  const emitter = particles.createEmitter({
    speed: 100,
    scale: {
      start: 1,
      end: 0,
    },
    blendMode: 'ADD',
  });

  const logo = currentScene.physics.add.image(WINDOW_WIDTH / 2, 100, 'logo');

  logo.setBounce(1, 1);
  logo.setVelocity(WINDOW_WIDTH / 4, WINDOW_HEIGHT / 4);
  logo.setCollideWorldBounds(true);

  emitter.startFollow(logo);
}

function createExample() {
  const config: Phaser.Types.Core.GameConfig = {
    title: 'title',
    url: 'url',
    version: '1.0.0',
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 200 },
      },
    },
    scene: {
      preload,
      create,
    },
  };

  const game = new Phaser.Game(config);
}

export default createExample;
