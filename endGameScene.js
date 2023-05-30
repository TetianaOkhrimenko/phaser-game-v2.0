export default class EndGameScene extends Phaser.Scene {
  constructor() {
    super("EndGameScene");
  }

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

    this.add
      .text(this.w / 2, this.h / 2 - 100, "GAME OVER", {
        fontFamily: "Oswald",
        fontSize: "50px",
        fill: "#eee", //#000,
      })
      .setOrigin(0.5, 0.5);

    this.add
      .text(this.w / 2, this.h / 2, "CLICK TO START AGAIN", {
        fontFamily: "Oswald",
        fontSize: "36px",
        fill: "#eee", //#000,
      })
      .setOrigin(0.5, 0.5);

    this.input.on("pointerdown", (pointer) => {
      this.scene.start("Game");
    });
  }

  update() {}
}
