export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.setPath('../../assets/images/');
        this.load.image('player', 'player.png');
        this.load.image('shooterEnemy', 'shooter.png');
        this.load.image('brawlerEnemy', 'brawler.png');
        this.load.image('bomberEnemy', 'bomber.png');
        this.load.image('grenade', 'grenade.png');
        this.load.image('bullet', 'bullet.png');
        this.load.image('box', 'box.png');
        this.load.image('background', 'background.png');
        this.load.setPath('assets/sounds/');
        this.load.audio('shoot', 'shoot.ogg');
        this.load.audio('knife', 'knife.ogg');
        this.load.audio('explosion', 'explosion.ogg');
        this.load.audio('hit', 'hit.ogg');
    }

    create() {
        this.scene.start('MenuScene');
    }
}