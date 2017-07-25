var THEME = "light";

if(window.location.href.substring(window.location.href.length-5) == "#dark"){
  THEME = "dark"
}else {
  THEME = "light"
}

var WALL_COLOR, MINE_COLOR, BACKGROUND_IMAGE, BULLET_COLOUR, NAME_COLOUR;

//setup color
var tankColours = ['yellow', 'red', 'green', 'purple'];
var myColor = getRandomColor();
var chosenColour = Cookies.get('tankColour');
if(chosenColour == undefined){
  chosenColour = "";
}else{
  myColor = chosenColour;
}

if(THEME == "dark"){
  chosenColour = "dark"
}

//initialise tank and bullets array
var tank;
var otherTanks = [];
var bullets = [];
var useAi = false;
var shootAi = false;
var blocks = [];
var healthPackets = [];
var explosions = [];
var landmines = [];
var tripods = [];
var blueBombs = [];

var previewImages;
var tankDeathExplosions = [];

//setup name from cookies. this matches username in kraken chat
var name = Cookies.get('name');
if(name == "undefined"){
  name = prompt("What is you name");
  Cookies.set('name', name, {expires: 1});
}

function preload() {
  previewImages = [loadImage("/assets/yellow_tank.png"), loadImage("/assets/red_tank.png"), loadImage("/assets/green_tank.png"),loadImage("/assets/purple_tank.png")];
}

function setup() {
  createCanvas(600, 600);
  //create users tank and tell server about new connected user
  tank = new Tank(random(width), random(height), "");
  socket.emit("newConnected", name);
  // socket.emit("newWorld");

  theme(THEME);
  frameRate(60);
  // yellow = loadImage("/assets/yellow_tank.png");


  BACKGROUND_IMAGE = loadImage("/assets/camo"+Math.ceil(Math.random()*2)+".jpg");
}

function draw() {
  background(255);

  if(THEME == "dark"){
    image(BACKGROUND_IMAGE, 0, 0, width, height);
  }

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

  for (var i = landmines.length-1; i >= 0; i--) {
    landmines[i].show();
    if(landmines[i].timer < 0){
      landmines[i].explode();
    }
  }

  for (var i = tripods.length-1; i >= 0; i--) {
    tripods[i].ai();
    tripods[i].show();
    if(tripods[i].timer < 0){
      tripods.splice(i, 1);
    }
  }

  for (var i = 0; i < blueBombs.length; i++) {
    blueBombs[i].use();
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

  for (var i = 0; i < tankDeathExplosions.length; i++) {
    tankDeathExplosions[i].show();
  }

  //respond to held down keys events
  if (!tank.deactivated) {
    for (var i = 0; i < keys.length; i++) {
      keyPressLogic(keys[i], tank);
    }
  }

  showAmmoInfo();

  //show you died screen

  if(tank.deactivated && !chosenColour == ""){
    var seconds = tank.deactivatedTimer / 60;
    fill(0, 150);
    rect(0, 0, width, height);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(50);
    text("YOU DIED", width/2, height/2 - 30);
    textSize(25);
    text("respawning in " + Math.ceil(seconds) + " seconds.", width/2, height/2 + 30);
  }
  if (chosenColour == "") {
    tank.deactivatedTimer = 4;
    fill(255, 210);
    rect(0, 0, width, height);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(25);
    text("Please choose you tank colour", width/2, height/2 - 30);
    imageMode(CENTER);
    if("THEME" == "dark"){

    }else{
      for (var i = 0; i < previewImages.length; i++) {
        var x=(i*(width/4))+width/8;
        var y=height/2 + 100;
        var d = dist(mouseX*0.667, mouseY*0.667, x, y);
        if(d<150){
          rectMode(CENTER);
          fill(100, 100-d/1.2);
          rect(x, y, constrain(d*3, 150, 600), constrain(d*3, 150, 600), 20);
          rectMode(CORNER);
          if (mouseIsPressed && d < 60) {
            chosenColour = tankColours[i];
            Cookies.set('tankColour', tankColours[i], {expires: 365});
            window.location.reload();
          }
        }
        image(previewImages[i], x, y, width/4, height/4);
      }
    }
  }

}

//what program does on different keys
function keyPressLogic(currentKey, t) {
  if(currentKey == 87){
    //w
    t.xVel =  t.speed*sin(t.dir);
    t.yVel = -t.speed*cos(t.dir);
  }
  if(currentKey == 83){
    //s
    t.xVel = -t.speed*0.9*sin(t.dir);
    t.yVel =  t.speed*0.9*cos(t.dir);
  }
  if(currentKey == 65  || currentKey == 75){
    //a
    t.dir-=0.05;
  }
  if(currentKey == 68  || currentKey == 76){
    //d
    t.dir+=0.05;
  }
  if(currentKey == 37  || currentKey == 81){
    //LEFT ARROW
    t.gunDir-=0.028;
  }
  if(currentKey == 39  || currentKey == 69){
    //RIGHT ARROW
    t.gunDir+=0.028;
  }
  if (currentKey == 32) {
    //SPACE BAR
    if(tank.gunReloaded1 <= 0 && tank.bulletType == 1){
      tank.fire();
      tank.gunReloaded1 = 5
    }
    if(tank.gunReloaded2 <= 0 && tank.bulletType == 3){
      tank.fire();
      tank.gunReloaded2 = 18
    }
    if(tank.gunReloaded3 <= 0 && tank.bulletType == 10){
      tank.fire();
      tank.gunReloaded3 = 100
    }
    if(tank.gunReloaded4 <= 0 && tank.bulletType == 20){
      tank.fire();
      tank.gunReloaded4 = 420
    }
  }
}

function onKeydownLogic(currentKey) {
  if (currentKey == 78) {
    //n
    if (tank.blueBombAmount > 0) {
      tank.dropBlueBomb();
    }
  }
  if (currentKey == 77) {
    //m
    if (tank.amountOfLandmines > 0) {
      tank.dropLandmine();
    }
  }

  if (currentKey == 66) {
    //b
    if (tank.pulsesAmount > 0) {
      tank.dropPulse();
    }
  }

  if (currentKey == 86) {
    //v
    if (tank.tripodAmount > 0) {
      tank.dropTripod();
    }
  }

  if (tank !== null && !tank.deactivated) {
    //change bullet type of tank
    if (event.which == 49){tank.bulletType = 1;}
    if (event.which == 50){tank.bulletType = 3;}
    if (event.which == 51){tank.bulletType = 10;}
    if (event.which == 52){tank.bulletType = 20;}
  }

  if(currentKey == 90){
    //z
  }
}

//get a random tank colour
function getRandomColor() {
  var c = tankColours[Math.floor(Math.random()*tankColours.length)];
  return c;
}

function w() {
  socket.emit("newWorld", true);
}



function showAmmoInfo() {
  for (var i = 0; i < tank.pulsesAmount; i++) {
    noStroke();
    fill(0, 255, 150);
    rect(0, i*4, 4, 4);
  }

  for (var i = 0; i < tank.amountOfLandmines; i++) {
    noStroke();
    fill(255, 150, 0);
    rect(4, i*4, 4, 4);
  }

  for (var i = 0; i < tank.blueBombAmount; i++) {
    noStroke();
    fill(70, 167, 242);
    rect(8, i*4, 4, 4);
  }

  for (var i = 0; i < tank.tripodAmount; i++) {
    noStroke();
    fill(51);
    rect(12, i*4, 4, 4);
  }
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
}, 40);

