var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());
var readtobuf = fs.readFileSync('index.html');
var buftostring = readtobuf.toString();

app.get('/', function(request, response) {
  response.send(buftostring);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
