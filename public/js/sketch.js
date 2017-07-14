//setup color
var myColor = "yellow";

//setup name
var name = Cookies.get('name');
if(name == "undefined"){
  name = prompt("What is you name");
  Cookies.set('name', name, {expires: 1});
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
});
window.addEventListener('keyup', function () {
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] == event.which) {
      keys.splice(i, 1);
    }
  }
});

//initialise tank and bullets array
var tank;
var otherTanks = [];
var bullets = [];

function setup() {
  var canvas = createCanvas(600, 600);
  canvas.parent("game");
  tank = new Tank(random(width), random(height), "");
  socket.emit("newConnected");
}

function draw() {
  background(255);

  //show and update bullets
  for (var i = bullets.length-1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].show();
    if(bullets[i].x < -bullets[i].size || bullets[i].x > width+bullets[i].size){
      bullets.splice(i, 1);
    }else if(bullets[i].y < -bullets[i].size || bullets[i].y > width+bullets[i].size){
      bullets.splice(i, 1);
    }
  }

  // Show and update Tank
  tank.update();
  // tank.show();

  for (var i = 0; i < otherTanks.length; i++) {
    otherTanks[i].update();
    otherTanks[i].show();
  }

  //show ai player
  // useAi(tank);
  // ai.update();
  // ai.show();

  //respond to held down keys events
  for (var i = 0; i < keys.length; i++) {
    keyPressLogic(keys[i], tank);
  }

  //send data to server
  // var data = {
  //   x: tank.x,
  //   y: tank.y,
  //   dir: tank.dir,
  //   gunDir: tank.gunDir
  // }
}

function keyPressed() {
  if(key == ' '){
    tank.fire();
  }
}


function keyPressLogic(currentKey, t) {
  //what program does on different keys
  if(currentKey == 87){
    t.x+=t.speed*sin(t.dir);
    t.y-=t.speed*cos(t.dir);
  }
  if(currentKey == 83){
    t.x-=t.speed*sin(t.dir);
    t.y+=t.speed*cos(t.dir);
  }
  if(currentKey == 65){
    t.dir-=0.06;
  }
  if(currentKey == 68){
    t.dir+=0.06;
  }
  if(currentKey == 37){
    t.gunDir-=0.03;
  }
  if(currentKey == 39){
    t.gunDir+=0.03;
  }
  if (currentKey == 32) {
    if(frameCount % 8 == 0){
      t.fire();
    }
  }
}

function getRandomColor() {
  var colors = ["yellow", "purple", "red", "green", "blue"];
  var c = colors[Math.floor(Math.random()*2)];
  return c;
}



//server connection data transfer
setInterval(function () {
  data = {
    x: tank.x,
    y: tank.y,
    dir: tank.dir,
    gunDir: tank.gunDir,
    health: tank.health,
    color: tank.color,
    name: tank.name
  }
  socket.emit("sync", data)
}, 38)

socket.on("newConnected", function (l) {
  otherTanks = [];
  for (var i = 0; i < l; i++) {
    otherTanks.push(new Tank(0, 0, ""));
  }
});

socket.on("userDisconnected", function (id) {
  for (var i = 0; i < otherTanks.length; i++) {
    if(otherTanks[i].id == id){
      otherTanks.splice(i,1);
    }
  }
});

// add bullets from other users
socket.on("shot", function (data) {
  bullets.push(new Bullet(data.x, data.y, data.dir))
})

socket.on("update", function (tanks) {
  for (var i = 0; i < otherTanks.length; i++) {
    otherTanks[i].x = tanks[i].x;
    otherTanks[i].y = tanks[i].y;
    otherTanks[i].dir = tanks[i].dir;
    otherTanks[i].gunDir = tanks[i].gunDir;
    otherTanks[i].health = tanks[i].health;
    otherTanks[i].id = tanks[i].id;
    otherTanks[i].name = tanks[i].name;
    otherTanks[i].color = tanks[i].color;
  }
});
