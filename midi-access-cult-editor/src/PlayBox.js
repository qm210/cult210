import React from 'react';
import * as Recoil from 'recoil';
import WebMidi from 'webmidi';
import useAnimationFrame from './utils/useAnimationFrame';
import useLocalStorageState from './utils/useLocalStorageState';
import * as State from './state';
import {SpinBox, DebugButton} from './components';
import {NOTES} from './utils/NoteUtils';

const PlayBox = () => {
    const [session, setSession] = useLocalStorageState('session', State.defaultSession);
    const [midiOut, setMidiOut] = Recoil.useRecoilState(State.midiOut);
    const [playState, setPlayState] = Recoil.useRecoilState(State.playState);
    const tracks = Recoil.useRecoilValue(State.tracks);
    const [timeZero, setTimeZero] = React.useState(0);
    const [trigger, setTrigger] = React.useState(false);
    //const activeTracks = Recoil.useRecoilValue(State.activeTracks); // throws that Batcher warning for some reason. TODO investigate later...
    //const msPerBeat = Recoil.useRecoilValue(State.msPerBeat);
    const msPerBeat = 6e4 / session.bpm;
    const activeTracks = React.useMemo(() => tracks.filter(track => track.active), [tracks]);

    const webMidiRestart = React.useCallback(() => {
        WebMidi.disable();
        WebMidi.enable(err => {
            console.log(err ? "Webmidi failed! " + err : "Webmidi enabled!");
            if (WebMidi.outputs) {
                console.log(WebMidi.outputs);
                setMidiOut(WebMidi.getOutputByName("USB MIDI Interface") || WebMidi.outputs[0]);
            }
        });
    }, [setMidiOut]);

    React.useEffect(() => {
        webMidiRestart();
    }, [webMidiRestart]);

    const triggerPlayback = React.useCallback(() => {
        if (!playState.playing) {
            return;
        }
        activeTracks.forEach(track => {
            track.notes.forEach(note => {
                const notePitch = note.pitch + 12 * track.transposeOctaves;
                if (notePitch < 0 || notePitch > 127) {
                    console.warn(`can't play note ${notePitch}`);
                } else {
                    midiOut.playNote(notePitch, track.channel, {
                        time: '+' + note.start * msPerBeat,
                        duration: note.duration * msPerBeat,
                        velocity: note.velocity
                    })
                }
            })
        });
    }, [playState.playing, midiOut, msPerBeat, activeTracks]);

    /*
    React.useEffect(() => { // reset zime if anything "to play" changes..?
        setTimeZero(WebMidi.time);
    }, [msPerBeat, tracks]);
    */

    React.useEffect(() => {
        if (playState.playing) {
            console.log("gotcha!");
            triggerPlayback();
        }
    }, [triggerPlayback, playState.playing, timeZero]);

    // how to use beatBuffer != beats ??
    const animationCallback = React.useCallback(msDelta => {
        const beat = (WebMidi.time - timeZero) / msPerBeat;
        setPlayState(state => ({...state, beat}));
        if (beat > session.beats) {
            setTimeZero(WebMidi.time);
        }
    }, [setPlayState, setTimeZero, session.beats, timeZero, msPerBeat]);

    useAnimationFrame(animationCallback, playState.playing);

    const PlayHandler = React.useCallback(() => {
        if (playState.playing) {
            setPlayState(state => ({
                beat: session.resetOnStop ? 0 : state.beat,
                playing: false
            }));
            NOTES.forEach(note => midiOut.stopNote(note));
        }
        else {
            setTimeZero(WebMidi.time);
            setPlayState(state => ({
                ...state,
                playing: true,
            }));
        }
    }, [playState, setPlayState, session.resetOnStop, midiOut, setTimeZero]);

    if (!midiOut) {
        return <h3>WebMidi not enabled yet.</h3>
    }

    if (!WebMidi.outputs) {
        return <h3>No Midi Outputs Found.</h3>;
    }

    return <>
        {/*<span style={{marginBottom: 12}}>activeTracks.length: {activeTracks.length}</span>*/}
        <select
            value={midiOut.id}
            onChange={event => {setMidiOut(WebMidi.getOutputById(event.target.value))}}
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

        <div style={{marginBottom: 20}}>
            BPM:&nbsp;
            <SpinBox
                step={.01}
                value={session.bpm}
                onChange={event => setSession({...session, bpm: event.target.value})}
            />
            <b style={{marginLeft: 12}}>
                {playState.beat.toFixed(3)}
            </b>
        </div>
        <DebugButton onClick={() => console.log(session)}/>
    </>;
};

export default PlayBox;