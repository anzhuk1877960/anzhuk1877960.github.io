export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        this.scoreText = this.add.text(650, 16, `Score: ${this.registry.get('score') || 0}`, { fontSize: '20px', fill: '#fff' });
        this.healthText = this.add.text(50, 16, '♥♥♥', { fontSize: '50px', fill: '#ff4d4d' });
        this.bonusText = this.add.text(650, 40, 'Bonus: 1000', { fontSize: '20px', fill: '#fff' });
        this.waveText = this.add.text(350, 16, 'Wave: 1', { fontSize: '20px', fill: '#fff' });

        this.handleRegistryChange = (parent, key, data) => {
            if (key === 'score' && this.scoreText) {
                this.scoreText.setText('Score: ' + data);
            } else if (key === 'health' && this.healthText) {
                const health = this.registry.get('health') || 0;
                let hearts = '';
                for (let i = 0; i < health; i++) {
                    hearts += '♥';
                }
                this.healthText.setText(hearts);
            }
        };

        this.registry.events.on('changedata', this.handleRegistryChange);

        this.events.on('updateUI', () => {
            if (this.healthText && this.scoreText) {
                this.scoreText.setText('Score: ' + this.registry.get('score'));
                
                const health = this.registry.get('health') || 0;
                let hearts = '';
                for (let i = 0; i < health; i++) {
                    hearts += '♥';
                }
                this.healthText.setText(hearts);
            }
        });

        this.events.on('updateWave', (waveNumber) => {
            this.waveText.setText(`Wave: ${waveNumber}`);
        });

        this.events.on('insufficientPoints', () => {
            if (this.scoreText) {
                this.scoreText.setTint(0xff0000);
                this.time.delayedCall(500, () => {
                    this.scoreText.clearTint(); 
                });
            }
        });

        this.events.on('updateBonus', (bonusValue) => {
            this.bonusText.setText(`Bonus: ${Math.floor(bonusValue)}`);
        });

        this.events.on('shutdown', this.onShutdown, this);
    }

    onShutdown() {
        if (this.handleRegistryChange) {
            this.registry.events.off('changedata', this.handleRegistryChange);
        }
    }
}