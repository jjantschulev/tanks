const PORT = 3012;
var fs = require('fs');

//setup up standard static file server to send HTML, JS, CSS file to client
var express = require('express');
var app = express();
var server = app.listen(PORT);
app.use(express.static('public'))
console.log('server running on port: ' + PORT);

//import socket.io library into io variable
var io = require('socket.io')(server);

//game Variables
var tanks = [];
var scores = JSON.parse(fs.readFileSync('scores.json', 'utf8'));

//when new user connects:
io.on('connection', function (socket) {
  // add a new tank object to the server array
  tanks.push(
    {id:socket.id,x:0,y:0,dir:0,gunDir:0,health:100,name:"anonym",col:"purple"}
  );

  //send tank data to clients
  setInterval(function () {
    socket.emit("update", tanks)
    socket.broadcast.emit("update", tanks)
  }, 38);

  //send health packets to clients
  setInterval(function () {
    if(Math.random() < 0.001){
      var data = {
        x: Math.random() * 600,
        y: Math.random() * 600
      }
      socket.emit("new_health_packet", data)
      socket.broadcast.emit("new_health_packet", data)
    }
  }, 1000);

  //tell client they have sucessfully connected
  socket.on("newConnected", function () {
    socket.emit("newConnected", tanks.length)
    socket.broadcast.emit("newConnected", tanks.length);

    setTimeout(function () {
      socket.emit("initial-update", tanks)
      socket.broadcast.emit("initial-update", tanks)
    }, 80);

  })

  //handout new world
  socket.on("newWorld", function () {
    var blocksId = Math.floor(Math.random()*6)
    socket.emit("newWorld", blocksId)
    socket.broadcast.emit("newWorld", blocksId);
  })

  // sync data from client tank with server tanks array
  socket.on('sync', function (data) {
    for (var i = 0; i < tanks.length; i++) {
      if(tanks[i].id == socket.id){
        tanks[i].x = data.x;
        tanks[i].y = data.y;
        tanks[i].dir = data.dir;
        tanks[i].gunDir = data.gunDir;
        tanks[i].health = data.health;
        tanks[i].name = data.name;
        tanks[i].col = data.col;
      }
    }
  });

  //send data from bullets on one client to everyone
  socket.on("shot", function (data) {
    socket.broadcast.emit("shot", data)
    socket.emit("shot", data)
  })

  //when a client dies
  socket.on("death", function (deathData) {
    // console.log(data.killer +" has killed " + data.name);
    var foundKillerMatch = false;
    var foundLostMatch = false;
    for (var i = 0; i < scores.length; i++) {
      if (scores[i].name == deathData.killer) {
        scores[i].won += 1;
        foundKillerMatch = true;
      }
      if (scores[i].name == deathData.name) {
        scores[i].lost += 1;
        foundLostMatch = true;
      }
    }

    if (!foundKillerMatch) {
      var newPerson = {
        name: deathData.killer,
        lost: 0,
        won: 1
      }
      scores.push(newPerson);
    }
    if (!foundLostMatch) {
      var newPerson = {
        name: deathData.name,
        lost: 1,
        won: 0
      }
      scores.push(newPerson);
    }
    dataToWrite = JSON.stringify(scores);
    fs.writeFile("scores.json", dataToWrite, function(err) {
      if(err) {
        return console.log(err);
      }
    });
  });

  socket.on("remove_health_packet", function (index) {
    socket.broadcast.emit("remove_health_packet", index)
    socket.emit("remove_health_packet", index)
  })

  // remove clients tank on disconnect
  socket.on('disconnect', function () {
    for (var i = 0; i < tanks.length; i++) {
      if(tanks[i].id == socket.id){
        socket.broadcast.emit("userDisconnected", socket.id)
        socket.emit("userDisconnected", socket.id)
        tanks.splice(i, 1);
      }
    }
  })
});
