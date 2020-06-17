import React from 'react';
import WebMidi from 'webmidi';
import * as Data from './Data';

const useAnimationFrame = (callback, isRunning) => {
    const request = React.useRef();
    const prevTime = React.useRef();

    React.useEffect(() => {
        const animate = (time) => {
            if (isRunning && prevTime.current !== undefined) {
                callback(time - prevTime.current);
            }
            prevTime.current = time;
            request.current = requestAnimationFrame(animate);
        };

        request.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(request.current);
    }, [callback, isRunning]);
};

const SmoothMidiLooper = () => {
    const [midiOut, setMidiOut] = React.useState(null);
    const [playing, setPlaying] = React.useState(false);
    const [startTime, setStartTime] = React.useState(null);
    const [beat, setBeat] = React.useState(0);
    const bpm = 66;
    const beats = 16;
    const midiChannel = 2;
    const shift = 18;

    const msPerBeat = React.useMemo(() => 6e4 / bpm, [bpm]);

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
        if (!playing) {
            console.log("should play. did not.");
            return;
        }
        console.time('triggerAllNotes');
        const activeTracks = Data.tracks.filter(track => track.active);
        activeTracks.forEach(track => {
            track.notes.forEach(note => {
                const notePitch = note.pitch + shift;
                if (notePitch < 0 || notePitch > 127) {
                    console.warn(`can't play note ${notePitch}`);
                } else {
                    midiOut.playNote(notePitch, midiChannel, {
                        time: '+' + note.start * msPerBeat,
                        duration: note.duration * msPerBeat,
                        velocity: Math.random()
                    })
                }
            })
        });
        console.timeEnd('triggerAllNotes');
    }, [midiOut, msPerBeat, playing]);

    React.useEffect(() => {
        console.log("Triggy", WebMidi.time, startTime, WebMidi.time - startTime);
        if(playing) {
            triggerPlayback();
        }
    }, [startTime, triggerPlayback, playing]);

    const playLoop = React.useCallback(msDelta => {
        const realBeat = (WebMidi.time - startTime) * bpm / 6e4;
        setBeat(realBeat);
        if (realBeat > beats) {
            setStartTime(WebMidi.time);
        }
    }, [startTime, setStartTime, setBeat, bpm]);

    useAnimationFrame(playLoop, playing);

    const togglePlay = React.useCallback(event => {
        setPlaying(state => !state);
        if (!playing) {
            setStartTime(WebMidi.time);
            setBeat(0);
        } else {
            [...Array(128).keys()].forEach(note => {
                midiOut.stopNote(note);
            }); // doesn't work yet
        }
    }, [playing, setStartTime, setBeat, midiOut]);

    return <>
        <button onClick={togglePlay}>
        {
            playing ? "Stop" : "Play"
        }
        </button>
        <span style={{marginLeft: 20}}>
            {beat.toFixed(2)}
        </span>
    </>;
}

export default SmoothMidiLooper;