export default class GameScene extends Phaser.Scene {
  platforms;
  apples;
  movingPlatforms;
  cursors;
  block;
  score = 0;
  scoreText;
  lastPlatformPosition;
  goalText;
  goalQuantity = 40;
  gameOverText;
  messageText;
  hud;
  isPlayerFly = false;
  isPlyaerColidePlatform = false;
  worldHeight = 99999;
  context = this;
  gameOver = false;
  colider;
  winText;
  helicopterPlatformArray = [];
  position;

  constructor() {
    super("Game");
  }

  winGame() {
    for (const apple of this.apples.getChildren()) {
      apple.disableBody(true, true);
    }
    for (const platform of this.platforms.getChildren()) {
      platform.disableBody(true, true);
    }
    for (const platform of this.movingPlatforms.getChildren()) {
      platform.disableBody(true, true);
    }
    this.winText.visible = true;
    this.audioAchievedGoal.play();
  }

  preload() {
    this.load.image("background", "assets/dream_clouds4.png");
    this.load.image("clouds", "assets/clouds.png");
    this.load.image("block", "assets/platform4.png");
    this.load.image("ground", "assets/platform4.png");
    this.load.image("platform", "assets/platform5.png");
    this.load.image("cat", "assets/orange-cat1.png");
    this.load.image("apple", "assets/apple.png");

    this.load.audio("audio_jump", [
      "audio/Dafunk - Hardcore Power (We Believe In Goa - Remix).mp3",
    ]);
    this.load.audio("audio_flying", ["audio/flying2.mp3"]);
    this.load.audio("audio_falling", ["audio/falling.wav"]);
    this.load.audio("audio_jumping", ["audio/jumping.wav"]);
    this.load.audio("audio_apple", ["audio/apple.wav"]);
    this.load.audio("audio_goal", ["audio/goal.wav"]);
    this.load.audio("audio_endGame", ["audio/end.wav"]);
  }

