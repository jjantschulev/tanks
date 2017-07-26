var scores;

function sortByWon() {
  scores.sort(function (a, b) {
    return b.won - a.won
  });
  updateScoresTable();
}

function sortByLost() {
  scores.sort(function (a, b) {
    return b.lost - a.lost
  });
  updateScoresTable();
}

function sortByDif() {
  scores.sort(function (a, b) {
    aDif = a.won - a.lost;
    bDif = b.won - b.lost;
    return bDif - aDif
  });
  updateScoresTable();
}

function updateScoresTable() {
  var tbody = document.getElementById('scores');
  tbody.innerHTML = "";
  for (var i = 0; i < scores.length; i++) {
    if(scores[i].won == getHighestWin()){
      var wins = "<td class=\"yellow\">"+scores[i].won+"</td>";
    }else{
      var wins = "<td>"+scores[i].won+"</td>";
    }
    if (scores[i].lost == getHighestLoss()) {
      var losses = "<td class=\"yellow\">"+scores[i].lost+"</td>";
    } else {
      var losses = "<td>"+scores[i].lost+"</td>";
    }
    if ((scores[i].won - scores[i].lost)==getHighestDif()) {
      var diff = "<td class=\"yellow\">"+(scores[i].won - scores[i].lost)+"</td>";
    } else {
      var diff = "<td>"+(scores[i].won - scores[i].lost)+"</td>";
    }
    var newRow = "<tr><td>"+scores[i].name+"</td>"+wins+losses+diff+"</tr>"
    tbody.innerHTML += newRow;
  }
}

function getHighestWin () {
  var highestWin = 0;
  for (var i = 0; i < scores.length; i++) {
    if (scores[i].won > highestWin) {
      highestWin = scores[i].won;
    }
  }
  return highestWin;
}

function getHighestLoss () {
  var highestLoss = 0;
  for (var i = 0; i < scores.length; i++) {
    if (scores[i].lost > highestLoss) {
      highestLoss = scores[i].lost;
    }
  }
  return highestLoss;
}

function getHighestDif () {
  var highestDiff = 0;
  for (var i = 0; i < scores.length; i++) {
    if ((scores[i].won - scores[i].lost) > highestDiff) {
      highestDiff = (scores[i].won - scores[i].lost);
    }
  }
  return highestDiff;
}

socket.emit("request-update-scores");

socket.on('update-scores', function (data) {
  scores = data;
  sortByWon();
})
