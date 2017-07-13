
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
// var ai;



var bullets = [];

function setup() {
  createCanvas(600, 400);

  tank = new Tank(random(width), random(height), getRandomColor());
  // ai = new Tank(random(width), random(height), getRandomColor());
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


  //show ai player
  // useAi();
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

function useAi() {
  if(dist(ai.x, ai.y, tank.x, tank.y) > 100){
    keyPressLogic(87, ai);
  }else {
    keyPressLogic(83, ai);
  }
  if(random()<0.3){
    keyPressLogic(32, ai);
  }

  var angleToPlayer = 0;
  var x = tank.x - ai.x;
  var y = tank.y - ai.y;
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

  if(ai.dir < angleToPlayer){
    keyPressLogic(68, ai)
  }else{
    keyPressLogic(65, ai)
  }
  // ai.gunDir = angleToPlayer;

}

function getRandomColor() {
  var colors = ["red", "green", "blue"];
  var c = colors[Math.floor(Math.random()*3)];
  console.log(c);
  return c;
}
