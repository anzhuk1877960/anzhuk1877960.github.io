import BootScene from './Scenes/BootScene.js';
import MenuScene from './Scenes/MenuScene.js';
import GameScene from './Scenes/GameScene.js';
import UIScene from './Scenes/UIScene.js';
import EndScene from './Scenes/EndScene.js';
import PowerupScene from './Scenes/PowerupScene.js'

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, MenuScene, GameScene, UIScene, EndScene, PowerupScene],
    parent: 'game-container'
};

new Phaser.Game(config);