  create() {
    this.w = this.cameras.main.width;
    this.h = this.cameras.main.height;

    this.cameraYMin = 99999;
    this.platformYMin = 99999;
    this.appleYMin = 99999;

    this.audioJump = this.sound.add("audio_jump");
    this.audioFlying = this.sound.add("audio_flying");
    this.audioFalling = this.sound.add("audio_falling");
    this.audioJumping = this.sound.add("audio_jumping");
    this.audioOverlayApple = this.sound.add("audio_apple");
    this.audioAchievedGoal = this.sound.add("audio_goal");
    this.audioEndGame = this.sound.add("audio_endGame");

    const container = this.add.container(this.w, this.worldHeight);
    const ts = this.add.tileSprite(
      -(this.w / 2),
      0,
      this.w,
      this.worldHeight,
      "background"
    );
    container.add(ts);

    this.physics.world.checkCollision.up = false;
    this.physics.world.checkCollision.down = false;
    this.physics.world.checkCollision.left = false;
    this.physics.world.checkCollision.right = false;

    this.cameras.main.setBounds(0, 0, 800, this.worldHeight);
    this.physics.world.setBounds(0, 0, 800, this.worldHeight);

    this.clouds = this.physics.add.staticGroup({
      defaultKey: "clouds",
    });

    this.platforms = this.physics.add.group({
      defaultKey: "ground",
    });

    this.apples = this.physics.add.group({
      defaultKey: "apple",
    });

    this.movingPlatforms = this.physics.add.group({
      defaultKey: "platform",
    });

    for (let i = 1; i < 3; i++) {
      this.clouds.create(
        Phaser.Math.RND.between(40, this.w),
        this.cameraYMin - 300 * i
      );
    }

    for (let i = 1; i < 14; i++) {
      this.platforms.create(
        Phaser.Math.RND.between(100, this.w - 100),
        this.cameraYMin - 90 * i
      );
    }

    for (let i = 1; i < 9; i++) {
      this.movingPlatforms.create(
        Phaser.Math.RND.between(20, this.w - 100),
        this.cameraYMin - 150 * i
      );
    }

    let length = this.platforms.getChildren().length;

    this.clouds.getChildren().forEach(function (cloud) {
      cloud.setScale(0.6);
    });

    this.platforms.getChildren().forEach(function (platform, index) {
      platform.body.immovable = true;
      platform.body.moves = false;
      platform.body.velocity.x = 100;

      if (index % 12 === 0 && index !== 0) {
        this.apples.create(platform.x, platform.y - 40);
      }
    }, this);

    for (const platform of this.movingPlatforms.getChildren()) {
      platform.setImmovable(true);
      platform.setVelocityX(100);
      platform.body.allowGravity = false;
      platform.setFriction(0, 1);

      platform.maxDistance = 200;
      platform.previousX = platform.x;
      platform.setOrigin(0.5, 0.5);
    }

    for (const apple of this.apples.getChildren()) {
      apple.body.immovable = true;
      apple.body.moves = false;
    }

    this.block = this.physics.add
      .staticImage(this.w / 2, this.worldHeight - 30, "block")
      .setScale(1.2)
      .refreshBody();

    this.player = this.physics.add.sprite(
      this.w / 2,
      this.worldHeight - 100,
      "cat"
    );

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.player.body.setGravityY(300);
    this.player.previousY = this.player.y;

    this.cameras.main.startFollow(this.player, true, 0, 0.05, 0, 0);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.scoreText = this.add.text(this.w / 2 + 220, 20, "SCORE: 0", {
      fontFamily: "Arial Black",
      fontSize: 24,
      color: "#eee", //#000, //#eee
    });
    this.scoreText.setStroke("#fe4e6e", 6);

    this.goalText = this.add.text(
      this.w / 2 + 50,
      20,
      `GOAL: ${this.goalQuantity}`,
      {
        fontFamily: "Arial Black",
        fontSize: 24,
        color: "#eee", //#000,
      }
    );

    this.goalText.setStroke("#fe4e6e", 6);

    this.messageText = this.add.text(
      this.w / 2,
      this.h / 2,
      "CAT-HELICOPTER MODE 🚁",
      {
        fontFamily: "Arial Black",
        fontSize: 40,
        color: "#eee", //#000,
      }
    );
    this.messageText.setStroke("#fe4e6e", 10);

    this.winText = this.add.text(
      this.w / 2,
      this.h / 2,
      "GOAL IS ACHIEVED!!!💥",
      {
        fontFamily: "Arial Black",
        fontSize: 40,
        color: "#eee",
      }
    );

    this.winText.setStroke("#fe4e6e", 10);

    this.gameOverText = this.add.text(this.w / 2, this.h / 2, "GAME OVER", {
      fontFamily: "Oswald",
      fontSize: "52px",
      fill: "#fe4e6e", //#000,
    });

    this.gameOverText.setOrigin(0.5);
    this.gameOverText.visible = false;
    this.messageText.setOrigin(0.5);
    this.messageText.visible = false;
    this.winText.setOrigin(0.5);
    this.winText.visible = false;

    this.hud = this.add.container(0, 0, [
      this.scoreText,
      this.gameOverText,
      this.goalText,
      this.messageText,
      this.winText,
    ]);

    this.hud.setScrollFactor(0);

    this.colider = this.physics.add.collider(
      this.player,
      this.platforms,
      (player, platform) => {
        if (
          player.body.touching.down &&
          platform.body.touching.up &&
          this.lastPlatformPosition !== platform.y
        ) {
          this.score += 1;
          this.scoreText.setText("SCORE: " + this.score);
          this.lastPlatformPosition = platform.y;
        }
      }
    );

    this.movCollider = this.physics.add.collider(
      this.player,
      this.movingPlatforms
    );

    this.physics.add.collider(this.player, this.block);

    this.physics.add.collider(this.platforms, this.movingPlatforms);

    this.physics.add.overlap(this.player, this.apples, (player, apple) => {
      this.audioOverlayApple.play();
      apple.disableBody(true, true);
      this.isPlayerFly = true;
      this.audioFlying.play({ volume: 2 });
      this.messageText.visible = true;

      this.timer = this.time.addEvent({
        delay: 500,
        callback: () => {
          this.score++;
          this.scoreText.setText("SCORE: " + this.score);
        },
        callbackScope: this,
        loop: true,
      });
    });
  }

