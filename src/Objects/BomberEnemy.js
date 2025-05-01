import Enemy from './Enemy.js';
import Grenade from './Grenade.js';

export default class BomberEnemy extends Enemy {
    constructor(scene) {
        const y = Phaser.Math.Between(50, 550);
        super(scene, 750, y, 'bomberEnemy');
        this.spawnTime = scene.time.now;
        this.throwCooldown = Phaser.Math.Between(1500, 3000);
        this.lastThrown = 0;
        this.setFlipX(true);
        if (this.body) {
            this.body.setVelocityX(-30);
            this.body.setAllowGravity(false);
        }
        this.hp = 2;
    }

    update(time) {
        if (!this.body || !this.active)
            return;

        const startupDelay = 2000;

        if (time > this.spawnTime + startupDelay) {
            if (time > this.lastThrown + this.throwCooldown) {
                this.scene.sound.play('shoot');
                this.throwGrenade();
                this.lastThrown = time;

                this.throwCooldown = Phaser.Math.Between(2000, 4000);
            }
        }

        if (this.body && this.x <= 300) { 
            this.body.setVelocityX(0);
        }
    }

    throwGrenade() {
        const grenade = new Grenade(this.scene, this.x - 10, this.y, -100, 0, 'enemy');
        this.scene.enemyProjectiles.add(grenade);

        this.scene.physics.world.once('worldstep', () => {
            if (grenade.body) {
                if (!this.scene || !this.scene.player || !this.scene.player.active) 
                    return;

                const targetX = this.scene.player.x;
                const targetY = this.scene.player.y;
                const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
                
                const speed = 200;
                if (grenade.body && this.x <= 300) {
                    grenade.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
                } else {
                    grenade.body.setVelocityX(-speed);
                }
                grenade.body.setAllowGravity(false);
    
            }
        });
    }
}