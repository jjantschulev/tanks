const PORT = 3012;

var express = require('express');
var app = express();
var server = app.listen(PORT);
app.use(express.static('public'))
console.log('server running on port: ' + PORT);

var io = require('socket.io')(server);

//game Variables
var tanks = []




io.on('connection', function (socket) {
  tanks.push(
    {id:socket.id,x:0,y:0,dir:0,gunDir:0}
  );

  setInterval(function () {
    socket.emit("update", tanks)
    socket.broadcast.emit("update", tanks)
  }, 38);

  socket.on("newConnected", function () {
    socket.emit("newConnected", tanks.length)
    socket.broadcast.emit("newConnected", tanks.length);
  })

  socket.on('sync', function (data) {
    for (var i = 0; i < tanks.length; i++) {
      if(tanks[i].id == socket.id){
        tanks[i].x = data.x;
        tanks[i].y = data.y;
        tanks[i].dir = data.dir;
        tanks[i].gunDir = data.gunDir;
        tanks[i].health = data.health;
      }
    }
  });

  socket.on("shot", function (data) {
    socket.broadcast.emit("shot", data)
    socket.emit("shot", data)
  })

  socket.on('disconnect', function () {
    for (var i = 0; i < tanks.length; i++) {
      if(tanks[i].id == socket.id){
        socket.broadcast.emit("userDisconnected", tanks.length)
        socket.emit("userDisconnected", tanks.length)
        tanks.splice(i, 1);
      }
    }
  })
});
