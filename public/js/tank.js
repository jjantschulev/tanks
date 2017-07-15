//Tank Object
function Tank(x, y, id) {
  //Setup Variables
  this.id = id;

  //physics variables
  this.x = x;
  this.y = y;
  this.speed = 1.6;
  this.dir = 0;
  this.gunDir = 0;

  //visual vairables
  this.name = name;
  this.col = myColor;
  this.size = 40;
  this.health = 100;

  //images
  this.body = loadImage("/assets/"+this.col+"_body.png");
  this.gun  = loadImage("/assets/"+this.col+"_gun.png");

  //load correct images functions
  this.loadGun = function () {
    this.gun  = loadImage("/assets/"+this.col+"_gun.png");;
  }
  this.loadBody = function () {
    this.body = loadImage("/assets/"+this.col+"_body.png");;
  }


  this.update = function () {
    //block going off the edge
    this.x = constrain(this.x, 0, width);
    this.y = constrain(this.y, 0, height);

    //apply damage on hit
    for (var i = 0; i < bullets.length; i++) {
      if(dist(bullets[i].x, bullets[i].y, this.x, this.y)<this.size/2){
        this.health -= 3;
        this.x += random(-0.5,0.5);
        this.y += random(-0.5,0.5);
        // this.x += sin(bullets[i].dir);
        // this.y -= cos(bullets[i].dir);
        bullets.splice(i,1);
      }
    }

    //check for 0 health
    if(this.health <= 0){
      keys = [];
      if(this == tank){ // if this tank is the users one
        this.health = 100;
        this.x = random(width);
        this.y = random(height);
        alert("GAME OVER!!! YOU DIED!");
        socket.emit("newWorld");
      }
    }
  }

  this.show = function () {
    push(); // save matrix
    imageMode(CENTER);
    translate(this.x, this.y);

    //show health bar
    noStroke()
    fill(map(this.health, 0, 100, 255, 0), map(this.health, 0, 100, 0, 255), 0)
    rectMode(CENTER);
    rect(0, -38, map(this.health, 0, 100, 0, 35), 2);

    //show name
    fill(100);
    textSize(8);
    textAlign(CENTER);
    text(this.name, 0, -43);

    //show tank
    rotate(this.dir);
    image(this.body, 0, 0, this.size/1.1, this.size);
    rotate(this.gunDir)
    image(this.gun, 0, -this.size/4, this.size/3.2, this.size)
    pop(); // reset to saved matrix
  }

  //fire bullets
  this.fire = function () {
    var bulletInfo = {
      x: this.x+22*sin(PI - this.dir - this.gunDir),
      y: this.y+22*cos(PI - this.dir - this.gunDir),
      dir: this.gunDir - PI+this.dir
    }
    bullets.push(new Bullet(bulletInfo.x, bulletInfo.y, bulletInfo.dir)); //add this bullet to array
    socket.emit("shot", bulletInfo); //send new bullet data to server
  }
}


//bullet object
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

//block object
function Block(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.width = w;
  this.height = h;
  this.x2 = x+w;
  this.y2 = y+h;

  this.tankPreviousX = tank.x;
  this.tankPreviousY = tank.y;

  this.show = function () {
    noStroke();
    fill(51);
    rect(this.x, this.y, this.width, this.height);
  }

  this.update = function () {

    //stop tanks if they are hitting a block
    if(tank.x > this.x && tank.x < this.x2 && tank.y > this.y && tank.y < this.y2){
      tank.x = this.tankPreviousX;
      tank.y = this.tankPreviousY;
    }else{
      this.tankPreviousX = tank.x;
      this.tankPreviousY = tank.y;
    }

    //delete bullets if they are inside a block
    for (var i = 0; i < bullets.length; i++) {
      if(bullets[i].x > this.x && bullets[i].x < this.x2 && bullets[i].y > this.y && bullets[i].y < this.y2){
        bullets.splice(i, 1);
      }
    }
  }
}
