export default class EndScene extends Phaser.Scene {
    constructor() {
        super('EndScene');
    }

    init(data) {
        this.finalScore = data.score;
        this.victory = data.victory;
    }

    create() {
        const { width, height } = this.scale;
        const resultText = this.victory ? 'YOU WIN' : 'GAME OVER';
        this.add.text(width / 2, height / 2 - 60, resultText, { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2, `Final Score: ${this.finalScore}`, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

        const restartBtn = this.add.text(width / 2, height / 2 + 60, 'Restart', { fontSize: '20px', fill: '#0f0' }).setOrigin(0.5).setInteractive();
        const menuBtn = this.add.text(width / 2, height / 2 + 100, 'Main Menu', { fontSize: '20px', fill: '#0f0' }).setOrigin(0.5).setInteractive();

        restartBtn.on('pointerdown', () => {
            this.registry.set('health', 3);
            this.registry.set('score', 0);
            this.registry.set('hasShotgun', false);
            this.registry.set('hasGrenadeLauncher', false);
            this.registry.set('wave', 1);

            this.events.emit('updateUI');
            
            this.scene.stop('UIScene');
            this.scene.stop('GameScene');

            this.scene.start('GameScene');
            this.scene.launch('UIScene');
        });

        menuBtn.on('pointerdown', () => {
            if (this.victory) {
                const highScore = this.registry.get('highScore') || 0;
                const finalScore = this.registry.get('score');
                if (finalScore > highScore) {
                    this.registry.set('highScore', finalScore);
                }
            }

            this.scene.start('MenuScene');
        });        
    }
}