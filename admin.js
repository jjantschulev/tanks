var express = require('express');
var app = express();
var server = app.listen(5000);
app.use(express.static('admin'));
var fs = require('fs');

var io = require('socket.io')(server);

var userData = JSON.parse(fs.readFileSync('userData.json', 'utf8'));

io.on('connection', function (socket) {
  setInterval(function () {
    userData = JSON.parse(fs.readFileSync('userData.json', 'utf8'));
    socket.emit("sync-ammo", userData)
    socket.broadcast.emit("sync-ammo", userData)
  }, 3000);
  
  setInterval(function () {
    scoresData = JSON.parse(fs.readFileSync('scores.json', 'utf8'));
    socket.emit("sync-scores", scoresData)
    socket.broadcast.emit("sync-scores", scoresData)
  }, 3000);
});
