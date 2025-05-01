export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const { width, height } = this.scale;
        const highScore = this.registry.get('highScore') || 0;

        this.add.text(width / 2, height / 2 - 100, 'Anton Zhuk Presents...', { fontSize: '21px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 - 50, 'Oliver\'s Last Stand', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        const startBtn = this.add.text(width / 2, height / 2 + 10, 'Start Game', { fontSize: '24px', fill: '#0f0' }).setOrigin(0.5).setInteractive();

        this.add.text(400, 400, 'CONTROLS:\nW/S – Move Up/Down\nE – Shoot\nQ – Melee\n', {
            fontSize: '20px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 500, `Highest Victory Score: ${highScore}`, {
            fontSize: '24px',
            fill: '#ffff88',
            align: 'center'
        }).setOrigin(0.5);

        startBtn.on('pointerdown', () => {
            this.registry.set('health', 3);
            this.registry.set('score', 0);
            this.registry.set('hasShotgun', false);
            this.registry.set('hasGrenadeLauncher', false);

            this.events.emit('updateUI');
            
            this.scene.stop('UIScene');
            this.scene.stop('GameScene');

            this.scene.start('GameScene');
            this.scene.launch('UIScene');
        });
    }
}