import React from 'react';
import {useRecoilState} from 'recoil';
import {useAnimationFrame} from './CustomHooks';
import WebMidi from 'webmidi';
import * as Store from './Store';
import {SpinBox} from './components/SharedComponents';

const PlayBox = () => {
    const {state, dispatch} = Store.useStore();
    const [isPlaying, setPlaying] = React.useState(false);
    const [playBeat, setPlayBeat] = React.useState(0);
    const [midiOutput, setMidiOutput] = React.useState(null);

    const webMidiTime = React.useRef(WebMidi.time);

    React.useEffect(() => {
        WebMidi.enable(err => {
            console.log(err ? "Webmidi failed! " + err : "Webmidi enabled!");
            console.log(WebMidi.inputs);
            console.log(WebMidi.outputs);
            if (WebMidi.outputs) {
                setMidiOutput(WebMidi.getOutputByName("USB MIDI Interface") || WebMidi.outputs[0]);
            }
        });
    }, []);

    useAnimationFrame(millisecondDelta => {
        const beatDelta = millisecondDelta * state.header.bpm / 6e4;
        setPlayBeat(prevBeat => (prevBeat + beatDelta) % state.header.beats);
    }, isPlaying);

    const PlayHandler = (event) => {
        if (isPlaying) {
            setPlaying(false);
            return;
        }
        setPlaying(true);
        /*
        midiOutput.playNote("C3");
                setTimeout(() => {
                    midiOutput.stopNote("C3");
                }, 1000);
        */
       return null;
    };

    if (!midiOutput) {
        return <h3>WebMidi not enabled yet.</h3>
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
                    <option
                        key={output.id}
                        value={output.id}>
                        {output.name}
                    </option>
                )
            }
        </select>

        <button
            disabled={midiOutput == null}
            onClick={PlayHandler}>
            {isPlaying ? "Stop" : "Play"}
        </button>

        <div>
        BPM: <SpinBox value={state.header.bpm}/> {playBeat.toFixed(3)} - {webMidiTime.current}
        </div>
    </>;
};

export default PlayBox;