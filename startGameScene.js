export default class StartGameScene extends Phaser.Scene {
  constructor() {
    super("StartGameScene");
  }

  apples;

  preload() {
    this.load.audio("audio_start", ["audio/start.mp3"]);
    this.load.image("backgroundStart", "assets/background.png");
    //this.load.image("earth", "assets/platform4.png");
    this.load.image("ground", "assets/platform4.png");
    this.load.image("cat", "assets/orange-cat1.png");
    this.load.image("apple", "assets/apple.png");
  }

  create() {
    this.w = this.cameras.main.width;
    this.h = this.cameras.main.height;
    this.audioStart = this.sound.add("audio_start");

    this.audioStart.play();
    // this.sound.pauseOnBlur = true;

    this.add.image(this.w / 2, this.h / 2, "backgroundStart");

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
    this.apples = this.physics.add.group({
      defaultKey: "apple",
    });

    this.apples.create(150, 100);
    this.apples.create(350, 250);
    this.apples.create(500, 450);
    this.apples.create(600, 143);
    this.apples.create(150, 500);
    this.apples.create(750, 300);

    for (const apple of this.apples.getChildren()) {
      apple.body.allowGravity = false;
      apple.body.immovable = true;
      apple.body.moves = false;
    }

    for (const apple of this.apples.getChildren()) {
      //apple.angle += 2;
      const applesTween = this.tweens.add({
        targets: apple,
        angle: { from: 60, to: -60 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
      setTimeout(() => {
        applesTween.stop();
        //applesTween.updateTo("repeat", 2, true);
        // applesTween.restart();
      }, 7000);
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
      // this.audioStart.stop();
      this.scene.start("Game");
    });
  }

  update() {}
}
