import Player from '../Objects/Player.js';
import ShooterEnemy from '../Objects/ShooterEnemy.js';
import BrawlerEnemy from '../Objects/BrawlerEnemy.js';
import BomberEnemy from '../Objects/BomberEnemy.js';
import Grenade from '../Objects/Grenade.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.add.image(400, 300, 'background').setDepth(-1);

        this.registry.set('score', 0);
        this.registry.set('health', 3);
        this.registry.set('hasShotgun', false);
        this.registry.set('hasGrenadeLauncher', false);

        this.health = this.registry.get('health');
        this.score = this.registry.get('score');
        this.wave = this.wave || 1;
        this.needToSpawnWave = false;
        
        this.waveTimerPoints = 1000;
        this.waveTimerDecayRate = 0.1;
        this.minWaveBonus = 250;

        // Creating physics groups
        this.bullets = this.physics.add.group();
        this.playerGrenades = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.enemyProjectiles = this.physics.add.group();
        this.coverBoxes = this.physics.add.staticGroup();

        // Used for post-hit brief invincibility
        this.isInvincible = false;

        // Setting up player
        this.player = new Player(this, 300, this.bullets, this.playerGrenades);
        this.add.existing(this.player);

        // Initializing keys
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            shoot: Phaser.Input.Keyboard.KeyCodes.E,
            melee: Phaser.Input.Keyboard.KeyCodes.Q
        });

        // Placing cover boxes
        this.coverBoxes.create(150, 100, 'box').setScale(0.5, 1.0).refreshBody();
        this.coverBoxes.create(150, 275, 'box').setScale(0.5, 1.0).refreshBody();
        this.coverBoxes.create(150, 500, 'box').setScale(0.5, 1.0).refreshBody();

        // Setting up melee arc
        this.meleeArc = this.add.circle(this.player.x, this.player.y, 80, 0xffffff, 0.2);
        this.physics.add.existing(this.meleeArc);
        this.meleeArc.body.setAllowGravity(false);
        this.meleeArc.body.setCircle(80);
        this.meleeArc.setVisible(false);

        // Setting up registry
        this.registry.set('score', this.registry.get('score') || 0);
        this.registry.set('health', this.registry.get('health') || 3);
        this.wave = 1;
        this.waveInProgress = false;
        this.maxWaves = 5;
        this.enemiesLeft = 0;
        this.spawnedEnemies = 0;

        // Handling collisions
        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
            if (!bullet.active || !enemy.active)
                return;
            bullet.destroy();
            enemy.takeDamage();
        });

        this.physics.add.overlap(this.bullets, this.enemyProjectiles, (bullet, proj) => {
            if (!bullet.active || !proj.active)
                return;
            if (proj instanceof Grenade) {
                bullet.destroy();
                proj.source = 'player';
                proj.explode();
            }
        });

        this.physics.add.overlap(this.playerGrenades, this.enemies, (grenade, enemy) => {
            if (!grenade.active || !enemy.active)
                return;
            grenade.explode();
            enemy.takeDamage();
        });

        this.physics.add.overlap(this.playerGrenades, this.enemyProjectiles, (grenade, proj) => {
            if (!grenade.active || !proj.active)
                return;
            if (proj instanceof Grenade) {
                grenade.explode();
                proj.source = 'player';
                proj.explode();
            }
        });

        this.physics.add.overlap(this.player, this.enemyProjectiles, (player, proj) => {
            if (!proj.active || !player.active)
                return;
            if (proj instanceof Grenade) {
                proj.explode();
            } else {
                proj.destroy();
            }
            this.playerTakeDamage();
        });

        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            if (!player.active || !enemy.active || !enemy.body) return;
        
            if (enemy instanceof BrawlerEnemy) {
                this.playerTakeDamage();
            }
        });

        this.physics.add.overlap(this.enemyProjectiles, this.coverBoxes, (proj, box) => {
            if (proj instanceof Grenade) {
                proj.explode();
            } else {
                proj.destroy();
            }
        });

        this.physics.add.overlap(this.bullets, this.coverBoxes, (proj) => {
            proj.destroy();
        });

        this.physics.add.overlap(this.playerGrenades, this.coverBoxes, (proj) => {
            proj.explode();
        });

        // Creating fresh UI
        this.events.emit('updateUI');

        // Triggering resume handler on resuming from PowerupScene
        this.events.off('resume');
        this.events.on('resume', this.handleResume, this);

        // Handling enemy kills
        this.events.on('enemyKilled', (enemy) => {
            
            this.enemiesLeft = Math.max(0, this.enemiesLeft - 1);

            let points = 0;

            if (enemy instanceof ShooterEnemy) {
                points = 100;
            } else if (enemy instanceof BomberEnemy) {
                points = 500;
            } else if (enemy instanceof BrawlerEnemy) {
                points = 250;
            }

            const currScore = this.registry.get('score');
            
            this.registry.set('score', currScore + points);
            this.events.emit('updateUI');

            if (this.enemiesLeft <= 0 && this.enemies.countActive(true) === 0) {
                const currScore = this.registry.get('score') || 0;
                this.registry.set('score', currScore + Math.floor(this.waveTimerPoints));
                this.events.emit('updateUI');
                if (this.wave < this.maxWaves) {
                    this.waveInProgress = false;
                    this.enemies.clear(true, true);
                    this.bullets.clear(true, true);
                    this.playerGrenades.clear(true, true);
                    this.enemyProjectiles.clear(true, true);
                    this.scene.pause('GameScene');
                    this.scene.launch('PowerupScene', { wave: this.wave });
                } else {
                    this.scene.stop('UIScene');
                    this.scene.start('EndScene', {
                        score: this.registry.get('score'),
                        victory: true
                    });
                }
            }
        });

        // Spawn first wave     
        this.spawnWave();

        // Turn off enemyKilled listener after shutdown
        this.events.once('shutdown', () => {
            this.events.off('enemyKilled');
        });
    }

    update(time, delta) {
        this.player.update(this.keys, this.bullets, this.playerGrenades);
        
        this.meleeArc.setPosition(this.player.x, this.player.y);

        if (this.waveInProgress) {
            this.waveTimerPoints -= this.waveTimerDecayRate;
            if (this.waveTimerPoints < this.minWaveBonus) {
                this.waveTimerPoints = this.minWaveBonus;
            }
            this.scene.get('UIScene').events.emit('updateBonus', this.waveTimerPoints);
        }

        this.enemies.children.each(enemy => {
            if (enemy && enemy.update) {
                enemy.update(time, delta);
            }
        });

        this.enemyProjectiles.children.each((proj) => {
            if (proj.active && proj.x < 50)
                proj.destroy();
        });

        if ((this.needToSpawnWave || (!this.waveInProgress && this.enemies.countActive(true) === 0))) {
            this.spawnWave();
            this.needToSpawnWave = false;
        }

        // Updating enemies
        this.enemies.children.iterate(enemy => {
            if (enemy && enemy.active) {
                if (enemy instanceof ShooterEnemy || enemy instanceof BomberEnemy) {
                    if (!enemy.directionY) {
                        enemy.directionY = 1;
                    }

                    enemy.body.setVelocityX(0);
                    enemy.body.setVelocityY(this.phalanxVerticalSpeed * enemy.directionY);

                    if (enemy.y >= 500 && enemy.directionY > 0) {
                        enemy.directionY = -1;
                        enemy.x -= 30;
                    } else if (enemy.y < 100 && enemy.directionY < 0) {
                        enemy.directionY = 1;
                        enemy.x -= 30;
                    } else if (enemy instanceof BrawlerEnemy) {
                        enemy.update(time);
                    }
                }
            }
        });
        
        // Updating projectiles
        this.enemyProjectiles.children.iterate(projectile => {
            if (projectile && projectile.active && projectile.update) {
                projectile.update(time);
            }
        });

        this.playerGrenades.children.iterate(grenade => {
            if (grenade && grenade.active && grenade.update) {
                grenade.update(this.time.now);
            }
        });

        if (Phaser.Input.Keyboard.JustDown(this.keys.melee)) {
            this.performMelee();
        }
    }

    // Handles spawning of the next wave after scene is resumed
    handleResume() {
        if (this.enemies)
            this.enemies.clear(true, true);

        this.enemiesLeft = 0;
        this.waveInProgress = false;
        this.needToSpawnWave = true;
        this.wave++;
        this.scene.get('UIScene').events.emit('updateWave', this.wave);
    }

    // Handles response to player damage
    playerTakeDamage() {
        if (this.isInvincible) return;
    
        const health = this.registry.get('health');
        this.registry.set('health', health - 1);
        this.events.emit('updateUI');
    
        this.startInvincibility();
    
        if (this.registry.get('health') <= 0) {
            this.scene.stop('UIScene');
            this.scene.start('EndScene', {
                score: this.registry.get('score'),
                victory: false
            });
        }
    }

    // Handles post-hit brief invincibility
    startInvincibility() {
        this.isInvincible = true;

        this.player.setAlpha(0.5);

        this.time.delayedCall(1000, () => {
            this.isInvincible = false;
            this.player.setAlpha(1);
        }, [], this);
    }

    // Handles game over
    gameOver() {
        this.scene.stop('UIScene');
        this.scene.start('EndScene', {
            score: this.registry.get('score') || 0,
            victory: false
        });
    }

    // Handles wave formation
    spawnWave() {
        this.waveTimerPoints = 1000;
        this.waveInProgress = true;
        this.spawnedEnemies = 0;
        this.enemiesLeft = 0;

        const screenWidth = this.sys.game.config.width;
        const screenHeight = this.sys.game.config.height;
        const enemyWidth = 40;
        const safeMargin = 50;
        
        const availSpaceX = screenWidth - 2 * safeMargin;
        const availSpaceY = screenHeight - 2 * safeMargin;

        const maxCols = Math.floor(availSpaceX / (enemyWidth + 20))
        const numCols = Math.min(1 + this.wave, maxCols);
        const maxRows = Math.floor(availSpaceY / (enemyWidth + 20));
        const numRows = Math.min(3 + Math.floor(this.wave / 2), maxRows);

        const spacingX = 80;
        const spacingY = 70;
        const startX = screenWidth - safeMargin - (numCols * (enemyWidth + 20));
        const startY = safeMargin;

        this.phalanxVerticalSpeed = 100 + this.wave * 5;
        this.brawlerSpeed = 150 + this.wave * 10;

        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                let enemy;
                const x = startX + col * spacingX;
                const y = startY + row * spacingY;

                if (col === numCols - 1) {
                    enemy = new BomberEnemy(this);
                } else {
                    enemy = new ShooterEnemy(this);
                }

                enemy.setPosition(x, y);
                enemy.directionY = 1;
                this.enemies.add(enemy);
                this.enemiesLeft++;
            }
        }

        const brawlerCount = 2 + this.wave;
        for (let i = 0; i < brawlerCount; i++) {
            const y = Phaser.Math.Between(0, 600);
            const brawler = new BrawlerEnemy(this);
            brawler.setPosition(800 + Phaser.Math.Between(0, 200), y);
            this.enemies.add(brawler);
            this.enemiesLeft++;
        }
    }

    // Handles player melee attack
    performMelee() {
        this.meleeArc.setVisible(true);
        this.sound.play('knife');

        this.physics.overlap(this.meleeArc, this.enemies, (arc, enemy) => {
            if (enemy.active && enemy.body) {
                enemy.takeDamage();
            }
        });
    
        this.time.delayedCall(150, () => {
            this.meleeArc.setVisible(false);
        });
    }
}