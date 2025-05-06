import Enemy from './Enemy.js';

export default class ShooterEnemy extends Enemy {
    constructor(scene) {
        const y = Phaser.Math.Between(50, 550);
        super(scene, 750, y, 'shooterEnemy');
        this.spawnTime = scene.time.now;
        this.shootCooldown = Phaser.Math.Between(1500, 3000);
        this.lastShot = 0;
        this.setFlipX(true);
        this.scene = scene;
    }

    update(time) {
        if (!this.body || !this.active)
            return;

        const startupDelay = 2000;

        if (time > this.spawnTime + startupDelay) {
            if (time > this.lastShot + this.shootCooldown) {
                this.shootProjectile();
                this.lastShot = time;

                this.shootCooldown = Phaser.Math.Between(2000, 4000);
            }
        }

        if (this.body && this.x <= 400) { 
            this.body.setVelocityX(0);
        }
    }

    // Handles projectile shooting behavior
    shootProjectile() {
        const projectile = this.scene.physics.add.sprite(this.x - 10, this.y, 'bullet');
        this.scene.enemyProjectiles.add(projectile);
        this.scene.sound.play('shoot');
        this.scene.physics.world.once('worldstep', () => {
            if (projectile.body) {
                if (!this.scene || !this.scene.player || !this.scene.player.active) 
                    return;

                const targetX = this.scene.player.x;
                const targetY = this.scene.player.y;
                const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);

                const speed = 200;
                if (projectile.body && this.x <= 150) { 
                    projectile.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
                } else {
                    projectile.body.setVelocityX(-speed);
                }
                
                projectile.body.setAllowGravity(false);
            }
        });
        projectile.setData('isEnemyShot', true);
    }
}