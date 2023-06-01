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
  goalQuantity = 30;
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

  constructor() {
    super("Game");
  }

  preload() {
    this.load.image("background", "assets/dream_clouds4.png");
    this.load.image("clouds", "assets/clouds.png");
    this.load.image("block", "assets/platform4.png");
    this.load.image("ground", "assets/platform4.png");
    this.load.image("platform", "assets/platform5.png");
    this.load.image("cat", "assets/orange-cat1.png");
    this.load.image("apple", "assets/apple.png");
    //this.load.audio("ding", ["audio/music.mp3"]);
    //this.load.audio("flying", ["audio/flying.mp3"]);

    this.load.audio("audio_jump", [
      "audio/Dafunk - Hardcore Power (We Believe In Goa - Remix).mp3",
    ]);
    this.load.audio("audio_flying", ["audio/flying2.mp3"]);
    this.load.audio("audio_falling", ["audio/falling.wav"]);
    this.load.audio("audio_jumping", ["audio/jumping.wav"]);
    this.load.audio("audio_apple", ["audio/apple.wav"]);
  }

  create() {
    // let me = this;

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

    /* const musicConfig = {
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: false,
      delay: 0,
    };*/

    //this.audioJump.play(musicConfig);

    //this.music.play(musicConfig);

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
      cloud.setScale(0.8);
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
      //platform.body.immovable = true;

      platform.setImmovable(true);
      platform.setVelocityX(100);

      // platform.setVelocity(100, 0);
      platform.body.allowGravity = false;
      platform.setFriction(0, 1);

      platform.maxDistance = 200;
      platform.previousX = platform.x;
      platform.setOrigin(0.5, 0.5);

      /*this.tweens.add({
           targets: platform,
           x: 400,
           duration: 2000,
           ease: "Sine.easeInOut",
           repeat: -1,
           yoyo: true,
         });*/
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
      // "PRESS UP TO FLY",
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
      "YOU'VE ACHIEVED YOUR GOAL!!!💥",
      {
        fontFamily: "Oswald",
        fontSize: "36px",
        fill: "#fe4e6e",
      }
    );

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
    //lock it to the camera
    this.hud.setScrollFactor(0);

    //scoreText.fixedToCamera = true;

    this.colider = this.physics.add.collider(
      this.player,
      this.platforms,
      (player, platform) => {
        /* if (player.body.touching.down && platform.body.touching.up) {
      score += 1;
      scoreText.setText("Score: " + score);
    }*/

        if (
          player.body.touching.down &&
          platform.body.touching.up &&
          this.lastPlatformPosition !== platform.y
        ) {
          this.score += 1;
          this.scoreText.setText("SCORE: " + this.score);
          this.lastPlatformPosition = platform.y;

          if (this.score === this.goalQuantity) {
            this.isPlayerFly = true;
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
            this.score = 0;

            setTimeout(() => {
              this.scene.start("WinScene");
            }, 4000);
            //this.scene.start("WinScene");
          }
        }
      }
    );

    this.movCollider = this.physics.add.collider(
      this.player,
      this.movingPlatforms
    );

    /* this.movCollider = this.physics.add.collider(
      this.player,
      this.movingPlatforms,
      (player, platform) => {
        this.isPlyaerColidePlatform = true;
        if (player.body.touching.down && platform.body.touching.up) {
          // score += 1;
          //scoreText.setText("Score: " + score);
          player.setVelocity(-100, 0);
          //player.body.immovable = true;
        }
      }
    );*/

    this.physics.add.collider(this.player, this.block);

    this.physics.add.collider(this.platforms, this.movingPlatforms);

    this.physics.add.overlap(this.player, this.apples, (player, apple) => {
      this.audioOverlayApple.play();
      //apple.destroy();
      apple.disableBody(true, true);
      this.isPlayerFly = true;
      this.audioFlying.play({ volume: 2 });
      this.messageText.visible = true;
    });

    //this.physics.add.collider(player, platforms, (player, platform) => {
    //platform.body.moves = true;
    // platform.body.checkCollision.none = true;
    //});
  }

  update() {
    // let m = this;

    this.physics.world.wrap(this.player, 32);

    if (this.isPlayerFly) {
      //this.messageText.visible = true;
    }

    //    if (this.cursors.up.isDown && this.isPlayerFly)
    if (this.isPlayerFly) {
      this.player.setVelocityY(-400);
      //this.audioJump.stop();
      //this.audioFlying.play({ volume: 3 });
      this.physics.world.removeCollider(this.colider);
      this.physics.world.removeCollider(this.movCollider);

      for (const apple of this.apples.getChildren()) {
        apple.disableBody(true, true);
      }

      ///???? How to count platform when cat is flying up. Code below doesn't work
      this.platforms.getChildren().forEach((platform, index) => {
        if (this.player.y === platform.y) {
          this.score += 1;
          this.scoreText.setText("SCORE: " + this.score);
        }
      });

      //

      // this.physics.world.colliders.destroy(this.collider);

      // isPlyaerColidePlatform = false;
      //player.body.touching = false;

      setTimeout(() => {
        this.isPlayerFly = false;
        this.messageText.visible = false;
        this.audioFlying.stop();
        this.physics.world.colliders.add(this.colider);
        this.physics.world.colliders.add(this.movCollider);
      }, 6000);

      /*this.time.delayedCall(
        6000,
        function () {
          this.isPlayerFly = false;
          this.messageText.visible = false;
          this.audioFlying.stop();
          //this.audioJump.play(this.musicConfig);

          //this.player.setBounce(0.6);
        },
        [],
        this
      );*/
    }

    // if (this.physics.collider(this.player, this.platforms)) {
    //  touchPlatform();
    //}
    //const { scrollX, scrollY } = this.cameras.main;
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

      //this.cameras.main.shake(500);
    }

    if (this.gameOver) {
      //this.audioFlying.stop();
      //this.audioJump.stop();
      //this.audioFalling.play(this.musicConfig);
    }

    //if (player.y > this.cameraYMin + this.h && player.alive) {

    // if (player.y > this.cameraYMin + this.h + 300) {

    if (this.player.y > this.worldHeight) {
      this.scene.start("EndGameScene");
    } else if (
      this.player.y > this.cameraYMin + 2 * this.h ||
      (this.gameOverText.visible && this.player.body.touching.down)
    ) {
      //physics.pause();
      //this.cameras.main.fade(250);
      // this.cameras.main.shake(500);
      this.score = 0;
      setTimeout(() => {
        this.scene.start("EndGameScene");
      }, 2000);

      /*this.time.delayedCall(
        1000,
        function () {
          //this.scene.restart();
          this.score = 0;
          this.scene.start("EndGameScene");
        },
        [],
        this
      );*/
    }

    //this.physics.add.collider(player, platforms, touchPlatform, null, this);

    this.movingPlatforms.getChildren().forEach(function (platform) {
      //check if it's time for them to turn around

      //if (Math.abs(platform.x - platform.previousX) >= platform.maxDistance) {
      //switchDirection(platform);
      //}

      if (platform.x >= 600) {
        platform.setVelocityX(-100);
      } else if (platform.x <= 100) {
        platform.setVelocityX(100);
      }
    }, this);

    this.clouds.getChildren().forEach(function (cloud) {
      //this.platformYMin = Math.min(this.platformYMin, platform.y);
      if (cloud.y > this.cameras.y + this.h + 300) {
        //platform.destroy();
        cloud.y = this.platformYMin - 100;
      }
    }, this);

    this.platforms.getChildren().forEach(function (platform, index) {
      this.platformYMin = Math.min(this.platformYMin, platform.y);
      if (platform.y > this.cameras.y + this.h + 300) {
        //platform.destroy();
        platform.y = this.platformYMin - 100;

        if (index % 12 === 0 && index !== 0) {
          // this.apples.getChildren().forEach(function (apple, index) {
          //   apple.y = platform.y - 40;
          //   apple.x = platform.x;
          //});

          this.apples.create(platform.x, platform.y - 40);
        }

        /* this.apples.getChildren().forEach(function (apple, index) {
          apple.x = platform.x;
          apple.y = platform.y - 40;
        }, this);*/
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

    /* this.apples.getChildren().forEach(function (apple, index) {
      this.platformYMin = Math.min(this.platformYMin, apple.y);
      if (apple.y > this.cameras.y + this.h + 300) {
        apple.y = this.platformYMin - 100;
      }
    }, this);*/

    this.movingPlatforms.getChildren().forEach(function (platform) {
      //this.platformYMin = Math.min(this.platformYMin, platform.y);
      if (platform.y > this.cameras.y + this.h + 300) {
        //platform.destroy();
        platform.y = this.platformYMin - 100;
      }
    }, this);
  }
}
