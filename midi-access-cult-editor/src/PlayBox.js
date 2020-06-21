import React from 'react';
import * as Recoil from 'recoil';
import WebMidi from 'webmidi';
import useAnimationFrame from './utils/useAnimationFrame';
import useLocalStorageState from './utils/useLocalStorageState';
import * as State from './state';
import {SpinBox, DebugButton} from './components';
import {NOTES} from './utils/NoteUtils';

/*
const usePrev = (value, initVal) => {
    const ref = React.useRef(initVal);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}
const useTriggeredEffect = (hook, deps, trigs) => {
    const prevTrigs = usePrev(trigs, []);
    const trigsChanged = trigs.some((trig, index) => trig !== prevTrigs[index]);
    React.useEffect(() => {
        if (trigsChanged) {
            hook();
        }
    }, deps.concat(trigs));
}
*/

const PlayBox = () => {
    const [session, setSession] = useLocalStorageState('session', State.defaultSession);
    const [midiOut, setMidiOut] = Recoil.useRecoilState(State.midiOut);
    const [playState, setPlayState] = Recoil.useRecoilState(State.playState);
    const tracks = Recoil.useRecoilValue(State.tracks);
    //const activeTracks = Recoil.useRecoilValue(State.activeTracks); // throws that Batcher warning for some reason. TODO investigate later...
    const activeTracks = React.useMemo(() => tracks.filter(track => track.active), [tracks]);
    const msPerBeat = 6e4 / session.bpm;
    const [zero, setZero] = React.useState({
        time: 0,
        beat: 0
    });
    const trigger = React.useRef(false);

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

    const notesToBuffer = React.useCallback(() =>
        activeTracks.reduce((accTracks, track) => [
            ...accTracks,
            ...track.notes.reduce((accNotes, note) => {
                if (note.start >= zero.beat && note.start < zero.beat + session.beatBuffer) {
                    accNotes.push({
                        ...note,
                        start: note.start - zero.beat,
                        pitch: note.pitch + 12 * track.transposeOctaves,
                        channel: track.channel,
                    })
                }
                else if (note.start + session.beats >= zero.beat && note.start + session.beats < zero.beat + session.beatBuffer) {
                    accNotes.push({
                        ...note,
                        start: note.start + session.beats - zero.beat,
                        pitch: note.pitch + 12 * track.transposeOctaves,
                        channel: track.channel,
                    })
                }
                return accNotes;
            }, [])
        ], []), [session.beats, session.beatBuffer, zero.beat, activeTracks]);

    const triggerPlayback = React.useCallback(() => {
        notesToBuffer().forEach(note => {
            if (note.pitch < 0 || note.pitch > 127) {
                console.warn(`can't play note ${note.pitch}`);
            } else {
                midiOut.playNote(note.pitch, note.channel, {
                    time: '+' + note.start * msPerBeat,
                    duration: note.duration * msPerBeat,
                    velocity: note.velocity
                });
            }
        });
    }, [midiOut, msPerBeat, notesToBuffer]);

    React.useEffect(() => {
        if (playState.playing && trigger.current) {
            trigger.current = false;
            console.log("gotcha!", zero.beat, trigger.current);
            triggerPlayback();
        }
    }, [triggerPlayback, playState.playing, zero.beat]);

    const animationCallback = React.useCallback(msDelta => {
        const beatSinceZero = (WebMidi.time - zero.time) / msPerBeat;
        const beat = (zero.beat + beatSinceZero) % session.beats;
        setPlayState(state => ({...state, beat}));
        if (beatSinceZero > session.beatBuffer && !trigger.current) {
            trigger.current = true;
            setZero({
                beat: (zero.beat + session.beatBuffer) % session.beats,
                time: WebMidi.time
            })
        }
    }, [setPlayState, session.beats, session.beatBuffer, zero, setZero, msPerBeat]);

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
            trigger.current = true;
            setPlayState(state => ({
                ...state,
                playing: true,
            }));
            setZero({
                beat: playState.beat,
                time: WebMidi.time
            })
        }
    }, [playState, setPlayState, session.resetOnStop, midiOut, setZero, zero]);

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
        <DebugButton onClick={() => console.log(session, activeTracks, notesToBuffer())}/>
    </>;
};

export default PlayBox;