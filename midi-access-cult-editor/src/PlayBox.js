import React from 'react';
import * as Recoil from 'recoil';
import WebMidi from 'webmidi';
import {useAnimationFrame} from './utils/useAnimationFrame';
import * as State from './state';
import {SpinBox, DebugButton} from './components';

const PlayBox = () => {
    const [midiOut, setMidiOut] = Recoil.useRecoilState(State.midiOut);
    const [playState, setPlayState] = Recoil.useRecoilState(State.playState);
    const [session, setSession] = Recoil.useRecoilState(State.session);
    const tracks = Recoil.useRecoilValue(State.tracks);

    const webMidiTime = React.useRef(WebMidi.time);

    React.useEffect(() => {
        WebMidi.enable(err => {
            console.log(err ? "Webmidi failed! " + err : "Webmidi enabled!");
            if (WebMidi.outputs) {
                setMidiOut(WebMidi.getOutputByName("USB MIDI Interface") || WebMidi.outputs[0]);
            }
        });
    }, [setMidiOut]);

    const animationCallback = React.useCallback(millisecondDelta => {
        const beatDelta = millisecondDelta * session.bpm / 6e4;
        setPlayState(state => ({
            ...state,
            beat: (state.beat + beatDelta) % session.beats
        }));
    }, [setPlayState, session]);

    useAnimationFrame(animationCallback, playState.playing);

    const PlayHandler = React.useCallback(event => {
        if (playState.playing) {
            setPlayState({
                beat: 0,
                playing: false
            });
            return;
        }
        setPlayState(state => ({...state, playing: true}));
        /*
        midiOutput.playNote("C3");
                setTimeout(() => {
                    midiOutput.stopNote("C3");
                }, 1000);
        */
       return null;
    }, [playState, setPlayState]);

    if (!midiOut) {
        return <h3>WebMidi not enabled yet.</h3>
    }

    if (!WebMidi.outputs) {
        return <h3>No Midi Outputs Found.</h3>;
    }

    return <>
        <h2>tracks.length: {tracks.length}</h2>
        <select
            value={midiOut.id}
            onChange={event => setMidiOut(WebMidi.getOutputById(event.value.target))}
            >
            {WebMidi.outputs.filter(output => output.state === 'connected')
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
            disabled={midiOut == null}
            onClick={PlayHandler}>
            {playState.playing ? "Stop" : "Play"}
        </button>

        <div>
            BPM:&nbsp;
            <SpinBox
                step={.01}
                value={session.bpm}
                onChange={event => setSession({...session, bpm: event.target.value})}
            />
            <b style={{marginLeft: 12}}>
                {playState.beat.toFixed(3)} - {webMidiTime.current.toFixed(3)}
            </b>
        </div>
        <DebugButton onClick={() => console.log(session)}/>
    </>;
};

export default PlayBox;