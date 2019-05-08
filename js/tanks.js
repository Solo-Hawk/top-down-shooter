/*
scene: Phaser scene
health: number
maxHealth: number
*/
class HealthComponent{
  constructor(scene, health, maxHealth){
    this.scene = scene
    this.health = health;
    this.maxHealth = maxHealth || health
    this.isDestroyed = false
  }

  takeDamage(d){
    this.health -= d
    if(this.health <= 0){
      this.isDestroyed = true
      this.scene.events.emit('component-killed', this)
    }
  }
  heal(h){
    this.health += h
  }
  isDestroyed(){
    return this.isDestroyed
  }
}

/*
scene: Phaser Scene

config
  health: number
  maxHealth: number

  part: Phaser Physics sprite
  or
  x: number
  y: number
  texture: texture key
  frame: framename (optional)

  currentSpeed: number
  maxSpeed: number
  acceleration: number
*/
class Tank extends HealthComponent{
  constructor(scene, config){
    super(scene, config.health, config.maxHealth)

    this.scene = scene;

    this.part = config.part || this.scene.physics.add.sprite(config.x, config.y, config.texture, config.frame)
    this.part.body.collideWorldBounds = true;
    this.part.body.bounce.setTo(1, 1);
    this.part.parent = this

    this.currentSpeed = config.currentSpeed || 0;
    this.maxSpeed = config.maxSpeed || 100;
    this.acceleration = config.acceleration || 12;

    this.emitter = config.emitter
    this.emitter.follow = this.part

    this.components = []
    this.controller;
  }

  takeDamage(d){
    super.takeDamage(d)

    if(this.health <= 0){
      this.components.forEach((component)=>{
        component.part.destroy()
      })
    }
  }

  /*
    c: a Contoller object from ai.js
  */
  addController(cont){
    this.controller = cont
  }

  /*
    m: a component object from mdoules.js
  */
  addComponent(comp){
    this.components.push(comp)
  }

  update(){
    if(this.isDestroyed){
      return
    }
    this.controller.update()
  }

}
