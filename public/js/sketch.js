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
var tank = new Tank();
var bullets = []

function setup() {
  createCanvas(600, 400);

  //load tank images
  tank.body = loadImage("assets/tank_"+tank.color+".png");
  tank.gun = loadImage("assets/gun_"+tank.color+".png");
}

function draw() {
  background(245);

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
  tank.show();


  //respond to held down keys events
  for (var i = 0; i < keys.length; i++) {
    keyPressLogic(keys[i]);
  }
}




function keyPressLogic(currentKey) {
  //what program does on different keys
  if(currentKey == 87){
    tank.x+=tank.speed*sin(tank.dir);
    tank.y-=tank.speed*cos(tank.dir);
  }
  if(currentKey == 83){
    tank.x-=tank.speed*sin(tank.dir);
    tank.y+=tank.speed*cos(tank.dir);
  }
  if(currentKey == 65){
    tank.dir-=0.08;
  }
  if(currentKey == 68){
    tank.dir+=0.08;
  }
  if(currentKey == 37){
    tank.gunDir-=0.08;
  }
  if(currentKey == 39){
    tank.gunDir+=0.08;
  }
  if (currentKey == 32) {
    if(frameCount % 8 == 0){
      tank.fire();
    }
  }
}
