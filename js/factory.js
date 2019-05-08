class TankFactory{
  constructor(scene, camera, input){
    this.scene = scene
    this.camera = camera
    this.input = input //Mouse Pointer or Touch
    this.target = null;
    this.player = null;
    this.enemyTanks = [];

    this.emitter = this.scene.add.particles('tracks', {
      lifespan: 1000,
      delay: 250
    })
  }

  setTarget(t){
    this.target = t
  }

  killTank(){

  }


  PlayerTank(x,y){
    console.log("Creating Player")
    var tank = new Tank(this.scene, {
      health: 40,
      maxHealth: 10,
      x: x,
      y: y,
      texture: 'player-body',
      currentSpeed:0,
      maxSpeed: 500,
      acceleration: 80,
      emitter: this.emitter.createEmitter()

      //controller: new PlayerController(tank, this.input, this.camera)
    });
    tank.addController(new PlayerController(tank, this.input, this.camera))
    tank.addComponent(new Gun(tank, {
      damage: 3,
      lifetime: 1000,
      firerate: 150,
      range: 600,
      speed: 4000,
      centerX: 0.22,
      centerY: 0.5,
      offsetX: 10,
      offsetY: 0,
      texture: 'player-barrel-1'
    }))
    return tank
  }

  /*
  player: Player Tank Object
  */
  EnemyTank(x,y){
    if(this.target == null){
      console.log("No Target set in Tank Factory")
      return
    }
    var tank = new Tank(this.scene, {
      health: 10,
      maxHealth: 10,
      x: x,
      y: y,
      texture: 'enemy-body',
      currentSpeed:0,
      maxSpeed: 800,
      acceleration: 12,
      emitter: this.emitter.createEmitter()
    });
    tank.addController(new EnemyController(tank, this.target, Phaser.Math.Between(0,1)))
    tank.addComponent(new Gun(tank, {
      damage: 1,
      lifetime: 1000,
      firerate: 1250,
      range: 1000,
      speed: 1500,
      centerX: 0.4,
      centerY: 0.5,
      offsetX: 10,
      offsetY: 0,
      texture: 'enemy-barrel-3'
    }))
    this.enemyTanks.push(tank)
    return tank

  }

  BossTank(x,y){
    if(this.target == null){
      console.log("No Target set in Tank Factory")
      return
    }
    var tank = new Tank(this.scene, {
      health: 50,
      maxHealth: 50,
      x: x,
      y: y,
      texture: 'enemy-heavy-body',
      currentSpeed:0,
      maxSpeed: 800,
      acceleration: 12,
      emitter: this.emitter.createEmitter()
    });
    tank.addController(new EnemyController(tank, this.target, Phaser.Math.Between(0,1)))
    tank.addComponent(new Gun(tank, {
      damage: 10,
      lifetime: 3000,
      firerate: 2000,
      range: 2000,
      speed: 2500,
      centerX: 0.4,
      centerY: 0.5,
      offsetX: 50,
      offsetY: 0,
      texture: 'enemy-heavy-barrel-2'
    }))
    tank.addComponent(new Gun(tank, {
      damage: 1,
      lifetime: 1000,
      firerate: 75,
      range: 600,
      speed: 1500,
      centerX: 0.4,
      centerY: 0.5,
      offsetX: -20,
      offsetY: 0,
      texture: 'enemy-heavy-barrel-1'
    }))
    this.enemyTanks.push(tank)
    return tank
  }




}
