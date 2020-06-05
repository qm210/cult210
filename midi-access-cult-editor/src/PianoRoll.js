import React from 'react';
import {useStore} from './Store';
import styled from 'styled-components';
import './style/PianoRoll.css'

const BASE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const isBlack = note => note.includes('#');

const NOTES = [];
for (let octave = -1; octave < 10; octave++) {
    BASE_NOTES.forEach(note => NOTES.push(`${note}${octave}`));
}

const geometry = {
    pianoWidth: 25,
    barWidth: 35,
    pianoHeight: 7,
    totalHeight: (7 + 3) * NOTES.length,
};

const Key = styled.div`
    width: ${geometry.pianoWidth}px;
    border: 1px solid black;
    background-color: ${props => props.black ? 'black' : 'white'};
    color: ${props => props.black ? 'white' : 'black'};
    font-size: .55rem;
    font-weight: bold;
    line-height: ${geometry.pianoHeight}px;
`

const KeyRowDiv = styled.div`
    width: ${props => props.width}px;
    border-bottom: 1px solid black;
    background-color: #FFFFFF80;
`

const KeyRow = ({note, width}) =>
    <KeyRowDiv width={width}>
        <Key black={isBlack(note)}>
            {note}
        </Key>
    </KeyRowDiv>

const Frame = styled.div`
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    position: absolute;
    width: ${props => props.width ? props.width + 'px' : '100%'};
    height: ${props => props.height || geometry.totalHeight}px;
    top: ${props => props.top || 0}px;
    left: ${props => props.left || 0}px;
    border-right: 1px solid ${props => props.color || 'black'};
`

const Note = styled(Frame)`
    background-color: black;
    border: none;
    border-radius: 3px;
`

const barColor = '#008000';

const Bar = styled(Frame)`
    width: ${geometry.barWidth}px;
    left: ${props => props.index * geometry.barWidth + (props.offset || 0)}px;
    border-right: 1px dashed ${barColor};
`

const Beat = styled(Frame)`
    left: ${props => geometry.pianoWidth + props.index * props.width}px;
    border-right: 2px solid ${barColor};
`

const Roll = styled.div`
    min-width: 60vw;
    border: 2px solid black;
    border-radius: 4px;
    background-color: #00FF0020;
    height: 80vh;
    overflow: scroll;
    position: relative;
`

const parseFirstMidiTrack = (data) => {
    const track = data.tracks[0];
    const division = data.division;
    const notes = [];
    let bpm = 140;
    let eot = false;
    track.forEach(midiEvent => {
        if (midiEvent.noteOn) {
            notes.push({
                start: midiEvent.delta / division,
                end: undefined,
                pitch: midiEvent.noteOn.noteNumber,
                vel: midiEvent.noteOn.velocity,
                channel: midiEvent.channel
            });
        }
        else if (midiEvent.noteOff) {
            notes.filter(note => note.end === undefined && note.channel === midiEvent.channel)
                .find(note => note.pitch === midiEvent.noteOff.noteNumber)
                .end = midiEvent.delta / division;
        }
        else if (midiEvent.setTempo) {
            bpm = 6e7/midiEvent.setTempo.microsecondsPerBeat;
        }
        else if (midiEvent.endOfTrack) {
            eot = true;
        }
        else {
            console.warn("unrecognized midi event:", midiEvent);
        }
    });
    return {
        bpm,
        notes,
        // do need? know not. enywhey:
        division,
        eot
    }
};

const PianoRoll = () => {
    const {state, dispatch} = useStore();
    const [track, setTrack] = React.useState({
        beats: 8,
        barsInBeat: 4,
        notes: []
    });
    const beatWidth = React.useMemo(() => track.barsInBeat * geometry.barWidth, [track]);
    const rowWidth = React.useMemo(() => geometry.pianoWidth + track.beats * track.barsInBeat * geometry.barWidth, [track]);
    const canvasRef = React.useRef();

    React.useEffect(() => {
        document.title = "Cult210: " + state.selected.title;
        if (state.selected.data.tracks) {
            setTrack({...track, ...parseFirstMidiTrack(state.selected.data)}); // TOOD: enhance for multi-track files. there are three MIDI formats.
        }
    }, [state.selected]);

    const noteCoord = beat => geometry.pianoWidth + beat * beatWidth;
    const noteWidth = note => (note.end - note.start) * beatWidth;
    const getCoord = ({on, off}) => ({
        start: geometry.pianoWidth + on * beatWidth,
        end: geometry.pianoWidth + off * beatWidth
    });

    return <>
        <div>
            {state.selected.title || "nothing selected"}
        </div>
        <Roll>
            {NOTES.slice().reverse().map((note, index) =>
                <KeyRow key={index} note={note} width={rowWidth}/>
            )}
            {[...Array(track.beats).keys()].map((beat) =>
                <Beat
                    key={beat}
                    index={beat}
                    width={beatWidth}>
                    {[...Array(track.barsInBeat).keys()].map((bar) =>
                        <Bar
                            key={bar}
                            index={bar}
                        />
                    )}
                </Beat>
            )}
        </Roll>
        {track.notes.map((note, index) => {
            console.log(note, noteCoord(note.start), noteWidth(note));
            return <Note top={200 - 10 * note.pitch} left={noteCoord(note.start)} width={noteWidth(note)}/>
        })}
    </>;
};

export default PianoRoll;