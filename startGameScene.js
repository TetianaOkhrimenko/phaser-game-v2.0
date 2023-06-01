export default class StartGameScene extends Phaser.Scene {
  constructor() {
    super("StartGameScene");
  }

  preload() {
    this.load.image("backgroundStart", "assets/background.png");
    //this.load.image("earth", "assets/platform4.png");
    this.load.image("ground", "assets/platform4.png");
    this.load.image("cat", "assets/orange-cat1.png");
    this.load.image("apple", "assets/apple.png");
    this.load.audio("audio_start", ["audio/start.mp3"]);
  }

  create() {
    this.w = this.cameras.main.width;
    this.h = this.cameras.main.height;

    this.add.image(this.w / 2, this.h / 2, "backgroundStart");

    this.audioStart = this.sound.add("audio_start");
    this.audioStart.play();

    const earth = this.physics.add
      .image(400, 200, "ground")
      .setScale(1.2)
      .refreshBody();

    earth.body.allowGravity = false;
    earth.body.immovable = true;
    earth.body.moves = false;

    const playerCat = this.physics.add.image(400, 100, "cat");

    this.tweens.add({
      targets: earth,
      y: 400,
      duration: 2000,
      ease: "Sine.easeInOut",
      repeat: -1,
      yoyo: true,
    });

    this.physics.add.collider(playerCat, earth);

    //const apple = this.physics.add.image(150, 200, "apple");
    const apples = this.physics.add.group({
      defaultKey: "apple",
    });

    apples.create(150, 100);
    apples.create(350, 250);
    apples.create(500, 450);
    apples.create(600, 143);
    apples.create(150, 500);
    apples.create(750, 300);

    for (const apple of apples.getChildren()) {
      apple.body.allowGravity = false;
      apple.body.immovable = true;
      apple.body.moves = false;
    }

    this.add
      .text(this.w / 2, this.h / 2 - 100, "CAT JUMP GAME", {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#eee", // "#347474", //#eee,
      })
      .setOrigin(0.5, 0.5)
      .setStroke("#347474", 16);

    this.add
      .text(this.w / 2, this.h / 2, "CLICK TO START", {
        fontFamily: "Oswald",
        fontSize: "40px",
        fill: "#347474", //#eee, //#000
      })
      .setOrigin(0.5, 0.5);

    this.input.on("pointerdown", (pointer) => {
      this.scene.start("Game");
    });
  }

  update() {}
}
