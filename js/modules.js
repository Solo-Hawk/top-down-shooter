/*
host: tank object
*/
class Component{
  constructor(host){
    this.host = host
    this.scene = host.scene
    this.enabled = true
  }

  isEnabled(){return this.enabled}

  setEnabled(e){this.enabled = e}

  activate(){

  }
}

/*
host: tank object

config
  damage: number
  range: number
  firerate: number (ms)

  texture: texture key
  frame: frame key


  offsetX: number
  offsetY: number

*/
class Gun extends Component{
  constructor(host, config){
    super(host)
    this.damage = config.damage
    this.lifetime = config.lifetime
    this.range = config.range
    this.speed = config.speed
    this.firerate = config.firerate
    this.lastshot = this.scene.time.now

    this.offsetX = config.offsetX || 0
    this.offsetY = config.offsetY || 0

    this.centerX = config.centerX || 0.5
    this.centerY = config.centerY || 0.5

    this.part = config.sprite || this.scene.physics.add.sprite(host.part.x, host.part.y, config.texture, config.frame)
    this.part.setOrigin(this.centerX, this.centerY)

  }

  activate(event){
    if(this.lastshot + this.firerate > this.scene.time.now){
      return
    }
    this.scene.events.emit(event, this.scene, this, this.host)
    this.lastshot = this.scene.time.now;
  }
}
