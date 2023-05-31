//import Phaser from "./phaser.js";
import StartGameScene from "./startGameScene.js";
import GameScene from "./gameScene.js";
import WinScene from "./winScene.js";
import EndGameScene from "./endGameScene.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [StartGameScene, GameScene, WinScene, EndGameScene],
};

const game = new Phaser.Game(config);
