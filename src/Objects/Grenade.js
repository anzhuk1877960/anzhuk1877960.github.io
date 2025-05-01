export default class Grenade extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, velocityX = 0, velocityY = 0, source = 'enemy') {
        super(scene, x, y, 'grenade');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        

        scene.time.delayedCall(0, () => {
            if (this.body) {
                this.setVelocity(velocityX, velocityY);
                this.body.setAllowGravity(false); // in case gravity is affecting it
                console.log(`[GRENADE VELOCITY SET] vx=${this.body.velocity.x}, vy=${this.body.velocity.y}`);
            }
        });

        this.setCollideWorldBounds(true);
        this.setBounce(0.6);

        this.source = source;
        this.exploded = false;
        this.explodeTime = scene.time.now + 3000;

        this.flashTimer = scene.time.addEvent({
            delay: 250,
            loop: true,
            callback: () => {
                this.setTint(this.tintTopLeft === 0xff0000 ? 0xffffff : 0xff0000);
            }
        });
    }

    update(time) {
        if (!this.exploded && time >= this.explodeTime) {
            this.explode();
        }

        if (this.source === 'enemy') {
            if (this.body && this.x <= 80) { 
                this.body.setVelocity(0);
            }
        }
    }

    explode() {
        if (this.exploded)
            return;

        this.exploded = true;
        this.flashTimer.remove();
        this.clearTint();

        const blastRadius = 80;
        const scene = this.scene;
        const x = this.x;
        const y = this.y;

        const explosion = scene.add.circle(x, y, blastRadius, 0xffaa00, 0.3);
        scene.time.delayedCall(200, () => explosion.destroy());

        scene.sound.play('explosion');

        if (this.source === 'player') {
            scene.enemies.children.each(enemy => {
                if (enemy.active && Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= blastRadius) {
                    enemy.takeDamage();
                    const currScore = scene.registry.get('score');
                    scene.registry.set('score', currScore + 500);
                    scene.events.emit('updateUI');
                }
            });

            if (Phaser.Math.Distance.Between(x, y, scene.player.x, scene.player.y) <= blastRadius) {
                scene.playerTakeDamage();
            }
        } else if (this.source === 'enemy') {
            if (Phaser.Math.Distance.Between(x, y, scene.player.x, scene.player.y) <= blastRadius) {
                scene.playerTakeDamage();
            }
        }

        this.flashTimer.remove();
        this.destroy();
    }
}