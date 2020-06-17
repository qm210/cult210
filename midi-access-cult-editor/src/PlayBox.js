import React from 'react';
import * as Recoil from 'recoil';
import WebMidi from 'webmidi';
import {useAnimationFrame} from './utils/useAnimationFrame';
import * as State from './state';
import {SpinBox, DebugButton} from './components';
import {NOTES} from './utils/NoteUtils';

const PlayBox = () => {
    const [midiOut, setMidiOut] = Recoil.useRecoilState(State.midiOut);
    const [playState, setPlayState] = Recoil.useRecoilState(State.playState);
    const [session, setSession] = Recoil.useRecoilState(State.session);
    const tracks = Recoil.useRecoilValue(State.tracks);
    //const activeTracks = Recoil.useRecoilValue(State.activeTracks); // throws that Batcher warning for some reason. TODO investigate later...
    //const msPerBeat = Recoil.useRecoilValue(State.msPerBeat);
    const msPerBeat = 6e4 / session.bpm;
    const webMidiTime = React.useRef(WebMidi.time);

    React.useEffect(() => {
        WebMidi.enable(err => {
            console.log(err ? "Webmidi failed! " + err : "Webmidi enabled!");
            if (WebMidi.outputs) {
                console.log(WebMidi.outputs);
                setMidiOut(WebMidi.getOutputByName("USB MIDI Interface") || WebMidi.outputs[0]);
            }
        });
    }, [setMidiOut]);

    const triggerPlayback = React.useCallback(() => {
        if (!playState.playing) {
            return;
        }
        const activeTracks = tracks.filter(track => track.active);
        activeTracks.forEach(track => {
            track.notes.forEach(note => {
                const notePitch = note.pitch + 12 * track.transposeOctaves;
                if (notePitch < 0 || notePitch > 127) {
                    console.warn(`can't play note ${notePitch}`);
                } else {
                    console.log(notePitch);
                    midiOut.playNote(notePitch, track.channel, {
                        time: '+' + note.start * msPerBeat,
                        duration: note.duration * msPerBeat,
                        velocity: note.velocity
                    })
                }
            })
        });
    }, [playState.playing, midiOut, msPerBeat, tracks]);

    React.useEffect(() => {
        console.log("Triggy", WebMidi.time, playState.midiTimeAtStart);
        if (playState.playing) {
            triggerPlayback();
        }
    }, [triggerPlayback, playState.playing, playState.midiTimeAtStart]);

    const animationCallback = React.useCallback(msDelta => {
        const beat = (WebMidi.time - playState.midiTimeAtStart) / msPerBeat;
        setPlayState(state => ({...state, beat}));
        if (beat > session.beats) {
            setPlayState(state => ({...state,
                midiTimeAtStart: WebMidi.time
            }));
        }
    }, [setPlayState, session.beats, playState.midiTimeAtStart, msPerBeat]);

    useAnimationFrame(animationCallback, playState.playing);

    const PlayHandler = React.useCallback(() => {
        if (playState.playing) {
            NOTES.forEach(note => midiOut.stopNote(note));
            setPlayState(state => ({
                beat: session.resetOnStop ? 0 : state.beat,
                playing: false
            }));
        }
        else {
            setPlayState(state => ({
                ...state,
                playing: true,
                midiTimeAtStart: WebMidi.time
            }));
        }
    }, [playState, setPlayState, session.resetOnStop, midiOut]);

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
                {playState.beat.toFixed(3)} - {webMidiTime.current.toFixed(3)}
            </b>
        </div>
        <DebugButton onClick={() => console.log(session)}/>
    </>;
};

export default PlayBox;