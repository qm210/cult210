# cult210
Cooperative Unannoying Loop Tool for Corona-Inspired Live Jam

# License
Tool is (c) 2020 Team210 <qm@z10.info> and licensed under GPLV3; see LICENSE.

# Concept
Live Techno Jam tool that allows users to collaboratively edit a midi file and record tracks over their own synthesizer hardware, which are then sent to a server, mixed and streamed over the internet.

## Server
The server keeps track of "Jam rooms" (one per result steram)
The server has the MIDI file that the clients edit
The server notifies all MIDI editor clients of changes in the MIDI file.
The server notifies all Hardware interface clients of changes in the MIDI file.

## MIDI editor client
The MIDI editor client allows user to make changes to specific MIDI tracks on the server (those he has his hardware connected to). 
Users can lock their own synthesizer track for editing by everyone else.

## Hardware interface client
Can wire specific tracks on the server to actual synthesizer hardware
Plays MIDI tracks on hardware and uploads them to the server for mixing
All changes only take effect after the loop is run through one time
