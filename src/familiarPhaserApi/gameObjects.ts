import Phaser from "phaser";
import { WINDOW_WIDTH, WINDOW_HEIGHT } from "../const";

import qimaMP3 from "../assets/audio/qima.mp3";

const gameOptions = {
    groundThickness: 30,
    groundColor: 0xffff00,
    rectWidth: 20,
    rectHeight: 100,
    rectThickness: 2,
    rectBorderColor: 0xff0000,
    rectFillColor: 0x00ff00,
    playerRadius: 30,
    playerFillColor: 0xffffff,
    collideFillColor: 0xff0000,
  },
  rectCount = 10;

let game: Phaser.Game,
  clickTime = 0;

class GameObjectScene extends Phaser.Scene {
  declare sound: Phaser.Sound.HTML5AudioSoundManager;
  declare graphicsTool: Phaser.GameObjects.Graphics;
  declare rects: Phaser.Physics.Arcade.Group;
  declare player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  declare ground: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  declare cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  declare gameWidth: number;
  declare gameHeight: number;

  constructor() {
    super("gameobject-scene");
  }

  init() {
    this.sound = new Phaser.Sound.HTML5AudioSoundManager(game);
    this.graphicsTool = new Phaser.GameObjects.Graphics(this);
    this.gameWidth = Number(game.config.width);
    this.gameHeight = Number(game.config.height);
  }

  preload() {
    this.load.audio("qima", qimaMP3);
  }

  create() {
    this.loadSound();
    this.registerGround();
    this.showGround();
    this.registerRect();
    this.generateRects();
    this.registerPlayer();
    this.showPlayer();
    this.registerPlayerCursors();
    this.registerGameObjectCollide();
  }

  update() {
    this.controlPlayer();
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
        return;
      }

      if (clickTime % 2) {
        qimaSound.resume();
      } else {
        qimaSound.pause();
      }
    });
  }

  registerGround() {
    const { groundColor, groundThickness } = gameOptions;

    this.graphicsTool.fillStyle(groundColor);
    this.graphicsTool.fillRect(0, 0, this.gameWidth, groundThickness);
    this.graphicsTool.generateTexture("ground", this.gameWidth, groundThickness);
    this.graphicsTool.clear();
  }

  showGround() {
    const { groundThickness } = gameOptions;

    this.ground = this.physics.add.sprite(this.gameWidth / 2, this.gameHeight - groundThickness / 2, "ground");
    this.ground.setCollideWorldBounds(true);
  }

  registerRect() {
    const { rectThickness, rectBorderColor, rectWidth, rectHeight, rectFillColor } = gameOptions;
    const actualWidth = 2 * rectThickness + rectWidth;
    const actualHeight = 2 * rectThickness + rectHeight;

    this.graphicsTool.lineStyle(rectThickness, rectBorderColor);
    this.graphicsTool.fillStyle(rectFillColor);
    this.graphicsTool.strokeRect(0, 0, actualWidth, actualHeight);
    this.graphicsTool.fillRect(rectThickness, rectThickness, rectWidth, rectHeight);
    this.graphicsTool.generateTexture("rect", actualWidth, actualHeight);
    this.graphicsTool.clear();
  }

  generateRects() {
    const { rectThickness, rectWidth, rectHeight } = gameOptions;
    const actualWidth = 2 * rectThickness + rectWidth;
    const actualHeight = 2 * rectThickness + rectHeight;

    this.rects = this.physics.add.group({
      key: "rect",
      quantity: rectCount,
      setXY: {
        x: actualWidth / 2 + 10,
        y: actualHeight / 2 + 10,
        stepX: this.gameWidth / rectCount,
      },
      collideWorldBounds: true,
    });

    this.rects.children.iterate((child: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
      child.setBounce(Phaser.Math.FloatBetween(0.4, 0.8));
      child.setGravityY(Phaser.Math.Between(100, 200));
      child.setVelocityX(Phaser.Math.Between(-160, 160));
    });
  }

  registerPlayer() {
    const { playerRadius, playerFillColor } = gameOptions;

    this.graphicsTool.fillStyle(playerFillColor);
    this.graphicsTool.fillCircle(playerRadius, playerRadius, playerRadius);
    this.graphicsTool.generateTexture("player", 2 * playerRadius, 2 * playerRadius);
    this.graphicsTool.clear();
  }

  showPlayer() {
    const { playerRadius } = gameOptions;

    this.player = this.physics.add.sprite(playerRadius + 10, this.gameHeight / 2, "player");

    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);
    this.player.body.setMaxVelocityX(300);
    this.player.body.isCircle = true;
  }

  handlePlayerCollide(player, rect: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    const { collideFillColor } = gameOptions;

    player.setTint(collideFillColor);
    rect.setTint(collideFillColor);
  }

  registerPlayerCursors() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  controlPlayer() {
    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-260);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(260);
    } else {
      this.player.setAccelerationX(0);
      this.player.setDragX(200);
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-360);
    }
  }

  registerGameObjectCollide() {
    this.physics.add.collider(this.rects, this.ground);
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.rects, this.rects);
    this.physics.add.collider(this.rects, this.player, this.handlePlayerCollide, null, this);
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: WINDOW_WIDTH,
  height: WINDOW_HEIGHT,
  backgroundColor: 0x00ffff,
  parent: "gameroot",
  scene: GameObjectScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  physics: {
    default: "arcade",
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

function gameObjects() {
  game = new Phaser.Game(config);
}

function destroyGameObjects() {
  game.destroy(true, false);
}

export { gameObjects, destroyGameObjects };
