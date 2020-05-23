const midi = require('midi');
const fs = require('fs');
const path = require('path');
const ParseMidi = require('midi-file').parseMidi;
const WebSocketClient = require('websocket').client;

const midiOutput = new midi.output();

// List available input and output devices
function listAvailableOutputDevices()
{
    var numberOfDevices = midiOutput.getPortCount(),
        availableDevices = {};

    for(var i = 0; i < numberOfDevices; ++i)
        availableDevices[midiOutput.getPortName(i)] = i;
    return availableDevices;
}

// Set up websocket client
configuration = JSON.parse(fs.readFileSync('config.json'));
var client = new WebSocketClient();

client.on('connectFailed', (error) => {
    console.error('Failed to connect; error message: ', error.toString());
});

client.on('connect', (connection) => {
    console.log('Connected.');
    connection.on('error', (error) => {
        console.log('Connection error; error message: ', error.toString());
    });
    connection.on('close', () => {
        console.log('Connection closed.');
    });
    connection.on('message', (message) => {
        console.log('Connection message: ', message);
    });

    clientData = configuration.client;
});

client.connect(configuration.server.address, 'cultProtocol');
