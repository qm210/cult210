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
    const [timeZero, setTimeZero] = React.useState(0);
    const [beatZero, setBeatZero] = React.useState(0);
    const trigger = React.useRef(false);
    const [triggerFlag, setTriggerFlag] = React.useState(false);

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

    const notesToBuffer = React.useCallback((fromBeat) =>
        activeTracks.reduce((accTracks, track) => [
            ...accTracks,
            ...track.notes.reduce((accNotes, note) => {
                if (note.start >= fromBeat && note.start < fromBeat + session.beatBuffer) {
                    accNotes.push({
                        ...note,
                        pitch: note.pitch + 12 * track.transposeOctaves,
                        channel: track.channel,
                    })
                }
                return accNotes;
            }, [])
        ], []), [session.beatBuffer]);

    const triggerPlayback = React.useCallback(() => {
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
    }, [midiOut, msPerBeat, activeTracks]);

    /*
    React.useEffect(() => { // reset zime if anything "to play" changes..?
        setTimeZero(WebMidi.time);
    }, [msPerBeat, tracks]);
    */

    React.useEffect(() => {
        console.log("gotcha!", playState.playing, trigger.current, triggerFlag);
        if (playState.playing && trigger.current) {
            triggerPlayback(beatZero);
            trigger.current = false;
            setTriggerFlag(false);
        }
    }, [triggerPlayback, playState.playing, timeZero, beatZero, trigger, triggerFlag]);

    React.useEffect(() => {
        console.log("RE!");
        trigger.current = true;
        setTriggerFlag(true);
    }, [timeZero, setTriggerFlag]);

    // how to use beatBuffer != beats ??
    const animationCallback = React.useCallback(msDelta => {
        const beat = (WebMidi.time - timeZero) / msPerBeat;
        setPlayState(state => ({...state, beat}));
        if (beat > session.beatBuffer) {
            setBeatZero(beat);
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
        <DebugButton onClick={() => console.log(session, activeTracks, notesToBuffer(0))}/>
    </>;
};

export default PlayBox;