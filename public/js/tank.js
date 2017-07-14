//Tank Object
function Tank(x, y, col, id) {
  //Setup Variables
  this.id = id;

  this.x = x;
  this.y = y;
  this.speed = 1.5;
  this.dir = 0;
  this.gunDir = 0;
  this.color = col;

  this.size = 40;
  this.health = 100;

  //images
  this.body = loadImage("/assets/"+this.color+"_body.png");;
  this.gun  = loadImage("/assets/"+this.color+"_gun.png");;


  this.update = function () {
    //block going off the edge
    this.x = constrain(this.x, 0, width);
    this.y = constrain(this.y, 0, height);

    //apply damage on hit
    for (var i = 0; i < bullets.length; i++) {
      if(dist(bullets[i].x, bullets[i].y, this.x, this.y)<this.size/2){
        this.health -= 3;
        this.x += random(-2,2);
        this.y += random(-2,2);
        bullets.splice(i,1);
      }
    }

    //check for 0 health
    if(this.health <= 0){
      keys = [];
      this.health = 100;

      if(this == tank){
        // this = null;
        this.health = 100;
        this.x = random(width);
        this.y = random(height);

        alert("GAME OVER!!! YOU DIED!");
      }
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
    rect(0, -38, map(this.health, 0, 100, 0, 35), 2);

    rotate(this.dir);
    image(this.body, 0, 0, this.size/1.1, this.size);
    rotate(this.gunDir)
    image(this.gun, 0, -10, this.size/3.2, this.size)
    pop();
  }

  //fire bullets
  this.fire = function () {
    var bulletInfo = {
      x: this.x+22*sin(PI - this.dir - this.gunDir),
      y: this.y+22*cos(PI - this.dir - this.gunDir),
      dir: this.gunDir - PI+this.dir
    }

    bullets.push(new Bullet(bulletInfo.x, bulletInfo.y, bulletInfo.dir))
    socket.emit("shot", bulletInfo);
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
