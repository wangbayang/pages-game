import * as Phaser from "phaser";

import { WINDOW_WIDTH, WINDOW_HEIGHT } from "../const";

import skyPng from "../assets/sky3.jpg";
import groundPng from "../assets/platform.png";
import bombPng from "../assets/bomb.png";
import starPng from "../assets/star.png";
import dudePng from "../assets/dude.png";

import qimaMP3 from "../assets/audio/qima.mp3";
import jumpMP3 from "../assets/audio/jump.mp3";
import growUpMP3 from "../assets/audio/growUp.mp3";
import deathMP3 from "../assets/audio/death.mp3";

let score = 0,
  gameOver = false,
  jumpTime = 0,
  clickTime = 0,
  game: Phaser.Game;

class FirstGameScene extends Phaser.Scene {
  declare sound: Phaser.Sound.HTML5AudioSoundManager;
  declare cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  declare platforms: Phaser.Physics.Arcade.StaticGroup;
  declare player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  declare stars: Phaser.Physics.Arcade.Group;
  declare scoreText: Phaser.GameObjects.Text;
  declare bombs: Phaser.Physics.Arcade.Group;

  constructor() {
    super("first-game");
  }

  init() {
    this.sound = new Phaser.Sound.HTML5AudioSoundManager(game);
  }

  preload() {
    this.load.image("sky", skyPng);
    this.load.image("ground", groundPng);
    this.load.image("bomb", bombPng);
    this.load.image("star", starPng);
    this.load.spritesheet("dude", dudePng, {
      frameWidth: 32,
      frameHeight: 48,
    });

    this.load.audio("qima", qimaMP3);
    this.load.audio("jump", jumpMP3, { instances: 5 });
    this.load.audio("growUp", growUpMP3, { instances: 100 });
    this.load.audio("death", deathMP3);
  }

  create() {
    this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, "sky").setDisplaySize(WINDOW_WIDTH, WINDOW_HEIGHT);

    this.platforms = this.physics.add.staticGroup();

    this.createGround(WINDOW_WIDTH / 2, WINDOW_HEIGHT - 32, WINDOW_WIDTH, 40);
    this.createGround(WINDOW_WIDTH / 4, WINDOW_HEIGHT * 0.7, WINDOW_WIDTH / 3);
    this.createGround(WINDOW_WIDTH / 3, WINDOW_HEIGHT * 0.5, WINDOW_WIDTH / 4);
    this.createGround(WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.3, WINDOW_WIDTH / 4);
    this.createGround((WINDOW_WIDTH / 4) * 3, WINDOW_HEIGHT * 0.5, WINDOW_WIDTH / 4);
    this.createGround((WINDOW_WIDTH / 4) * 3, WINDOW_HEIGHT * 0.1, WINDOW_WIDTH / 5);

    this.player = this.physics.add.sprite(50, WINDOW_HEIGHT * 0.8, "dude");
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.platforms, this.player);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", {
        start: 5,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.stars = this.physics.add.group({
      key: "star",
      repeat: 30,
      setXY: {
        x: 12,
        y: 0,
        stepX: WINDOW_WIDTH / 30,
      },
      collideWorldBounds: true,
    });

    this.stars.children.iterate((child: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(this.platforms, this.stars);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

    this.scoreText = this.add.text(16, 16, "score:0", {
      fontSize: "32px",
      color: "yellow",
    });

    this.bombs = this.physics.add.group();
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.player, this.bombs, this.bombHit, undefined, this);

    this.loadSound();
  }

  update() {
    if (gameOver) return;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(500);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-350);
      jumpTime += 1;
      this.sound.play("jump", {
        detune: jumpTime % 3 ? 0 : -1200,
      });
    }
  }

  createGround(x: number, y: number, width = WINDOW_WIDTH, height = 20) {
    this.platforms.create(x, y, "ground").setDisplaySize(width, height).refreshBody();
  }

  loadSound() {
    let qimaSound: Phaser.Sound.HTML5AudioSound;

    this.sound.pauseOnBlur = true;

    this.input.on("pointerdown", () => {
      clickTime += 1;
      if (clickTime === 1) {
        qimaSound = this.sound.add("qima", {
          loop: true,
        });
        this.sound.unlock();
        qimaSound.play();
      }
      qimaSound.setRate(clickTime % 2 ? 1 : 5);
    });
  }

  collectStar(player, star: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
    star.disableBody(true, true);
    this.sound.play("growUp");

    score += 10;
    this.scoreText.setText(`score:${score}`);

    if (this.stars.countActive(true) === 0) {
      this.stars.children.iterate((child: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) => {
        child.enableBody(true, child.x, 0, true, true);
      });

      const x = player.x < WINDOW_WIDTH / 2 ? Phaser.Math.Between(WINDOW_WIDTH / 2, WINDOW_WIDTH) : Phaser.Math.Between(0, WINDOW_WIDTH / 2);
      const bomb = this.bombs.create(x, 16, "bomb");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-500, 500), 200);
    }
  }

  bombHit(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play("turn");
    this.sound.play("death");

    gameOver = true;
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: WINDOW_WIDTH,
  height: WINDOW_HEIGHT,
  parent: "gameroot",
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 200,
      },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: FirstGameScene,
  audio: {
    disableWebAudio: true,
  },
};

function createFirstGame() {
  game = new Phaser.Game(config);
}

function destroyFirstGame() {
  game.destroy(true, false);
}

export { createFirstGame, destroyFirstGame };
