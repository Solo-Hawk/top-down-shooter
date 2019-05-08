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


var game = new Phaser.Game(config);

var tankFactory;
var aiFactory;

var playerBullets;
var enemyBullets;
var explosions;

var running = true;

var fakeEnd = false;
var realEnd = false;

var tank
var heavy;

var player;
var mouse;
var camera;

var enemys = [];
var enemySpawns = 1

var text

var minimapCamera;

function preload(){
  // tankFactory = new TankFactory(this);
  // aiFactory = new aiFactory(this);

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

  mouse = this.input.activePointer

  tankFactory = new TankFactory(this, camera, mouse)


  this.map = this.make.tilemap({key:'map'})
  var terrain = this.map.addTilesetImage('terrain', 'terrain');
  this.map.createStaticLayer('ground', terrain,0,0)
  console.log(this.map)

  this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);


  createListeners.call(this)

  createGroups.call(this)
  createAnims.call(this)

  player = tankFactory.PlayerTank(this.map.widthInPixels / 2,this.map.heightInPixels / 2)
  tankFactory.setTarget(player)
  // heavy = tankFactory.BossTank(this.map.widthInPixels / 2,this.map.heightInPixels / 2)

  for(var i = 0; i < 6; i++){
    enemys.push(tankFactory.EnemyTank(
      Phaser.Math.Between(0,this.map.widthInPixels),
      Phaser.Math.Between(0,this.map.heightInPixels)
    ));
  }

  minimapCamera = this.cameras.add(0, 0, 100, 100);
  minimapCamera.zoom = 0.05;
  minimapCamera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  minimapCamera.startFollow(player.part)


  this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  camera = this.cameras.main
  camera.setZoom(0.5)
  camera.startFollow(player.part)

  this.physics.world.on('worldbounds', function (body) {
        body.gameObject.destroy();
  });




  //---------------
  console.log(this)
}

function update(){
  if(!running){return}
  player.update()
  enemys.forEach((enemy)=>{enemy.update()})
  // heavy.update()
}

//----------------
function createGroups(){
  playerBullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50
  });
  enemyBullets = this.physics.add.group({
    defaultKey: 'bullet1',
    maxSize: 80
  });
  explosions = this.physics.add.group({
    defaultKey: 'explosions',
    maxSize: 100
  });
}

