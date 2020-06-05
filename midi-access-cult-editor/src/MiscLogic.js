import MidiPlayer from 'midi-player-js';
import Soundfont from 'soundfont-player';
import {Midi} from '@tonejs/midi';

var ac = new AudioContext();
var Player;

export const playMidi = async (dispatch, midi) => {
    const midiUrl = `/midis/${midi.filename}`;
    const res = await fetch(midiUrl);
    const blob = await res.blob();

    const midiData = await Midi.fromUrl(midiUrl);
    dispatch({
        type: "LOAD MIDI",
        payload: {
            title: midi.title,
            filename: midi.filename,
            data: midiData,
        }
    });

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

export const fetchAndDispatch = (route, dispatch, type) => {
    fetch(route)
        .then(res => {
            if (!res.ok) {
                dispatch({type: "RESET"});
                return Promise.reject();
            }
            return res.json();
        })
        .then(data => {
            console.log('GET', route, data);
            dispatch({type, payload: data});
        })
        .catch(error => console.error(error));
}