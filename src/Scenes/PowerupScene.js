export default class PowerupScene extends Phaser.Scene {
    constructor() {
        super('PowerupScene');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const hasShotgun = this.registry.get('hasShotgun') || false;
        const hasGrenadeLauncher = this.registry.get('hasGrenadeLauncher') || false;

        this.add.text(centerX, centerY - 150, 'Choose a Powerup', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.shotgunButton = this.add.text(centerX, centerY - 50, '10000 Points: Shotgun Upgrade', {
            fontSize: '24px',
            backgroundColor: '#6666ff',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        if (hasShotgun) {
            this.shotgunButton.setAlpha(0.5);
            this.shotgunButton.disableInteractive();
            this.shotgunButton.setText('Shotgun - ACTIVE');
        }

        this.shotgunButton.on('pointerdown', () => {
            if (this.registry.get('score') >= 10000) {
                const oldScore = this.registry.get('score');
                this.registry.set('hasShotgun', true);
                this.registry.set('hasGrenadeLauncher', false);
                this.registry.set('score', oldScore - 10000);
                this.returnToGame();
            } else {
                this.scene.get('UIScene').events.emit('insufficientPoints');
            }
        });

        this.grenadeButton = this.add.text(centerX, centerY + 25, '15000 Points: Grenade Launcher', {
            fontSize: '24px',
            backgroundColor: '#66ff66',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        if (hasGrenadeLauncher) {
            this.grenadeButton.setAlpha(0.5);
            this.grenadeButton.disableInteractive();
            this.grenadeButton.setText('Grenade Launcher - ACTIVE');
        }

        this.grenadeButton.on('pointerdown', () => {
            if (this.registry.get('score') >= 15000) {
                const oldScore = this.registry.get('score');
                this.registry.set('hasGrenadeLauncher', true);
                this.registry.set('hasShotgun', false);
                this.registry.set('score', oldScore - 15000);
                this.returnToGame();
            } else {
                this.scene.get('UIScene').events.emit('insufficientPoints');
            }
        });

        this.healButton = this.add.text(centerX, centerY + 100, '2000 Points: +1 Health', {
            fontSize: '24px',
            backgroundColor: '#ff6666',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();
        
        this.healButton.on('pointerdown', () => {
            if (this.registry.get('score') >= 2000) {
                const oldScore = this.registry.get('score');
                this.registry.set('health', this.registry.get('health') + 1);
                this.registry.set('score', oldScore - 2000);
                this.returnToGame();
            } else {
                this.scene.get('UIScene').events.emit('insufficientPoints');
            }
        });

        this.skipText = this.add.text(centerX, centerY + 175, 'SKIP →', {
            fontSize: '24px',
            backgroundColor: '#ff6666',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        this.skipText.on('pointerdown', () => {
            this.returnToGame();
        });

    }

    returnToGame() {
        this.scene.stop('PowerupScene');
        this.scene.resume('GameScene');
    }
}