function createAnims(){
  this.anims.create({
    key: 'boom',
    frames: this.anims.generateFrameNames('explosions', {
      start: 1, end: 5,
      prefix: 'explosion', suffix: ''
    }),
    frameRate: 8,
    repeat: 0
  });

  this.anims.create({
    key: 'smoke',
    frames: this.anims.generateFrameNames('smokes', {
      start: 1, end: 5,
      prefix: 'smoke', suffix: ''
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'bulletTravel',
    frames: ['bullet1', 'bullet2'],
    frameRate: 8,
    repeat: 0
  });
}


function arrayRemove(arr, value) {
  return arr.filter(function(ele){
    return ele != value;
  });

}

function createListeners(){
  this.events.on('component-killed', (component)=>{
    console.log('component-killed')
    component.part.destroy()
    createSmoke(component.part.x, component.part.y)
    var len = enemys.length
    console.log(len)
    enemys = arrayRemove(enemys, component)
    if (enemys.length < len && enemys.length >= 0){
      this.events.emit('enemy-killed', this)
    }
    console.log(enemys.length);
    console.log(enemys)


    if(component === player){running = false; component.scene.physics.pause();}

  })
  this.events.on('player-fired', (scene, turret, host)=>{
    console.log('player-fired')
    var bullet = enemyBullets.get(turret.part.x, turret.part.y)
    if (bullet) {
        bullet.setCollideWorldBounds(true)
        bullet.body.onWorldBounds = true
        fireBullet.call(scene, bullet, turret, turret.part.rotation, host.controller.target);
    }
  });
  this.events.on('enemy-fired', (scene, turret, host)=>{
    console.log('enemy-fired')
    var bullet = enemyBullets.get(turret.part.x, turret.part.y)
    if (bullet) {
        bullet.setCollideWorldBounds(true)
        bullet.body.onWorldBounds = true
        fireBullet.call(scene, bullet, turret, turret.part.rotation, host.controller.target);
    }
  });
  this.events.on('enemy-killed', (scene)=>{
    console.log('enemy-killed')
    console.log(scene)
    if(enemySpawns > 0){
      enemys.push(tankFactory.EnemyTank(
        Phaser.Math.Between(0,this.map.widthInPixels),
        Phaser.Math.Between(0,this.map.heightInPixels)
      ));
      enemySpawns--
    }else if(enemySpawns == 0 && enemys.length ==0 && !fakeEnd){
      fakeEnd = true
      scene.events.emit('fake-end', scene)
    }else if(fakeEnd){
      scene.events.emit('true-end', scene)
    }
    console.log(enemySpawns, "<- spawns left");
  })
  this.events.on('fake-end', (scene)=>{
    console.log("fake end")
    text = scene.add.text(camera.scrollX, camera.scrollY, "You WIN")
    text.setFontFamily("Arial")
    text.setFontSize(100)
    console.log(text)
    setTimeout(() => {
      camera.flash(300)
      text.setText("OR HAVE YOU")
      text.setFill("#ff0000")
      enemys.push(tankFactory.BossTank(
        Phaser.Math.Between(0,this.map.widthInPixels),
        Phaser.Math.Between(0,this.map.heightInPixels)
      ))
    }, 3000)
  })
  this.events.on('true-end', (scene)=>{
    console.log("true end")
    text.x = camera.scrollX
    text.y = camera.scrollY
    text.setText("Okay, you win")
    running = false;
    scene.physics.pause();
  })
}

function fireBullet(bullet, shooter, rotation, target) {
    //console.log('fire Bullet')
    bullet.enableBody(false);
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.depth = 2;
    bullet.rotation = rotation;
    bullet.damage = shooter.damage
    bullet.setScale(1 + shooter.damage / 10)
    // bullet.play('bulletTravel')
    // var destructLayer = this.map.getLayer('walls').tilemapLayer;
    // this.physics.add.collider(bullet, destructLayer, damageWall, null, this)

    this.physics.velocityFromRotation(bullet.rotation, shooter.speed, bullet.body.velocity)
    if (target == player) {
      this.physics.add.overlap(player.part, bullet, bulletHit, null, this)

    } else {
      tankFactory.enemyTanks.forEach((tank)=>{
        this.physics.add.overlap(tank.part, bullet, bulletHit,null,this)
      })

    }

    bullet.life = setTimeout(()=>{bullet.destroy()}, shooter.lifetime)
}

function bulletHit(tank, bullet){
  killBullet(bullet)
  tank.parent.takeDamage(bullet.damage)
}

function killBullet(bullet){
  var x,y;
  x = bullet.x
  y = bullet.y
  clearTimeout(bullet.life)
  bullet.destroy();
  createExplosion(x,y)
  // var exploder = explosions.get(x,y)
  // if(exploder){
  //
  //   camera.shake(300, 0.04, true)
  //     exploder.play('explode')
  //     exploder.once('animationcomplete', function () {
  //                       exploder.destroy();
  //                     })
  //
  // }

}

function createExplosion(x, y){
  var exploder = explosions.get(x,y)
  if(exploder){
    camera.shake(300, 0.04, true)
    exploder.play('boom')
    exploder.once('animationcomplete', function () {
      exploder.destroy();
    })

  }
}

function createSmoke(x, y){
  var exploder = explosions.get(x,y)
  if(exploder){
    camera.shake(300, 0.04, true)
    exploder.play('smoke')
    exploder.once('animationcomplete', function () {
      exploder.destroy();
    })

  }
}
