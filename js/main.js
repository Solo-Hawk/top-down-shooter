var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                y: 0
            } // Top down game, so no gravity
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


var game = new Phaser.Game(config)

function preload(){

  this.load.image('player-body', 'assets/tank/player/body.png');
  this.load.image('player-barrel-1', 'assets/tank/player/barrel1.png');


  this.load.image('enemy-body', 'assets/tank/enemy/body.png')
  this.load.image('enemy-barrel-1', 'assets/tank/enemy/barrel1.png')
  this.load.image('enemy-barrel-2', 'assets/tank/enemy/barrel2.png')
  this.load.image('enemy-barrel-3', 'assets/tank/enemy/barrel3.png')

  this.load.image('enemy-heavy-body', 'assets/tank/enemy/heavybody.png')
  this.load.image('enemy-heavy-barrel-1', 'assets/tank/enemy/heavybarrel1.png')
  this.load.image('enemy-heavy-barrel-2', 'assets/tank/enemy/heavybarrel2.png')

  this.load.image('bullet1', 'assets/projectiles/shotOrange.png')
  this.load.image('bullet2', 'assets/projectiles/shotRed.png')

  this.load.image('tracks', 'assets/effects/tracksSmall.png')

  this.load.atlas({
    key: 'explosions',
    textureURL: 'assets/effects/explosion-spritesheet.png',
    atlasURL: 'assets/effects/explosion-spritesheet.json'
  });

  this.load.atlas({
    key: 'smokes',
    textureURL: 'assets/effects/smoke-spritesheet.png',
    atlasURL: 'assets/effects/smoke-spritesheet.json'
  });

  this.load.image('terrain', 'assets/map/terrain.png');
  this.load.tilemapTiledJSON({
    key: 'map',
    url: 'assets/map/map.json'
  })

}

function create(){
  // Game Manager (adding it to Phaser Game Scene)
  this.manager = new GameManager(this)

  // Map Generation
  createMap.call(this)


  // Camera and Mouse
  camera = this.cameras.main
  mouse = this.input.activePointer
  this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

  // Physics Setup
  this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  //-------------//
  console.log(this)
}

function update(){

}

//----------------------------------------------//
//----------------------------------------------//

function createMap(){
  this.map = this.make.tilemap({key:'map'})
  var terrain = this.map.addTilesetImage('terrain', 'terrain');
  this.map.createStaticLayer('ground', terrain,0,0)
}

function createAnims(){
  this.anims.create({
    key: 'boom',
    frames: this.anims.generateFrameNames('explosions', {
      start: 1, end: 5,
      prefix: 'explosion', suffix: ''
    }),
    frameRate: 16,
    repeat: 0
  });

  this.anims.create({
    key: 'smoke',
    frames: this.anims.generateFrameNames('smokes', {
      start: 1, end: 5,
      prefix: 'smoke', suffix: ''
    }),
    frameRate: 16,
    repeat: 0
  });
}
