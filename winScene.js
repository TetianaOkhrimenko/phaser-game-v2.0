export default class WinScene extends Phaser.Scene {
  constructor() {
    super("WinScene");
  }

  preload() {
    this.load.image("apple", "assets/apple.png");
    this.load.image("backgroundWin", "assets/nebula.jpg");
    this.load.spritesheet("boom", "assets/explosion.png", {
      frameWidth: 64,
      frameHeight: 64,
      endFrame: 23,
    });
    this.load.audio("audio_win", ["audio/winner.mp3"]);
  }

  create() {
    this.w = this.cameras.main.width;
    this.h = this.cameras.main.height;

    this.audioGameWin = this.sound.add("audio_win");
    this.audioGameWin.play();

    this.add.image(this.w / 2, this.h / 2, "backgroundWin");

    this.textMsg = this.add
      .text(this.w / 2, this.h / 2 + 50, "CLICK TO START AGAIN", {
        fontFamily: "Arial Black",
        fontSize: "36px",
        fill: "#eee", //#000,
      })
      .setOrigin(0.5, 0.5);
    this.textMsg.visible = false;

    setTimeout(() => {
      this.textMsg.visible = true;
    }, 400);

    this.add
      .text(this.w / 2, this.h / 2 - 50, "WINNER!", {
        fontFamily: "Luckiest Guy",
        fontSize: 70,
        color: "#eee", //#000,
        shadow: { offsetX: 1, offsetY: 3, stroke: true, fill: true, blur: 0 },
      })
      .setOrigin(0.5, 0.5)
      .setStroke("#fe4e6e", 16);

    const config1 = {
      key: "explode1",
      frames: "boom",
      frameRate: 20,
      repeat: -1,
    };

    const config2 = {
      key: "explode2",
      frames: this.anims.generateFrameNumbers("boom", { start: 0, end: 23 }),
      frameRate: 20,
      repeat: -1,
    };

    this.anims.create(config1);
    this.anims.create(config2);
    this.add.sprite(200, 100, "boom").play("explode1");
    this.add.sprite(400, 100, "boom").play("explode2");
    this.add.sprite(600, 100, "boom").play("explode1");
    this.add.sprite(200, 500, "boom").play("explode1");
    this.add.sprite(400, 500, "boom").play("explode2");
    this.add.sprite(600, 500, "boom").play("explode1");

    this.input.on("pointerdown", (pointer) => {
      this.scene.start("Game");
    });
  }

  update() {}
}
