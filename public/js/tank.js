//Tank Object
function Tank() {
  //Setup Variables
  this.body = null;
  this.gun  = null;
  this.x = 100;
  this.y = 100;
  this.speed = 2;
  this.dir = 0;
  this.gunDir = 0;
  this.color = "blue";


  this.update = function () {
    //block going off the edge
    this.x = constrain(this.x, 0, width);
    this.y = constrain(this.y, 0, height);

    //Gun follows mouse
    // var x = mouseX - this.x;
    // var y = mouseY - this.y;
    // if(y < 0){
    //   this.gunDir = -atan(x/y);
    // }else {
    //   this.gunDir = PI-atan(x/y);
    // }
  }

  this.show = function () {
    push();
    imageMode(CENTER);
    translate(this.x, this.y);
    rotate(this.dir);
    image(this.body, 0, 0, 30, 30);
    rotate(this.gunDir)
    image(this.gun, 0, -8, 10, 30)
    pop();
  }

  //fire bullets
  this.fire = function () {
    bullets.push(new Bullet(this.x, this.y, this.gunDir - PI+this.dir))
  }
}

function Bullet(x, y, d) {
  this.x = x;
  this.y = y;
  this.speed = 5;
  this.dir = PI+d;
  this.size = 3;

  this.show = function () {
    fill(0);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
  }

  this.update = function () {
    this.x+=this.speed*sin(this.dir);
    this.y-=this.speed*cos(this.dir);
  }
}
