var fs = require('fs');
var path = require('path');

var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  "Content-Type": "application/json"
};

var sendResponse = function (response, data, statusCode) {
  statusCode = statusCode || 200;
  
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));
};

var database = path.join(__dirname, 'messages.json');

var actions = {
  "GET": function (request, response) {
    fs.readFile(database, {encoding: 'utf-8', flag: 'r'}, function(err, data){
      if (err) {
        console.log(err);
      } else {
        var messages = JSON.parse('{ "results": [' + data + '] }');
        sendResponse(response, messages, 200);
      }
    });
  },

  "POST": function (request, response) {
    request.on('data', function(data) {
      var msg = JSON.parse(data);
      msg['id'] = ++msgIdCounter;
      data = JSON.stringify(msg);

      // append new message with no comma (not like below)
      // read, parse, push?

      fs.appendFile(database, ',\n' + data, function(err) {
        if (err) console.log(err);
      });
    });

    request.on('end', function() {
      sendResponse(response, null, 201);
    });
  },

  "OPTIONS": function (request, response) {
    sendResponse(response, null, 201);
  }
};

var msgIdCounter = 0;

var urls = [
  '/',
  '/log',
  '/send',
  '/classes/chatterbox',
  '/classes/messages',
  '/classes/room',
  '/classes/room1'
];

var isValid = function (url) {
  return urls.indexOf(url) > -1;
};

var requestHandler = function(request, response) {

  console.log("Serving request type " + request.method + " for url " + request.url);

  if (!isValid(request.url)) {
    sendResponse(response, null, 404);
  }

  if (request.method) {
    actions[request.method](request, response)
  }

};

module.exports.requestHandler = requestHandler;