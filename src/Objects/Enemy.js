export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.physics.world.once('worldstep', () => {
            if (this.body) {
                this.body.setVelocityX(-100);
            }
        });
        
        this.myScene = scene;
        this.hp = 1;
    }

    // Handles enemy damage response
    takeDamage() {
        if (this.scene && this.scene.sound) {
            this.scene.sound.play('hit');
        } 

        this.hp--;
        if (this.hp <= 0) {
            this.destroy();
            this.myScene.events.emit('enemyKilled', this);
        }
    }
}