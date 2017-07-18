//setup color
var myColor = getRandomColor();

//initialise tank and bullets array
var tank;
var otherTanks = [];
var bullets = [];
var useAi = false;
var shootAi = false;
var blocks = [];
var healthPackets = [];
var explosions = [];

//setup name from cookies. this matches username in kraken chat
var name = Cookies.get('name');
if(name == "undefined"){
  name = prompt("What is you name");
  Cookies.set('name', name, {expires: 1});
}

function setup() {
  createCanvas(600, 600);
  //create users tank and tell server about new connected user
  tank = new Tank(random(width), random(height), "");
  socket.emit("newConnected");
  socket.emit("newWorld");

  frameRate(60);
}

function draw() {
  background(255);


  //show and update blocks
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].update();
    blocks[i].show();
  }

  //show health packets
  for (var i = 0; i < healthPackets.length; i++) {
    healthPackets[i].show();
  }

  //show and update bullets
  for (var i = bullets.length-1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].show();
    //splice bullets if off screen
    if(bullets[i].x < -bullets[i].size || bullets[i].x > width+bullets[i].size){
      bullets.splice(i, 1);
    }else if(bullets[i].y < -bullets[i].size || bullets[i].y > width+bullets[i].size){
      bullets.splice(i, 1);
    }
  }

  //apply the ai's rules to the users tank
  if(useAi){
     ai(tank);
  }
  //update tank
  tank.update();
  tank.show();

  for (var i = 0; i < otherTanks.length; i++) {
    otherTanks[i].update();
    if (otherTanks[i].id != socket.id) {
      otherTanks[i].show();
    }
  }

  //show explosions
  for (var i = explosions.length-1; i >= 0; i--) {
    explosions[i].use();
    if(explosions[i].timer < 0){
      explosions.splice(i, 1);
    }
  }

  //respond to held down keys events
  if (!tank.deactivated) {
    for (var i = 0; i < keys.length; i++) {
      keyPressLogic(keys[i], tank);
    }
  }


  //show you died screen

  if(tank.deactivated){
    var seconds = tank.deactivatedTimer / 60;
    fill(0, 97);
    rect(0, 0, width, height);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(50);
    text("YOU DIED", width/2, height/2 - 30);
    textSize(25);
    text("respawning in " + Math.ceil(seconds) + " seconds.", width/2, height/2 + 30);
  }

}

//what program does on different keys
function keyPressLogic(currentKey, t) {
  if(currentKey == 87){
    //w
    t.x+=t.speed*sin(t.dir);
    t.y-=t.speed*cos(t.dir);
  }
  if(currentKey == 83){
    //s
    t.x-=t.speed/2*sin(t.dir);
    t.y+=t.speed/2*cos(t.dir);
  }
  if(currentKey == 65  || currentKey == 75){
    //a
    t.dir-=0.05;
  }
  if(currentKey == 68  || currentKey == 76){
    //d
    t.dir+=0.05;
  }
  if(currentKey == 37){
    //LEFT ARROW
    t.gunDir-=0.028;
  }
  if(currentKey == 39){
    //RIGHT ARROW
    t.gunDir+=0.028;
  }
  if (currentKey == 32) {
    //SPACE BAR
    if (tank.gunReloaded <= 0) {
      tank.fire();
      if(tank.bulletType == 20){tank.gunReloaded = 280}
      if(tank.bulletType == 10){tank.gunReloaded = 100}
      if(tank.bulletType == 3){tank.gunReloaded = 18}
      if(tank.bulletType == 1){tank.gunReloaded = 8}
    }
  }
}

//get a random tank colour
function getRandomColor() {
  var colors = ["purple", "red", "green", "yellow"];
  var c = colors[Math.floor(Math.random()*4)];
  return c;
}


//sync our tank data with server
setInterval(function () {
  data = {
    x: tank.x,
    y: tank.y,
    dir: tank.dir,
    gunDir: tank.gunDir,
    health: tank.health,
    name: tank.name,
    col: tank.col,
    deactivated: tank.deactivated
  }
  socket.emit("sync", data)
}, 40)

//add tank on new connection
socket.on("newConnected", function (len) {
  otherTanks = [];
  for (var i = 0; i < len; i++) {
    otherTanks.push(new Tank(0, 0, ""));
  }
});

//apply new world
socket.on("newWorld", function (id) {
  blocks = [];
  createBlocks(id);
});

//delete tank on disconnect
socket.on("userDisconnected", function (id) {
  for (var i = 0; i < otherTanks.length; i++) {
    if(otherTanks[i].id == id){
      otherTanks.splice(i,1);
    }
  }
});

// add bullets from other users
socket.on("shot", function (data) {
  bullets.push(new Bullet(data.x, data.y, data.dir, data.owner, data.type))
})

//this is to update the colours
socket.on("initial-update", function (data) {
  for (var i = 0; i < otherTanks.length; i++) {
    otherTanks[i].col = data[i].col;
    otherTanks[i].loadGun();
    otherTanks[i].loadBody();
  }
})

