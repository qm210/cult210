import MidiPlayer from 'midi-player-js';
import Soundfont from 'soundfont-player';
import {parseArrayBuffer as midiJsonParse} from 'midi-json-parser';
import download from 'downloadjs';

var ac = new AudioContext();
var Player;

export const playMidi = async (dispatch, midi) => {
    console.log(midi);
    const res = await fetch(`/midis/${midi.filename}`);
    const blob = await res.blob();
    //download(blob, midi.filename);

    const arrayBuffer = await new Response(blob).arrayBuffer();
    Soundfont.instrument(ac, 'clavinet', { soundfont: 'FluidR3_GM' }).then(instrument => {
        Player = Player || new MidiPlayer.Player(event => {
            //console.log(event);
            if (event.name === 'Note on' && event.velocity > 0) {
                instrument.play(event.noteName, ac.currentTime, {gain:event.velocity/100});
            }
        });
        Player.stop();
        Player.loadArrayBuffer(arrayBuffer);
        Player.play();

        midiJsonParse(arrayBuffer)
            .then((json) => {
                dispatch({
                    type: "LOAD JSON",
                    payload: {
                        title: midi.title,
                        filename: midi.filename,
                        json
                    }
                });
            });
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