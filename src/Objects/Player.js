import Grenade from './Grenade.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, y, bulletsGroup, grenadesGroup) {
        super(scene, 80, y, 'player');
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.setCollideWorldBounds(true);
        this.lastFired = 0;
        this.bullets = bulletsGroup;
        this.grenades = grenadesGroup;
    }

    update(keys, bullets) {
        this.setVelocity(0);
        
        if (keys.up.isDown)
            this.setVelocityY(-200);
        else if (keys.down.isDown)
            this.setVelocityY(200);

        if (keys.shoot.isDown && this.scene.time.now > this.lastFired) {

            const hasShotgun = this.scene.registry.get('hasShotgun');
            const hasGrenadeLauncher = this.scene.registry.get('hasGrenadeLauncher');

            if (hasGrenadeLauncher) {
                const grenade = new Grenade(this.scene, this.x + 25, this.y + 10, 300, 0, 'player');
                this.grenades.add(grenade);
    
            } else if (hasShotgun) {
                const bulletM = this.scene.physics.add.sprite(this.x + 25, this.y + 10, 'bullet');
                const bulletL = this.scene.physics.add.sprite(this.x + 25, this.y + 10, 'bullet');
                const bulletR = this.scene.physics.add.sprite(this.x + 25, this.y + 10, 'bullet');

                this.scene.bullets.add(bulletM);
                this.scene.bullets.add(bulletL);
                this.scene.bullets.add(bulletR);

                bulletM.body.setVelocityX(400);
                bulletL.body.setVelocity(400, -100);
                bulletR.body.setVelocity(400, 100);
            } else {
                const bullet = bullets.create(this.x + 25, this.y + 10, 'bullet');
                this.scene.bullets.add(bullet);
                bullet.body.setVelocityX(400);
            }
            
            this.scene.sound.play('shoot');
            this.lastFired = this.scene.time.now + 300;
        }
    }
}