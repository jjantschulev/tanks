//Tank Object
function Tank(x, y, col) {
  //Setup Variables


  this.x = x;
  this.y = y;
  this.speed = 1.5;
  this.dir = 0;
  this.gunDir = 0;
  this.color = col;

  this.size = 30;
  this.health = 100;

  //images
  this.body = loadImage("/assets/tank_"+this.color+".png");;
  this.gun  = loadImage("/assets/gun_"+this.color+".png");;


  this.update = function () {
    //block going off the edge
    this.x = constrain(this.x, 0, width);
    this.y = constrain(this.y, 0, height);

    //apply damage
    for (var i = 0; i < bullets.length; i++) {
      if(dist(bullets[i].x, bullets[i].y, this.x, this.y)<this.size/2){
        this.health -= 1;
        bullets.splice(i,1);
      }
    }

    //check for 0 health
    if(this.health <= 0){
      alert("GAME Over, "+this.color+" has died!");
      keys = [];
      this.health = 100;
      this.x = random(width);
      this.y = random(height);
    }

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

    //show health bar
    noStroke()
    fill(map(this.health, 0, 100, 255, 0), map(this.health, 0, 100, 0, 255), 0)
    rectMode(CENTER);
    rect(0, -30, map(this.health, 0, 100, 0, 30), 3, 3);

    rotate(this.dir);
    image(this.body, 0, 0, this.size/1.2, this.size);
    rotate(this.gunDir)
    image(this.gun, 0, -8, this.size/3.2, this.size)
    pop();
  }

  //fire bullets
  this.fire = function () {
    bullets.push(new Bullet(this.x+22*sin(PI - this.dir - this.gunDir), this.y+22*cos(PI - this.dir - this.gunDir), this.gunDir - PI+this.dir))
    data = {
      x: this.x,
      y: this.y,
      dir: this.dir,
      gunDir: this.gunDir
    }
  }
}

function Bullet(x, y, d) {
  this.x = x;
  this.y = y;
  this.speed = 4;
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

//add bullets from other users
// socket.on("shot", function (data) {
//   bullets.push(new Bullet(data.x, data.y, data.gunDir - PI+data.dir))
// })
