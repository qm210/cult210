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
    const activeTracks = Recoil.useRecoilValue(State.activeTracks); // throws that Batcher warning for some reason. TODO investigate later...
    const msPerBeat = Recoil.useRecoilValue(State.msPerBeat);

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
        const beatDelta = millisecondDelta / msPerBeat;
        let beat = (WebMidi.time - playState.midiTimeAtStart) / msPerBeat;
        console.log(beat, playState.atStart);
        if (playState.atStart) {
            beat = beat % session.beats;
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
            })
            setPlayState(state => ({...state,
                atStart: false
            }));
        }
        else if (beat > session.beats) {
            setPlayState(state => ({...state,
                atStart: true
            }));
        }
    }, [setPlayState, session.beats, msPerBeat, midiOut, playState, activeTracks]);

    useAnimationFrame(animationCallback, playState.playing);

    const PlayHandler = React.useCallback(event => {
        if (playState.playing) {
            setPlayState(state => ({
                beat: session.resetOnStop ? 0 : state.beat,
                playing: false
            }));
            NOTES.forEach(note => midiOut.stopNote(note));
            return;
        }
        setPlayState(state => ({
            ...state,
            playing: true,
            atStart: true,
            midiTimeAtStart: WebMidi.time
        }));
    }, [playState, setPlayState, session.resetOnStop, midiOut]);

    if (!midiOut) {
        return <h3>WebMidi not enabled yet.</h3>
    }

    if (!WebMidi.outputs) {
        return <h3>No Midi Outputs Found.</h3>;
    }

    return <>
        <span style={{marginBottom: 12}}>activeTracks.length: {activeTracks.length}</span>
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