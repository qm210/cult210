// CURRENTLY UNUSED, might be in bad shape (fat and ugly)

/* eslint-disable no-unused-vars */
import MidiPlayer from 'midi-player-js';
import Soundfont from 'soundfont-player';

var ac = new AudioContext();
var Player;

export const playMidiTrack = async (midi) => {
    const midiUrl = `/midis/${midi.filename}`;
    const res = await fetch(midiUrl);
    const blob = await res.blob();

    const arrayBuffer = await new Response(blob).arrayBuffer();
    Soundfont.instrument(ac, 'clavinet', { soundfont: 'FluidR3_GM' }).then(instrument => {
        Player = Player || new MidiPlayer.Player(event => {
            if (event.name === 'Note on' && event.velocity > 0) {
                instrument.play(event.noteName, ac.currentTime, {gain:event.velocity/100});
            }
        });
        Player.stop();
        Player.loadArrayBuffer(arrayBuffer);
        Player.play();
    });
}