  update() {
    this.physics.world.wrap(this.player, 32);

    if (this.isPlayerFly) {
      this.player.setVelocityY(-400);
      this.physics.world.removeCollider(this.colider);
      this.physics.world.removeCollider(this.movCollider);

      for (const apple of this.apples.getChildren()) {
        apple.disableBody(true, true);
      }

      this.flyingTime = setTimeout(() => {
        this.isPlayerFly = false;
        this.messageText.visible = false;
        this.audioFlying.stop();
        this.physics.world.colliders.add(this.colider);
        this.physics.world.colliders.add(this.movCollider);
        if (this.timer) this.timer.remove();
      }, 6000);
    }

    const cam = this.cameras.main;

    this.cameraYMin = Math.min(this.cameraYMin, this.player.y - this.h + 130);
    this.cameras.y = this.cameraYMin;
    console.log("cameraYMin:", this.cameraYMin);
    console.log("player.y:", this.player.y);
    console.log("cameras.y:", this.cameras.y);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-180);
      this.player.anims.play("left", true);
      this.audioJumping.play();
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(180);
      this.player.anims.play("right", true);
      this.audioJumping.play();
    } else if (this.cursors.up.isDown) {
      this.audioJumping.play();
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      //if (cursors.up.isDown && player.body.touching.down)
      this.player.setVelocityY(-500);
    }

    if (this.player.y > this.cameraYMin + this.h + this.h / 2) {
      this.gameOverText.visible = true;
      this.gameOver = true;
    }

    if (this.player.y > this.worldHeight) {
      this.score = 0;
      this.scene.start("EndGameScene");
    } else if (
      this.player.y > this.cameraYMin + 2 * this.h ||
      (this.gameOverText.visible && this.player.body.touching.down)
    ) {
      this.score = 0;
      this.time.delayedCall(
        2500,
        function () {
          this.scene.start("EndGameScene");
        },
        [],
        this
      );
    }

    this.movingPlatforms.getChildren().forEach(function (platform) {
      if (platform.x >= 600) {
        platform.setVelocityX(-100);
      } else if (platform.x <= 100) {
        platform.setVelocityX(100);
      }
    }, this);

    this.clouds.getChildren().forEach(function (cloud) {
      if (cloud.y > this.cameras.y + this.h + 300) {
        cloud.y = this.platformYMin - 100;
      }
    }, this);

    this.platforms.getChildren().forEach(function (platform, index) {
      this.platformYMin = Math.min(this.platformYMin, platform.y);
      if (platform.y > this.cameras.y + this.h + 300) {
        platform.y = this.platformYMin - 100;

        if (index % 12 === 0 && index !== 0) {
          this.apples.create(platform.x, platform.y - 40);
          this.apples.getChildren().forEach(function (apple, index) {
            this.appleYMin = Math.min(this.appleYMin, apple.y);
            if (apple.y > this.cameras.y + this.h) {
              apple.y = this.appleYMin - 100;
              console.log("apple.y:", apple.y);
            }
          }, this);
        }
      }
    }, this);

    for (const apple of this.apples.getChildren()) {
      apple.body.immovable = true;
      apple.body.moves = false;

      if (apple.y > this.cameras.y + this.h + 300) {
        apple.destroy();
      } else if (apple.y < this.player.y && apple.y > this.cameras.y) {
        setTimeout(function () {
          apple.setTintFill(0xfe4e6e);
          apple.setAlpha(0.5);
        }, 5000);

        setTimeout(function () {
          apple.destroy();
        }, 10000);
      }
    }

    this.movingPlatforms.getChildren().forEach(function (platform) {
      if (platform.y > this.cameras.y + this.h + 300) {
        platform.y = this.platformYMin - 100;
      }
    }, this);

    if (this.score === this.goalQuantity) {
      this.messageText.visible = false;
      this.audioFlying.stop();
      if (this.timer) this.timer.remove();
      if (!this.isPlayerFly) this.isPlayerFly = true;
      this.winGame();
      this.score = 0;
      this.time.delayedCall(
        2000,
        function () {
          this.scene.start("WinScene");
        },
        [],
        this
      );
    }
  }
}
