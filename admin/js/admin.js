var socket = io("localhost:3012");
var adminSocket = io('localhost:5000')

function changeWorld() {
  socket.emit("newWorld", true);
}

adminSocket.on('sync-ammo', function (data) {
  updateAmmoTable(data);
});

adminSocket.on('sync-scores', function (data) {
  updateScoresTable(data);
});

function updateAmmoTable(ammoData) {
  var obj = ammoData;

  var highest = 0;
  var tbody = document.getElementById('tbody');
  tbody.innerHTML = "<tr><td>NAME</td><td>Bombs</td><td>Mines</td><td>Turrets</td><td>Pulses</td></tr>";
  for (var i = 0; i < Object.keys(obj).length; i++) {
      var tr = "<tr>";
      tr += "<td>" + obj[i].name + "</td>" + "<td>" + obj[i].landmineAmount.toString() + "</td>" + "<td>" + obj[i].blueBombAmount.toString() + "</td>" + "<td>" + obj[i].tripodAmount.toString() + "</td>" + "<td>" + obj[i].pulsesAmount.toString() + "</td></tr>";
      tbody.innerHTML += tr;
  }
}

function updateScoresTable(scoresData) {
  var obj = scoresData;

  var highest = 0;
  var tbody = document.getElementById('tbody-score');
  tbody.innerHTML = "<tr><td>NAME</td><td>Wins</td><td>Losses</td></tr>";
  for (var i = 0; i < Object.keys(obj).length; i++) {
      var tr = "<tr>";
      tr += "<td>" + obj[i].name + "</td>" + "<td style=\"color:black\">" + obj[i].won.toString() + "</td>" + "<td>" + obj[i].lost.toString() + "</td></tr>";
      tbody.innerHTML += tr;
  }
}