//save user data

setInterval(function () {
  data = {
    name: tank.name,
    landmineAmount: tank.amountOfLandmines,
    blueBombAmount: tank.blueBombAmount,
    tripodAmount: tank.tripodAmount,
    pulsesAmount: tank.pulsesAmount
  }
  socket.emit("save-user-data", data);
}, 2000);

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

socket.on("pulse", function (data) {
  setTimeout(function () {
    var p = new Pulse(data.x, data.y);
    p.use();
  }, 45)
})

socket.on("landmine", function (data) {
  landmines.push(new Landmine(data.x, data.y, data.name));
})

socket.on("tripod", function (data) {
  tripods.push(new Tripod(data.x, data.y, data.owner));
})

socket.on("blue-bomb", function (data) {
  blueBombs.push(new BlueBomb(data.x, data.y, data.owner));
})

socket.on("blue-bomb-explode", function (data) {
  for (var i = 0; i < blueBombs.length; i++) {
    if (blueBombs[i].x == data.x && blueBombs[i].y == data.y && blueBombs[i].ownerName == data.owner) {
      blueBombs[i].explode();
    }
  }
})

//this is to update the colours
socket.on("initial-update", function (data) {
  for (var i = 0; i < data.t.length; i++) {
    otherTanks[i].col = data.t[i].col;
    otherTanks[i].loadGun();
    otherTanks[i].loadBody();
  }
  if(data.name == name){
    tank.amountOfLandmines = data.landmineAmount;
    tank.blueBombAmount = data.blueBombAmount;
    tank.tripodAmount = data.tripodAmount;
    tank.pulsesAmount = data.pulsesAmount;
  }
});

socket.on("color", function (tanks) {
  for (var i = 0; i < tanks.length; i++) {
    otherTanks[i].col = tanks[i].col;
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
  if(random()<0.7){tank.tripodAmount += 1;}
  tank.blueBombAmount += 2;
  tank.amountOfLandmines += 2;
  tank.pulsesAmount += 2;
});

socket.on("suicide", function () {
  tank.health = 70;
  tank.tripodAmount -= 1;
  tank.blueBombAmount -= 2;
  tank.amountOfLandmines -= 2;
  tank.pulsesAmount -= 2;
});

socket.on("tankDeath", function (deathData) {
  for (var i = 0; i < otherTanks.length; i++) {
    if(otherTanks[i].name == deathData.name){
      tankDeathExplosions.push(new tankDeathExplosion(otherTanks[i].x, otherTanks[i].y));
    }
  }
})



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

  onKeydownLogic(event.which);

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

function theme(t) {
  THEME = t;
  if(THEME == "dark"){
    document.body.style.backgroundColor = "black";

    WALL_COLOR = "rgb(0, 119, 17)"
    BULLET_COLOUR = "rgb(200, 0, 0)"
    MINE_COLOR = "rgb(10,10,10)"
    NAME_COLOUR = "rgb(255, 255, 255)"

    var chat=document.getElementById("chat");
    if(chat != null){
      var clone=chat.cloneNode(true);
      clone.setAttribute('src',"http://jantschulev.ddns.net:3001");
      chat.parentNode.replaceChild(clone,chat);
    }
    tank.loadGun();
    tank.loadBody();
  }else{
    document.body.style.backgroundColor = "rgb(245,245,245)";

    WALL_COLOR = "rgb(51,51,51)"
    BULLET_COLOUR = "rgb(51,51,51)"
    MINE_COLOR = "rgb(248,248,248)"
    NAME_COLOUR = "rgb(51,51,51)"

    var chat=document.getElementById("chat");
    if(chat != null){
      var clone=chat.cloneNode(true);
      clone.setAttribute('src',"http://jantschulev.ddns.net:3001/?=w");
      chat.parentNode.replaceChild(clone,chat)
    }

    tank.loadGun();
    tank.loadBody();

  }
}
