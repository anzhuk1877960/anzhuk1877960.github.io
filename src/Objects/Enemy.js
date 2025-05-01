export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.physics.world.once('worldstep', () => {
            if (this.body) {
                this.body.setVelocityX(-100);
                this.body.setAllowGravity(false);
            }
        });
        
        this.myScene = scene;
        this.hp = 1;
    }

    takeDamage() {
        if (this.scene && this.scene.sound) {
            this.scene.sound.play('hit');
        } else {
            console.warn(`[ShooterEnemy] takeDamage() called but scene/sound not found. this.active=${this.active}`);
        }

        this.hp--;
        if (this.hp <= 0) {
            this.destroy();
            this.myScene.events.emit('enemyKilled', this);
        }
    }
}