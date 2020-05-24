#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');

configuration = JSON.parse(fs.readFileSync('config.json'));

var server = http.createServer(function(request, response) {
    console.log(new Date(), ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(configuration.server.port, function() {
    console.log(new Date(), ' Server is listening on port', configuration.server.port);
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    return true;
}

var connectedHardwareClients = [],
    connectedEditorClients = [];

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log(new Date(), ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    console.log(new Date(), ' Connection accepted.');
    connection.on('message', function(msg) {
        if (msg.type === 'utf8') {
            var message = JSON.parse(msg.utf8Data);
            switch(message.type) {
                case 'connect-hardware-client':
                    console.log(new Date(), 'Client identifies as:', message.clientName);
                    connectedHardwareClients.push(message);
                    break;
                
                default:
                    console.warn(new Date(), 'Received unknown utf8 message with data:', message.utf8Data);
                    break;
            }
        }
        else {
            console.warn(new Date(), "got some unknown message", message);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log(new Date(), ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});