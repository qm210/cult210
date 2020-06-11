import React from 'react';
import {useRecoilState} from 'recoil';
import styled from 'styled-components';
import WebMidi from 'webmidi';
import * as Store from './Store';

const PlayBox = () => {
    const {state, dispatch} = Store.useStore();
    const [message, setMessage] = React.useState('lel');
    const [midiOutput, setMidiOutput] = React.useState(null);

    React.useEffect(() => {
        WebMidi.enable(err => {
            console.log(err ? "Webmidi failed! " + err : "Webmidi enabled!");
            console.log(WebMidi.inputs);
            console.log(WebMidi.outputs);
            if (WebMidi.outputs) {
                setMidiOutput(WebMidi.outputs.slice(-1)[0]);
            }
        });
    }, []);

    if (!midiOutput) {
        return <h3>No Shit</h3>
    }

    if (!WebMidi.outputs) {
        return <h3>No Midi Outputs Found.</h3>;
    }

    return <>
        <h2>state.tracks.length: {state.tracks.length}</h2>
        <select
            value={midiOutput.id}
            onChange={event => setMidiOutput(WebMidi.getOutputById(event.value.target))}
            >
            {WebMidi.outputs.filter(output => output.state == 'connected')
                .map(output =>
                    <option value={output.id}>
                        {output.name}
                    </option>
                )
            }
        </select>

        <button
            disabled={midiOutput == null}
            onClick={() => {
                midiOutput.playNote("C3");
                setTimeout(() => {
                    midiOutput.stopNote("C3");
                }, 1000);
            }}
            >
            Play
        </button>
        <h6>{WebMidi.time}</h6>
    </>;
};

export default PlayBox;