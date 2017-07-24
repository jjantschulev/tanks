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
var userData = JSON.parse(fs.readFileSync('userData.json', 'utf8'));
var world = Math.floor(Math.random()*6);

//when new user connects:
io.on('connection', function (socket) {
  // add a new tank object to the server array
  tanks.push(
    {id:socket.id,x:0,y:0,dir:0,gunDir:0,health:100,name:"anonym",col:"purple",deactivated:false}
  );

  //send tank data to clients
  setInterval(function () {
    socket.emit("update", tanks)
    socket.broadcast.emit("update", tanks)
  }, 40);

  setTimeout(function () {
    socket.emit("color", tanks);
    socket.broadcast.emit("color", tanks);
  }, 1000)

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
  }, 3000);

  //tell client they have sucessfully connected
  socket.on("newConnected", function (n) {
    socket.emit("newConnected", tanks.length)
    socket.broadcast.emit("newConnected", tanks.length);

    var data = {
      t: tanks,
      landmineAmount: getLandmineAmount(n),
      blueBombAmount: getBlueBombAmount(n),
      tripodAmount: getTripodAmount(n),
      pulsesAmount: getPulseAmount(n),
      name: n
    }

    setTimeout(function () {
      socket.emit("initial-update", data)
      socket.broadcast.emit("initial-update", data)

      socket.emit("newWorld", world)
      socket.broadcast.emit("newWorld", world);
    }, 100);

  })

  //handout new world
  socket.on("newWorld", function (change) {
    if (change) {
      var nw = Math.floor(Math.random()*6);
      while (nw == world) {
        nw = Math.floor(Math.random()*6);
      }
      world = nw
    }
    socket.emit("newWorld", world)
    socket.broadcast.emit("newWorld", world);
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
        tanks[i].deactivated = data.deactivated;
      }
    }
  });

  //send data from bullets on one client to everyone
  socket.on("shot", function (data) {
    socket.broadcast.emit("shot", data)
    socket.emit("shot", data)
  })

  socket.on("pulse", function (data) {
    socket.broadcast.emit("pulse", data)
    socket.emit("pulse", data)
  })

  socket.on("landmine", function (data) {
    socket.broadcast.emit("landmine", data)
    socket.emit("landmine", data)
  })

  socket.on("tripod", function (data) {
    socket.broadcast.emit("tripod", data)
    socket.emit("tripod", data)
  })

  socket.on("blue-bomb", function (data) {
    socket.broadcast.emit("blue-bomb", data)
    socket.emit("blue-bomb", data)
  })

  socket.on("blue-bomb-explode", function (data) {
    socket.broadcast.emit("blue-bomb-explode", data)
    socket.emit("blue-bomb-explode", data)
  });

  socket.on("save-user-data", function (data) {
    var foundUserMatch = false;
    for (var i = 0; i < userData.length; i++) {
      if (userData[i].name == data.name) {
        userData[i].landmineAmount = data.landmineAmount;
        userData[i].blueBombAmount = data.blueBombAmount;
        userData[i].tripodAmount = data.tripodAmount;
        userData[i].pulsesAmount = data.pulsesAmount;
        foundUserMatch = true;
      }
    }

    if (!foundUserMatch) {
      var newPerson = {
        name: data.name,
        landmineAmount: data.landmineAmount,
        blueBombAmount: data.blueBombAmount,
        tripodAmount: data.tripodAmount,
        pulsesAmount: data.pulsesAmount
      }
      userData.push(newPerson);
    }
    dataToWrite = JSON.stringify(userData);
    fs.writeFile("userData.json", dataToWrite, function(err) {
      if(err){return console.log(err);}
    });
  })

  //when a client dies
  socket.on("death", function (deathData) {
    if (deathData.name == deathData.killer) {
      return;
    }

    for (var i = 0; i < tanks.length; i++) {
      if (tanks[i].name == deathData.killer) {
        io.to(tanks[i].id).emit("reset-health");
      }
    }

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

function getLandmineAmount(name) {
  var amount = 1;
  for (var i = 0; i < userData.length; i++) {
    if (userData[i].name == name) {
      amount = userData[i].landmineAmount;
    }
  }
  return amount;
}

function getBlueBombAmount(name) {
  var amount = 1;
  for (var i = 0; i < userData.length; i++) {
    if (userData[i].name == name) {
      amount = userData[i].blueBombAmount;
    }
  }
  return amount;
}

function getTripodAmount(name) {
  var amount = 0;
  for (var i = 0; i < userData.length; i++) {
    if (userData[i].name == name) {
      amount = userData[i].tripodAmount;
    }
  }
  return amount;
}

function getPulseAmount(name) {
  var amount = 3;
  for (var i = 0; i < userData.length; i++) {
    if (userData[i].name == name) {
      amount = userData[i].pulsesAmount;
    }
  }
  return amount;
}
