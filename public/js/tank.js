//Tank Object
function Tank(x, y, id) {
  //Setup Variables
  this.id = id;

  //physics variables
  this.x = x;
  this.y = y;
  this.speed = 1.8;
  this.dir = 0;
  this.gunDir = 0;

  //visual vairables
  this.name = name;
  this.col = myColor;
  this.size = 40;
  this.health = 100;
  this.bulletType = 3;
  this.gunReloaded = 0;
  this.deactivated = false;
  this.deactivatedTimer = 0;

  //images
  this.body = loadImage("/assets/"+this.col+"_body.png");
  // this.greyBody = loadImage("/assets/"+this.col+"_body_grey.png");
  this.gun  = loadImage("/assets/gun.png");

  //load correct images functions
  this.loadGun = function () {
    this.gun  = loadImage("/assets/gun.png");;
  }
  this.loadBody = function () {
    this.body = loadImage("/assets/"+this.col+"_body.png");
    // this.greyBody = loadImage("/assets/"+this.col+"_body_grey.png");
  }


  this.update = function () {
    //block going off the edge
    this.x = constrain(this.x, 0, width);
    this.y = constrain(this.y, 0, height);

    if (this == tank) {
      if (this.deactivatedTimer > 0) {
        this.deactivated = true;
        this.deactivatedTimer--;
      }else{
        this.deactivated = false;
      }
    }

    if(this.deactivated){
      return;
    }

    //reload gun
    this.gunReloaded --;

    //eat health packets
    for (var i = 0; i < healthPackets.length; i++) {
      if(dist(this.x, this.y, healthPackets[i].x, healthPackets[i].y)<healthPackets[i].size){
        this.health += 10;
        if (this.health > 100) {
          this.health = 100;
        }
        healthPackets.splice(i,1);
        socket.emit("remove_health_packet", i);
      }
    }

    //apply damage on hit
    for (var i = 0; i < bullets.length; i++) {
      if(dist(bullets[i].x, bullets[i].y, this.x, this.y)<this.size/2){
        this.health -= bullets[i].type; //subtract health
        explosions.push(new Explosion(bullets[i].x, bullets[i].y, bullets[i].size));//make Explosion
        //check if we died
        if(this.health <= 0){
          this.health = 100;
          keys = [];
          if(this == tank){ // if this tank is the users one
            this.health = 100;
            this.x = random(width);
            this.y = random(height);
            deathData = {
              name: this.name.toLowerCase(),
              killer: bullets[i].owner.toLowerCase()
            }
            socket.emit("death", deathData);
            socket.emit("newWorld");
            this.deactivatedTimer = 600;
          }
        }

        //move tank on bullet hit
        if (bullets[i].type == 20) {
          this.x += 20*bullets[i].type*sin(bullets[i].dir);
          this.y -= 20*bullets[i].type*cos(bullets[i].dir);
        }else {
          this.x += 0.5*bullets[i].type*sin(bullets[i].dir);
          this.y -= 0.5*bullets[i].type*cos(bullets[i].dir);
        }
        bullets.splice(i,1);

      }
    }
  }

  this.show = function () {
    if(this.deactivated){return;}

    push(); // save matrix
    imageMode(CENTER);
    translate(this.x, this.y);

    //show health bar
    noStroke()
    if (this.deactivated) {
      fill(120);
    }else{
      fill(map(this.health, 0, 100, 255, 0), map(this.health, 0, 100, 0, 255), 0);
    }
    rectMode(CENTER);
    rect(0, -35, map(this.health, 0, 100, 0, 35), 2);

    //show gun reloading bar
    if(this.gunReloaded >= 0){
      fill(100);
      rect(0, -30, map(this.gunReloaded, 0, 120, 0, 30), 1);
    }

    //show name
    fill(100);
    textSize(8);
    textAlign(CENTER);
    text(this.name, 0, -40);

    //show tank
    rotate(this.dir);
    if(this.deactivated){
      // image(this.greyBody, 0, 0, this.size, this.size);
    }else {
      image(this.body, 0, 0, this.size, this.size);
    }
    rotate(this.gunDir)
    image(this.gun, 0, -this.size/4, this.size, this.size)
    pop(); // reset to saved matrix
  }

  //fire bullets
  this.fire = function () {
    var bulletInfo = {
      x: this.x+22*sin(PI - this.dir - this.gunDir),
      y: this.y+22*cos(PI - this.dir - this.gunDir),
      dir: this.gunDir - PI+this.dir,
      owner: this.name,
      type: this.bulletType
    }
    // bullets.push(new Bullet(bulletInfo.x, bulletInfo.y, bulletInfo.dir)); //add this bullet to array
    socket.emit("shot", bulletInfo); //send new bullet data to server
  }
}


//bullet object
function Bullet(x, y, d, owner, type) {
  this.x = x;
  this.y = y;
  this.speed = 4;
  this.dir = PI+d;
  this.size = type;

  this.owner = owner;
  this.type = type;

  if (this.type == 3) {
    this.size = 5;
  } else if (this.type == 1) {
    this.size = 3;
  }

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
    //prevent getting stuck in a block
    if(this.tankPreviousX + tank.size/3 >= this.x && this.tankPreviousX - tank.size/3 <= this.x2 && this.tankPreviousY + tank.size/3 >= this.y && this.tankPreviousY - tank.size/3 <= this.y2){
      this.tankPreviousX = random(width);
      this.tankPreviousY = random(height);
    }

    //stop tanks if they are hitting a block
    if(tank.x + tank.size/3 > this.x && tank.x - tank.size/3 < this.x2 && tank.y + tank.size/3 > this.y && tank.y - tank.size/3 < this.y2){
      tank.x = this.tankPreviousX;
      tank.y = this.tankPreviousY;
    }else{
      this.tankPreviousX = tank.x;
      this.tankPreviousY = tank.y;
    }

    //delete bullets if they are inside a block
    for (var i = 0; i < bullets.length; i++) {
      if(bullets[i].x > this.x && bullets[i].x < this.x2 && bullets[i].y > this.y && bullets[i].y < this.y2){
        explosions.push(new Explosion(bullets[i].x, bullets[i].y, bullets[i].size));//make Explosion
        bullets.splice(i, 1);
      }
    }
  }
}

function HealthPacket(x, y) {
  this.x = x;
  this.y = y;
  this.size = 20;
  this.show = function () {
    fill(0, 255, 0);
    noStroke();
    rectMode(CENTER);
    rect(this.x, this.y, this.size, this.size/4);
    rect(this.x, this.y, this.size/4, this.size);
    rectMode(CORNER);
  }
}


//make explosions
function Explosion(x, y, s) {
  this.x = x;
  this.y = y;
  this.timer = 20;
  this.size = s;
  this.alpha = 100;

  this.use = function () {
    this.size++;
    this.timer--;
    this.alpha -= 5;
    fill(255, 150, 0, this.alpha);
    ellipse(this.x, this.y, this.size, this.size);
  }
}
