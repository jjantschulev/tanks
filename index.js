const PORT = 3012;

//setup up standard static file server to send HTML, JS, CSS file to client
var express = require('express');
var app = express();
var server = app.listen(PORT);
app.use(express.static('public'))
console.log('server running on port: ' + PORT);

//import socket.io library into io variable
var io = require('socket.io')(server);

//game Variables
var tanks = []

//when new user connects:
io.on('connection', function (socket) {
  // add a new tank object to the server array
  tanks.push(
    {id:socket.id,x:0,y:0,dir:0,gunDir:0,health:100,name:"anonym",col:"purple"}
  );

  //send tank data to server
  setInterval(function () {
    socket.emit("update", tanks)
    socket.broadcast.emit("update", tanks)
  }, 38);

  //tell client they have sucessfully connected
  socket.on("newConnected", function () {
    var data = {
      l: tanks.length,
      blocksId: Math.floor(Math.random()*5)
    }
    socket.emit("newConnected", data)
    socket.broadcast.emit("newConnected", data);

    setTimeout(function () {
      socket.emit("initial-update", tanks)
      socket.broadcast.emit("initial-update", tanks)
    }, 80);

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
