var keys = []
window.addEventListener('keydown', function () {
  var addIt = true;
  console.log('keydown ' + event.which);
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
  console.log('keyup ' + event.which);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] == event.which) {
      keys.splice(i, 1);
    }
  }
});


var tank = {
  body: null,
  gun: null,
  x: 100,
  y: 100,
  speed: 2,
  dir: 0,
  gunDir: 0,
  color: "blue",


  update: function () {
    tank.x = constrain(tank.x, 0, width);
    tank.y = constrain(tank.y, 0, height);


    //Gun follows mouse
    // var x = mouseX - tank.x;
    // var y = mouseY - tank.y;
    // if(y < 0){
    //   tank.gunDir = -atan(x/y);
    // }else {
    //   tank.gunDir = PI-atan(x/y);
    // }

  },

  show: function () {
    imageMode(CENTER);
    translate(tank.x, tank.y);
    rotate(tank.dir);
    image(tank.body, 0, 0, 30, 30);
    rotate(tank.gunDir)
    image(tank.gun, 0, -8, 10, 30)
  }
}

function setup() {
  createCanvas(600, 400);
  tank.body = loadImage("assets/tank_"+tank.color+".png");
  tank.gun = loadImage("assets/gun_"+tank.color+".png");
}

function draw() {
  background(245);

  tank.update();
  tank.show();

  for (var i = 0; i < keys.length; i++) {
    keyPressLogic(keys[i]);
  }


}




function keyPressLogic(currentKey) {
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
}
