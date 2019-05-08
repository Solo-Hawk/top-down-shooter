/*
host: tank object
*/
class BaseController{
  constructor(host){

    this.host = host
    this.scene = this.host.scene
  }

  update(){

  }

}

/*
host: tank object
mouse: Phaser mouse
camera: Phaser camera
*/
class PlayerController extends BaseController{
  constructor(host, mouse, camera){
    super(host)

    this.mouse = mouse;
    this.camera = camera;

    this.keys = this.scene.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    })
  }

  update(){
    this.updateHostBody()
    this.updateComponents()
  }

  updateHostBody(){
    if (this.keys.up.isDown || this.keys.w.isDown) {
      if (this.host.currentSpeed < this.host.maxSpeed) {
        this.host.currentSpeed += this.host.acceleration;
      }
    } else if (this.keys.down.isDown || this.keys.s.isDown) {
      if (this.host.currentSpeed > -this.host.maxSpeed) {
        this.host.currentSpeed -= this.host.acceleration;
      }
    } else {
      this.host.currentSpeed *= 0.9;
      if (Math.abs(this.host.currentSpeed) < 0.1) {
        this.host.currentSpeed = 0;
      }
    }
    if (this.keys.left.isDown || this.keys.a.isDown) {
      if (this.currentSpeed >= 0) {
        this.host.part.angle += 6
      } else {
        this.host.part.angle -= 6
      }
    } else if (this.keys.right.isDown || this.keys.d.isDown) {
      if (this.currentSpeed >= 0) {
        this.host.part.angle -= 6
      } else {
        this.host.part.angle += 6
      }
    }
    this.scene.physics.velocityFromRotation(this.host.part.rotation, this.host.currentSpeed, this.host.part.body.velocity);
  }

  updateComponents(){
    this.host.components.forEach((component)=>{
      var sin = Math.sin(this.host.part.rotation)
      var cos = Math.cos(this.host.part.rotation)
      component.part.x = this.host.part.x - ((component.offsetX * cos) - (component.offsetY * sin))
      component.part.y = this.host.part.y - ((component.offsetX * sin) + (component.offsetY * cos))
      const point = this.scene.input.activePointer.positionToCamera(this.scene.cameras.main)
      component.part.rotation = Phaser.Math.Angle.RotateTo(
        component.part.rotation,
        Phaser.Math.Angle.Between(component.part.x, component.part.y, point.x, point.y),
        0.18
      )
      if(this.mouse.isDown){
        component.activate('player-fired')
      }
    })
  }
}


/*
host: tank object
*/
class EnemyController extends BaseController{
  constructor(host, target, mode){
    super(host);
    this.mode = mode
    this.target = target;
    this.lastAction = this.scene.time.now;
    this.actionFrequency = 900;
    this.destination = target.part.body.position.clone().add(new Phaser.Math.Vector2(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50)));
  }

  update(){
    if(this.lastAction + this.actionFrequency < this.scene.time.now){
      this.destination = this.target.part.body.position.clone().add(new Phaser.Math.Vector2(Phaser.Math.Between(-1, 1), Phaser.Math.Between(-1, 1)).scale( Phaser.Math.Between(200, 500)));
      this.lastAction = this.scene.time.now
    }
    this.updateHostBody()
    this.updateComponents()
  }

  updateHostBody(){
      var pos = this.host.part.body.position;
      var vel = this.host.part.body.velocity;
      var desVel = this.destination.clone()
        .subtract(pos)
        .normalize()
      var steering = desVel.clone().subtract(vel)
      steering.scale(0.97)
      vel.add(steering).normalize()
      vel.scale(this.host.maxSpeed)

      this.host.part.rotation = vel.angle()

  }

  updateComponents(){
    this.host.components.forEach((component)=>{
      var sin = Math.sin(this.host.part.rotation)
      var cos = Math.cos(this.host.part.rotation)
      component.part.x = this.host.part.x - ((component.offsetX * cos) - (component.offsetY * sin))
      component.part.y = this.host.part.y - ((component.offsetX * sin) + (component.offsetY * cos))
      const point = this.target.part.body.position
      component.part.rotation = Phaser.Math.Angle.RotateTo(
        component.part.rotation,
        Phaser.Math.Angle.Between(component.part.x, component.part.y, point.x, point.y),
        0.1
      )
      if(Phaser.Math.Distance.Between(this.host.part.x, this.host.part.y, this.target.part.x, this.target.part.y) <= component.range ){
        component.activate('enemy-fired');
      }
    })


  }
}
