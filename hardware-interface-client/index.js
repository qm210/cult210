const midi = require('midi');
const fs = require('fs');
const path = require('path');
const ParseMidi = require('midi-file').parseMidi;
const WebSocketClient = require('websocket').client;

// Open config file
configuration = JSON.parse(fs.readFileSync('config.json'));

// Set up midi outputs and gather information
const midiOutput = new midi.output();
var numberOfDevices = midiOutput.getPortCount(),
availableDevices = {};

for(var i = 0; i < numberOfDevices; ++i)
    availableDevices[midiOutput.getPortName(i)] = i;
clientInformation = {};
clientInformation.type = "connect-hardware-client"
clientInformation.availableMidiOutputs = Object.keys(availableDevices);
clientInformation.clientName = configuration.client.name;

// Set up websocket client
var client = new WebSocketClient();

client.on('connectFailed', (error) => {
    console.error(new Date(),'Failed to connect; error message: ', error.toString());
});

client.on('connect', (connection) => {
    console.log(new Date(), 'Connected.');
    connection.on('error', (error) => {
        console.log(new Date(), 'Connection error; error message: ', error.toString());
    });
    connection.on('close', () => {
        console.log(new Date(), 'Connection closed.');
    });
    connection.on('message', (message) => {
        console.log(new Date(), 'Connection message: ', message);
        
        var messageObject = JSON.parse(message.data);
        switch(messageObject.messageType)
        {
            case 'MIDIUpdate':

                break;
        }
    });

    connection.send(JSON.stringify(clientInformation));
});

client.connect(configuration.server.address, 'echo-protocol');
