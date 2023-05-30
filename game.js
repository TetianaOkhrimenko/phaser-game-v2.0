class GameScene extends Phaser.Scene {
  platforms;
  apples;
  movingPlatforms;
  cursors;
  block;
  score = 0;
  scoreText;
  lastPlatformPosition;
  goalText;
  goalQuantity = 20;
  gameOverText;
  messageText;
  hud;
  isPlayerFly = false;
  isPlyaerColidePlatform = false;
  worldHeight = 99999;
  context = this;
  gameOver = false;
  colider;

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
    this.load.audio("audio_flying", ["audio/flying.mp3"]);
    this.load.audio("audio_falling", ["audio/falling.wav"]);
    this.load.audio("audio_jumping", ["audio/jumping.wav"]);
  }

  create() {
    let me = this;

    this.w = this.cameras.main.width;
    this.h = this.cameras.main.height;

    this.cameraYMin = 99999;
    this.platformYMin = 99999;
    this.appleYMin = 99999;

    this.audioJump = this.sound.add("audio_jump");
    this.audioFlying = this.sound.add("audio_flying");
    this.audioFalling = this.sound.add("audio_falling");
    this.audioJumping = this.sound.add("audio_jumping");

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

    for (let i = 1; i < 9; i++) {
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

      if (index % 7 === 0 && index !== 0) {
        this.apples.create(platform.x, platform.y - 40);
      }
    }, this);

    for (const platform of this.movingPlatforms.getChildren()) {
      platform.body.immovable = true;

      platform.setVelocity(100, 0);
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

    this.scoreText = this.add.text(this.w / 2 + 250, 20, "SCORE: 0", {
      fontFamily: "Oswald",
      fontSize: "28px",
      fill: "#fe4e6e", //#000, //#eee
    });

    this.goalText = this.add.text(
      this.w / 2 + 50,
      20,
      `GOAL: ${this.goalQuantity}`,
      {
        fontFamily: "Oswald",
        fontSize: "28px",
        fill: "#fe4e6e", //#000,
      }
    );

    this.messageText = this.add.text(
      this.w / 2,
      this.h / 2,
      "PRESS UP TO FLY",
      {
        fontFamily: "Oswald",
        fontSize: "42px",
        fill: "#fe4e6e", //#000,
      }
    );

    this.gameOverText = this.add.text(this.w / 2, this.h / 2, "GAME OVER", {
      fontFamily: "Oswald",
      fontSize: "42px",
      fill: "#fe4e6e", //#000,
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.visible = false;
    this.messageText.setOrigin(0.5);
    this.messageText.visible = false;

    this.hud = this.add.container(0, 0, [
      this.scoreText,
      this.gameOverText,
      this.goalText,
      this.messageText,
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
          me.lastPlatformPosition !== platform.y
        ) {
          this.score += 1;
          this.scoreText.setText("SCORE: " + this.score);
          me.lastPlatformPosition = platform.y;

          if (this.score === this.goalQuantity) {
            this.score = 0;
            this.scene.start("WinScene");
          }
        }
      }
    );

    this.physics.add.collider(
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
    );

    this.physics.add.collider(this.player, this.block);

    this.physics.add.collider(this.platforms, this.movingPlatforms);

    this.physics.add.overlap(this.player, this.apples, (player, apple) => {
      //apple.destroy();
      apple.disableBody(true, true);
      this.isPlayerFly = true;
    });

    //this.physics.add.collider(player, platforms, (player, platform) => {
    //platform.body.moves = true;
    // platform.body.checkCollision.none = true;
    //});
  }

  update() {
    let m = this;

    this.physics.world.wrap(this.player, 32);

    if (this.isPlayerFly) {
      this.messageText.visible = true;
    }

    if (this.cursors.up.isDown && this.isPlayerFly) {
      this.player.setVelocityY(-400);
      //this.audioJump.stop();
      this.audioFlying.play({ volume: 3 });
      this.physics.world.removeCollider(this.colider);

      ///???? How to count platform when cat is flying up. Code below doesn't work
      this.platforms.getChildren().forEach(function (platform, index) {
        if (m.player.y === platform.y) {
          m.score += 1;
          m.scoreText.setText("SCORE: " + m.score);
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
    if (
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

        if (index % 7 === 0 && index !== 0) {
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
      }
    }

    /*this.apples.getChildren().forEach(function (apple, index) {
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

class StartGameScene extends Phaser.Scene {
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

    apples.create(150, 200);
    apples.create(350, 250);
    apples.create(500, 450);
    apples.create(600, 150);
    apples.create(150, 500);
    apples.create(750, 300);

    for (const apple of apples.getChildren()) {
      apple.body.allowGravity = false;
      apple.body.immovable = true;
      apple.body.moves = false;
    }

    this.add
      .text(this.w / 2, this.h / 2 - 100, "CAT JUMP GAME", {
        fontFamily: "Oswald",
        fontSize: "42px",
        fill: "#347474", //#eee,
      })
      .setOrigin(0.5, 0.5);

    this.add
      .text(this.w / 2, this.h / 2, "CLICK TO START", {
        fontFamily: "Oswald",
        fontSize: "42px",
        fill: "#347474", //#eee, //#000
      })
      .setOrigin(0.5, 0.5);

    this.input.on("pointerdown", (pointer) => {
      this.scene.start("Game");
    });
  }

  update() {}
}

class EndGameScene extends Phaser.Scene {
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

class WinScene extends Phaser.Scene {
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

    this.add
      .text(400, 300, "WINNER!", {
        fontFamily: "Oswald",
        fontSize: "50px",
        fill: "#fe4e6e", //#000,
      })
      .setOrigin(0.5, 0.5);

    //const apple = this.physics.add.image(150, 200, "apple");
    //apple.body.allowGravity = false;
    //apple.body.immovable = true;
    //apple.body.moves = false;

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
  scene: [StartGameScene, GameScene, EndGameScene, WinScene],
};

const game = new Phaser.Game(config);