//this is executed at 26 fps and recieves data from the server about
socket.on("update", function (tanks) {
  for (var i = 0; i < otherTanks.length; i++) {
    otherTanks[i].x = tanks[i].x;
    otherTanks[i].y = tanks[i].y;
    otherTanks[i].dir = tanks[i].dir;
    otherTanks[i].gunDir = tanks[i].gunDir;
    otherTanks[i].health = tanks[i].health;
    otherTanks[i].id = tanks[i].id;
    otherTanks[i].name = tanks[i].name;
    otherTanks[i].deactivated = tanks[i].deactivated;
  }
});
//add health packets
socket.on("new_health_packet", function (data) {
  healthPackets.push(new HealthPacket(data.x, data.y));
})
// remove health packets
socket.on("remove_health_packet", function (index) {
  for (var i = 0; i < healthPackets.length; i++) {
    if (healthPackets[i] == index) {
      healthPackets.splice(i, 1);
    }
  }
});

socket.on("reset-health", function () {
  tank.health = 100;
})

// AI STUFF
function ai(ai) {
  ct = findClosestTank(ai);
  if(ct == null){
    return;
  }
  if(shootAi){
    keyPressLogic(32, ai);
  }

  var angleToPlayer = 0;
  var x = ct.x - ai.x;
  var y = ct.y - ai.y;
  if(y < 0){
    angleToPlayer = -atan(x/y);
  }else {
    angleToPlayer = PI-atan(x/y);
  }

  if(ai.gunDir + ai.dir < angleToPlayer){
    keyPressLogic(39, ai)
  }else{
    keyPressLogic(37, ai)
  }
}

//find the closest tank to the player
function findClosestTank(t) {
  var ct = null;
  var d = Infinity;
  if (otherTanks.length > 1) {
    for (var i = 0; i < otherTanks.length; i++) {
      var newD = dist(otherTanks[i].x, otherTanks[i].y, t.x, t.y);
      if(newD < d && newD > 10){
        d = newD;
        ct = otherTanks[i];
      }
    }
  }
  return ct;
}

//Create Array of held down keys
var keys = []
window.addEventListener('keydown', function () {
  var addIt = true;
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] == event.which) {
      addIt = false;
    }
  }
  if (addIt) {
    keys.push(event.which);
  }

  if (tank !== null && !tank.deactivated) {
    //change bullet type of tank
    if (event.which == 49){tank.bulletType = 1;}
    if (event.which == 50){tank.bulletType = 3;}
    if (event.which == 51){tank.bulletType = 10;}
    if (event.which == 52){tank.bulletType = 20;}
  }

});
window.addEventListener('keyup', function () {
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] == event.which) {
      keys.splice(i, 1);
    }
  }
});


function createBlocks(index) {
  switch (index) {
    case 0:
      //double l
      blocks.push(new Block(100, 150, 200, 20));
      blocks.push(new Block(300,450, 200, 20));
      blocks.push(new Block(300,150, 20, 100));
      blocks.push(new Block(300, 350, 20, 100));
      break;
    case 1:
      //dotted line
      blocks.push(new Block(100, 140, 80, 20));
      blocks.push(new Block(200, 140, 80, 20));
      blocks.push(new Block(300, 140, 80, 20));
      blocks.push(new Block(400, 140, 80, 20));
      blocks.push(new Block(100, 440, 80, 20));
      blocks.push(new Block(200, 440, 80, 20));
      blocks.push(new Block(300, 440, 80, 20));
      blocks.push(new Block(400, 440, 80, 20));
      break;
    case 2:
      //plus
      blocks.push(new Block(140,50,20,200));
      blocks.push(new Block(50,140,200,20));
      blocks.push(new Block(140,350,20,200));
      blocks.push(new Block(50,440,200,20));
      blocks.push(new Block(440,50,20,200));
      blocks.push(new Block(350,140,200,20));
      blocks.push(new Block(440,350,20,200));
      blocks.push(new Block(350,440,200,20));
      break;
    case 3:
      //shutter
      blocks.push(new Block(100,100,150,20));
      blocks.push(new Block(100,100, 20, 150));
      blocks.push(new Block(350,500, 150,20));
      blocks.push(new Block(500,370, 20,150));
      blocks.push(new Block(220,200,180,20));
      blocks.push(new Block(400,200,20,100));
      blocks.push(new Block(220,280,20,100));
      blocks.push(new Block(220,360,180,20));
      break;
    case 4:
      //ppp-pokerface
      blocks.push(new Block(100,100,40,40));
      blocks.push(new Block(350,220,50,50));
      blocks.push(new Block(160,280,44,44));
      blocks.push(new Block(440,440,60,60));
      blocks.push(new Block(500,120,42,42));
      blocks.push(new Block(120,480,45,45));
      blocks.push(new Block(300,80,51,51));
      blocks.push(new Block(270,510,40,40));
      break;
    case 5:
      //vertical lines
      blocks.push(new Block(100, 100, 20, 150));
      blocks.push(new Block(100, 350, 20, 150));
      blocks.push(new Block(500, 100, 20, 150));
      blocks.push(new Block(500, 350, 20, 150));
      blocks.push(new Block(300, 200, 20, 200));
      break;
  }
}
