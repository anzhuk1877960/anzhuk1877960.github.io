import Enemy from './Enemy.js'

export default class BrawlerEnemy extends Enemy {
    constructor(scene) {
        const y = Phaser.Math.Between(50, 550);
        super(scene, 800, y, 'brawlerEnemy');
        this.setFlipX(true);
        if (this.body) {
            this.body.setMaxVelocity(300, 300);
        }
        this.speed = scene.brawlerSpeed || 150;
        this.hasTurned = false;
    }

    update() {
        if (!this.body || !this.active || !this.scene.player)
            return;

        const player = this.scene.player;
        
        if (!this.hasTurned) {
            this.body.setVelocity(0, 0);
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            const vx = Math.cos(angle) * this.speed;
            const vy = Math.sin(angle) * this.speed;

            this.body.setVelocity(vx, vy);

            if (this.x <= player.x) {
                this.hasTurned = true;
            }
        } else {
            const speed = this.scene.brawlerSpeed || 150;

            if (player.y < this.y - 5) {
                this.body.setVelocity(0, -speed);
                this.rotation = Phaser.Math.DegToRad(90);
            } else if (player.y > this.y + 5) {
                this.body.setVelocity(0, -speed);
                this.rotation = Phaser.Math.DegToRad(270);
            } else {
                this.body.setVelocity(0, 0);
            }
        }
    }
}