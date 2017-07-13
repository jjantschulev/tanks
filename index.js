const PORT = 3012;

var express = require('express');
var app = express();
var server = app.listen(PORT);
app.use(express.static('public'))
console.log('server running on port: ' + PORT);
