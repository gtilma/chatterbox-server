/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  "Content-Type": "application/json"
};

var sendResponse = function (response, statusCode, data) {
  statusCode = statusCode || 200;
  
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));

}

var actions = {
  "GET": function (response, statusCode, data) {
    sendResponse(response, statusCode, data);
  },

  "POST": function (response, statusCode, data) {
    sendResponse(response, statusCode, data);
  },

  "OPTIONS": function () {}

};


module.exports = function(request, response) {

  var fs = require('fs');
  var path = require('path');
  //var messageObj = require("./messages.json");
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  // console.log(request);
  console.log("Serving request type " + request.method + " for url " + request.url);

  // The outgoing status.
  var statusCode = 200;
  if (!isValid(request.url)) {
    statusCode = 404;
  }

  if (request.method === 'GET') {
    fs.readFile(path.join(__dirname, 'messages.json'), {encoding: 'utf-8', flag: 'r'}, function(err, data){
      if (err) {
        console.log(err);
      } else {
        var messages = JSON.parse('{ "results": ['+data+']}');
        actions["GET"](response, statusCode, messages);
      }
    });
  }

  if (request.method === 'POST') {
    request.on('data', function(data) {
      console.log('hi')
      fs.appendFile(path.join(__dirname, 'messages.json'), data+',\n', function(err) {
        if (err) console.log(err);
      });
    });
    request.on('end', function() {
      actions['POST'](response, 201, null)
    })
  }

  if (request.method === 'OPTIONS') {
    request.on('end', function() {
      // statusCode = 
      response.writeHead(statusCode, headers);
      response.end();
    })
  }

  // var newData = ''
  // request.on('data', function(data) {
    // console.log(data)
    // newData += data
  // }

  // request.on('end', ...)

  // See the note below about CORS headers.
  // var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = "application/json";

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  // response.writeHead(statusCode, headers);

  // var responseText = 'boobs';

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.

  // response.end(responseText);
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve your chat
// client from this domain by setting up static file serving.
var urls = [
  '/',
  '/log',
  '/send',
  '/classes/chatterbox',
  '/classes/messages',
  '/classes/rooms'
];

function isValid (url) {
  return urls.indexOf(url) > -1;
};

