export default class EndGameScene extends Phaser.Scene {
  constructor() {
    super("EndGameScene");
  }

  movingGround;

  preload() {
    this.load.image("backgroundEnd", "assets/dream_clouds4.png");
    this.load.image("ground", "assets/platform4.png");
    this.load.image("cat", "assets/orange-cat1.png");
    this.load.image("apple", "assets/apple.png");
    this.load.audio("audio_end", ["audio/game-over-arcade-6435.mp3"]);
  }

  create() {
    this.w = this.cameras.main.width;
    this.h = this.cameras.main.height;

    this.add.image(this.w / 2, this.h / 2, "backgroundEnd");

    this.audioGameOver = this.sound.add("audio_end");
    this.audioGameOver.play();

    this.movingGround = this.physics.add
      .image(400, 500, "ground")
      .setScale(1.2)
      .refreshBody();

    this.movingGround.setImmovable(true);
    this.movingGround.body.allowGravity = false;
    this.movingGround.setVelocityX(50);

    const catTom = this.physics.add.sprite(400, 400, "cat");

    this.physics.add.collider(catTom, this.movingGround);

    this.add
      .text(this.w / 2, this.h / 2 - 50, "GAME OVER", {
        fontFamily: "Arial Black",
        fontSize: 70,
        color: "#eee", //#000,
      })
      .setOrigin(0.5, 0.5)
      .setStroke("#fe4e6e", 16);

    this.add
      .text(this.w / 2, this.h / 2 + 50, "CLICK TO START AGAIN", {
        fontFamily: "Oswald",
        fontSize: "36px",
        fill: "#eee", //#000,
      })
      .setOrigin(0.5, 0.5);

    this.input.on("pointerdown", (pointer) => {
      this.scene.start("Game");
    });
  }

  update() {
    if (this.movingGround.x >= 600) {
      this.movingGround.setVelocityX(-50);
    } else if (this.movingGround.x <= 200) {
      this.movingGround.setVelocityX(50);
    }
  }
}
