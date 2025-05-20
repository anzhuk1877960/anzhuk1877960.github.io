class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_ind_tiles", "industrial_tilemap_packed.png");    
        this.load.image("tilemap_gen_tiles", "generic_tilemap_packed.png");   
        this.load.image("tilemap_bgs_tiles", "backgrounds_tilemap_packed.png"); 
        this.load.image("tilemap_spaceship_tiles", "spaceship_tilemap_packed.png");
        this.load.image("tilemap_ship_parts_tiles", "ship_parts_tilemap_packed.png");
        this.load.tilemapTiledJSON("Luka-Escape", "LukaEscape.tmj");   // Tilemap in JSON
        this.load.image("dust", "dust.png");
        this.load.image("splash", "splash.png");
        this.load.image("pickup", "pickup.png");

        this.load.setPath("./assets/sounds/");

        this.load.audio("footstep", "footstep.ogg");
        this.load.audio("engine", "engine.ogg");
        this.load.audio("pickup", "pickup.ogg");
        this.load.audio("toxic", "toxic.ogg");
        this.load.audio("hurt", "hurt.ogg");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}