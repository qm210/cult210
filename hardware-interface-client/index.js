const midi = require('midi');

const input = new midi.input(),
    output = new midi.output();
var numberOfInputDevices = input.getPortCount(),
    numberOfOutputDevices = output.getPortCount();
for(var i=0; i<numberOfInputDevices; ++i)
{
    console.log("Midi input port", i, "has device", input.getPortName(i));
}
for(var i=0; i<numberOfOutputDevices; ++i)
{
    console.log("Midi output port", i, "has device", output.getPortName(i));
}
