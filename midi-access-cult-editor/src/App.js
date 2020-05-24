import React from 'react';
import download from 'downloadjs';
import MidiPlayer from 'midi-player-js';
import Soundfont from 'soundfont-player';

var ac = new AudioContext();
var Player;

const fetchFromRoute = (route, setter) => {
    fetch(route)
        .then(res => {
            if (!res.ok) {
                setter([]);
                return Promise.reject();
            }
            return res.json();
        })
        .then(data => {
            console.log('GET', route, data);
            setter(data);
        })
        .catch(error => console.error(error));
}

const playMidi = async (midi) => {
    console.log(midi.filename);
    const res = await fetch(`/midis/${midi.filename}`);
    const blob = await res.blob();
    //download(blob, midi.filename);

    console.log(ac);
    const arrayBuffer = await new Response(blob).arrayBuffer();
    Soundfont.instrument(ac, 'clavinet', { soundfont: 'FluidR3_GM' }).then(instrument => {
        Player = Player || new MidiPlayer.Player(event => {
            console.log(event);
            if (event.name === 'Note on' && event.velocity > 0) {
                instrument.play(event.noteName, ac.currentTime, {gain:event.velocity/100});
            }
        });
        Player.stop();
        Player.loadArrayBuffer(arrayBuffer);
        Player.play();
    });

}

const App = () => {
    const [midiStore, setMidiStore] = React.useState([]);
    const [tracks, setTracks] = React.useState([]);

    React.useEffect(() => {
        fetchFromRoute('/tracks/', setTracks);
        fetchFromRoute('/midis/', setMidiStore);
    }, []);

    return <>
        <div className="mainframe">
            <ul>
            {
                tracks.map((track, index) =>
                    <li key={index}>
                        <b>{track}</b>:
                        <div>
                        {
                            midiStore[track] ?
                                midiStore[track].map((midi, mIndex) =>
                                    <button key={mIndex}
                                        onClick={() => playMidi(midi)}>
                                        {midi.title}
                                    </button>
                                )
                            :
                                "empty"
                        }
                        </div>
                    </li>
                )
            }
            </ul>
        </div>
    </>
}

export default App;

