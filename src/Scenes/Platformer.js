class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 500;
        this.DRAG = 2000;    
        this.physics.world.gravity.y = 2000;
        this.JUMP_VELOCITY = -700;
        this.SNAP_ACCEL = 1500;
        this.MAX_VELOCITY_X = 300;

        this.score = 0;
        this.remainingCollectibles = 0;
        this.playerIsDamaged = false;
        this.levelCompleted = false;
        this.uiReady = false;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        this.map = this.make.tilemap({ key: "Luka-Escape" });

        // Add tilesets to the map
        this.tilesetInd = this.map.addTilesetImage("industrial_set", "tilemap_ind_tiles");
        this.tilesetGen = this.map.addTilesetImage("general_set", "tilemap_gen_tiles");
        this.tilesetBgs = this.map.addTilesetImage("background_set", "tilemap_bgs_tiles");
        this.tilesetSpaceship = this.map.addTilesetImage("spaceship_set", "tilemap_spaceship_tiles");
        this.tilesetShipParts = this.map.addTilesetImage("ship_parts_set", "tilemap_ship_parts_tiles");

        // Create layers
        this.bgLayer = this.map.createLayer("Background", [this.tilesetBgs, this.tilesetGen], 0, 0).setDepth(0);
        this.groundLayer = this.map.createLayer("Platforms-n-Props", [this.tilesetGen, this.tilesetInd], 0, 0).setDepth(1);
        this.propsLayer = this.map.createLayer("Tunnel-Props", [this.tilesetGen, this.tilesetInd], 0, 0).setDepth(2);
        this.hazardLayer = this.map.createLayer("Hazards", [this.tilesetInd], 0, 0).setDepth(4);
        this.spaceshipLayer = this.map.createLayer("Spaceship", [this.tilesetSpaceship], 0, 0).setDepth(5);
        this.shipPartsLayer = this.map.createLayer("Ship-Parts", [this.tilesetShipParts], 0, 0).setDepth(6);

        // Make layers collidable and add other properties
        this.groundLayer.setCollisionByProperty({
            collides: true,
        });
        
        this.propsLayer.setCollisionByProperty({
            collides: true
        });

        this.hazardLayer.setCollisionByProperty({
            damages: true
        });

        this.spaceshipLayer.setCollisionByProperty({
            level_completes: true
        });

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // set up player avatar
        this.playerSpawn = { x: 80, y: game.config.height / 2 + 45 };
        my.sprite.player = this.physics.add.sprite(this.playerSpawn.x, this.playerSpawn.y, "platformer_characters", "tile_0000.png").setDepth(3);
        my.sprite.player.setCollideWorldBounds(true);

        // set up camera
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.5, 0.5);

        // enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.propsLayer);
        
        // enable ship part collection and end of level condition functionality
        this.physics.add.overlap(my.sprite.player, this.shipPartsLayer);
        this.physics.add.overlap(my.sprite.player, this.spaceshipLayer, this.checkLevelComplete, null, this);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // Checks remaining ship parts to collect
        this.remainingCollectibles = this.countTotalCollectibles();

        this.levelStartTime = this.time.now;

        // UI
        document.fonts.ready.then(() => {
            this.scoreText = this.add.text(16, 16, `Score: 0`, { fontFamily: 'Tiny5', fontSize: '24px', fill: '#00ff55', stroke: '#000', strokeThickness: 2 }).setScrollFactor(0).setDepth(7);
            this.remainingText = this.add.text(16, 40, `Parts Left: ${this.remainingCollectibles}`, { fontFamily: 'Tiny5', fontSize: '24px', fill: '#00ff55', stroke: '#000', strokeThickness: 2 }).setScrollFactor(0).setDepth(7);
            this.timerText = this.add.text(this.cameras.main.width - 16, 40, `Time: 0.0s`, { fontFamily: 'Tiny5', fontSize: '24px', fill: '#00ff55', stroke: '#000', strokeThickness: 2 }).setOrigin(1).setScrollFactor(0).setDepth(7);
            this.uiReady = true;
        });

        // Footstep dust emitter
        this.dustEmitter = this.add.particles(0, 0, 'dust', {
            speed: { min: -30, max: 30 },
            scale: { start: 0.03, end: 0 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 300,
            frequency: -1,
            quantity: 1,
            follow: my.sprite.player,
            followOffset: { x: 0, y: my.sprite.player.height / 2 },
            on: false
        }).setDepth(7);

        // Pickup effect emitter
        this.pickupEmitter = this.add.particles(0, 0, 'pickup', {
            speed: { min: -50, max: 50 },
            scale: { start: 0, end: 0.1 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 500,
            frequency: -1,
            quantity: 1,
            follow: my.sprite.player,
            followOffset: { x: my.sprite.player.width / 2, y: my.sprite.player.height / 2 },
            on: false
        }).setDepth(7);

        // Acid splash emitter
        this.splashEmitter = this.add.particles(0, 0, 'splash', {
            speed: { min: -50, max: -100 },
            scale: { start: 0.05, end: 0 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 500,
            frequency: -1,
            quantity: 1,
            on: false
        }).setDepth(7);

        // SFX setup
        this.footstepTimer = 0;
        this.footstepInterval = 100;
        this.footstepSound = this.sound.add('footstep');
        this.engineSound = this.sound.add('engine');
        this.pickupSound = this.sound.add('pickup');
        this.toxicSound = this.sound.add('toxic');
        this.hurtSound = this.sound.add('hurt');

        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    update() {
        if (!this.uiReady || this.levelCompleted)
            return;

        const elapsedTime = (this.time.now - this.levelStartTime) / 1000;
        this.timerText.setText(`Time: ${elapsedTime.toFixed(1)}s`);
        
        const currVelX = my.sprite.player.body.velocity.x;
        
        if(cursors.left.isDown) {
            const accel = currVelX > 0 ? -this.SNAP_ACCEL : -this.ACCELERATION;
            my.sprite.player.body.setAccelerationX(accel);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            if (my.sprite.player.body.blocked.down && Math.abs(my.sprite.player.body.velocity.x) > 100) {
                this.dustEmitter.emitParticle(1);
                if (this.time.now - this.footstepTimer > this.footstepInterval) {
                    this.footstepSound.play({ volume: 0.1 });
                    this.footstepTimer = this.time.now;
                }
            }

        } else if(cursors.right.isDown) {
            const accel = currVelX < 0 ? this.SNAP_ACCEL : this.ACCELERATION;
            my.sprite.player.body.setAccelerationX(accel);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            if (my.sprite.player.body.blocked.down && Math.abs(my.sprite.player.body.velocity.x) > 100) {
                this.dustEmitter.emitParticle(1);
                if (this.time.now - this.footstepTimer > this.footstepInterval) {
                    this.footstepSound.play({ volume: 0.1 });
                    this.footstepTimer = this.time.now;
                }
            }

        } else {
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
        }

        // Caps max horizontal velocity
        if (my.sprite.player.body.velocity.x > this.MAX_VELOCITY_X) {
            my.sprite.player.body.setVelocityX(this.MAX_VELOCITY_X);
        } else if (my.sprite.player.body.velocity.x < -this.MAX_VELOCITY_X) {
            my.sprite.player.body.setVelocityX(-this.MAX_VELOCITY_X);
        }

        // player jump
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            this.dustEmitter.emitParticle(5);
            this.footstepSound.play({ volume: 0.2 });
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }

        // Damage check
        let playerTile = this.hazardLayer.getTileAtWorldXY(my.sprite.player.x, my.sprite.player.y + my.sprite.player.height / 2);
        if (playerTile && playerTile.properties.damages && !this.playerIsDamaged) {
            this.handleToxicDamage();
        }

        // Pickup check
        this.shipPartsLayer.forEachTile(tile => {
            if (tile && tile.properties.collectible) {
                let worldX = tile.getCenterX();
                let worldY = tile.getCenterY();
                let dist = Phaser.Math.Distance.Between(my.sprite.player.x, my.sprite.player.y, worldX, worldY);

                if (dist < 20) {
                    this.pickupSound.play({ volume: 0.5 });
                    this.collectShipPart(tile);
                }
            }
        });
    }

    checkLevelComplete(player, tile) {
        if (this.remainingCollectibles <= 0 && tile.properties.level_completes && !this.levelCompleted) {
            this.levelCompleted = true;
            this.physics.pause();
            this.engineSound.play({ volume: 0.5 });
            my.sprite.player.setTint(0x00ff00);

            const centerX = this.cameras.main.centerX;
            const centerY = this.cameras.main.centerY;

            const completionTime = (this.time.now - this.levelStartTime) / 1000;
            const bonus = Math.max(0, Math.floor(10000 - completionTime * 50));
            const finalScore = this.score + bonus;

            this.remainingText.setVisible(false);
            this.timerText.setVisible(false);
            this.scoreText.setVisible(false);
            const completeMsg = this.add.text(centerX, centerY - 60, 'LEVEL COMPLETE', { fontFamily: 'Tiny5', fontSize: '32px', fill: '#00ff55', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5).setScrollFactor(0).setDepth(7);
            const timeMsg = this.add.text(centerX, centerY - 30, `Time: ${completionTime.toFixed(1)}s`, { fontFamily: 'Tiny5', fontSize: '24px', fill: '#00ff55', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5).setScrollFactor(0).setDepth(7);
            const bonusMsg = this.add.text(centerX, centerY, `Bonus: +${bonus} pts`, { fontFamily: 'Tiny5', fontSize: '24px', fill: '#00ff55', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5).setScrollFactor(0).setDepth(7);
            const finalScoreMsg = this.add.text(centerX, centerY + 30, `Final Score: ${finalScore}`, { fontFamily: 'Tiny5', fontSize: '24px', fill: '#00ff55', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5).setScrollFactor(0).setDepth(7);
            const restartMsg = this.add.text(centerX, centerY + 60, 'Press R to Restart', { fontFamily: 'Tiny5', fontSize: '24px', fill: '#00ff55', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5).setScrollFactor(0).setDepth(7);

            this.scoreText.setText(`Score: ${this.score}`);

            this.input.keyboard.once('keydown-R', () => {
                this.cameras.main.fadeOut(1000, 0, 0, 0);
                this.time.delayedCall(1000, () => {
                    this.scene.restart();
                });
            });
        }
    }

    handleToxicDamage() {
        if (this.playerIsDamaged) return;
    
        this.playerIsDamaged = true;
        this.toxicSound.play({ volume: 0.5 });
        this.hurtSound.play({ volume: 0.5 });
        this.splashEmitter.explode(20, my.sprite.player.x + my.sprite.player.width / 2, my.sprite.player.y);
        
        this.cameras.main.shake(200, 0.01);
        this.cameras.main.fadeOut(200, 0, 0, 0);
        my.sprite.player.setTint(0xff0000);
    
        this.time.delayedCall(200, () => {
            my.sprite.player.clearTint();
            my.sprite.player.setPosition(this.playerSpawn.x, this.playerSpawn.y);
            this.cameras.main.fadeIn(1000, 0, 0, 0);
            this.playerIsDamaged = false;
        });
    }

    countTotalCollectibles() {
        let count = 0;
        this.shipPartsLayer.forEachTile(tile => {
            if (tile && tile.properties.collectible)
                count++;
        });
        return count;
    }

    collectShipPart(tile) {
        if (tile && tile.properties.collectible) {
            this.shipPartsLayer.removeTileAt(tile.x, tile.y);
            this.pickupEmitter.explode(10);
            this.score += 500;
            this.remainingCollectibles--;

            this.scoreText.setText(`Score: ${this.score}`);
            if (this.remainingCollectibles > 0) {
                this.remainingText.setText(`Parts Left: ${this.remainingCollectibles}`);
            } else {
                this.remainingText.setText(`Find the Spacecraft`);
            }
        }
        return false;
    }
}