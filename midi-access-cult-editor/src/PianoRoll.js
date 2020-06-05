import React from 'react';
import {useStore} from './Store';
import styled from 'styled-components';

const BASE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const isBlack = note => note.includes('#');

const NOTES = [];
for (let octave = -1; octave < 10; octave++) {
    BASE_NOTES.forEach(note => NOTES.push(`${note}${octave}`));
}

const geometry = {
    pianoWidth: 27,
    barWidth: 60,
    pianoHeight: 7,
};
geometry.totalHeight = (geometry.pianoHeight + 3) * NOTES.length;

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
    background-color: ${props => props.black ? '#101010C0' : '#00500080'};
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
`

const KeyRow = ({note, width}) =>
    <KeyRowDiv black={isBlack(note)} width={width}>
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
    top: ${props => geometry.totalHeight - (props.note.pitch + 1) * (geometry.pianoHeight + 3)}px;
    height: ${geometry.pianoHeight + 2}px;
    left: ${props => geometry.pianoWidth + props.note.start * props.beatWidth}px;
    width: ${props => props.note.duration * props.beatWidth - 1}px;
    background-color: hsl(${props => props.color}, 100%, 50%);
    border: none;
    border-radius: 2px;
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
    background-color: #242;
    height: 80vh;
    overflow: scroll;
    position: relative;
`

const getNotesFromFirstTrack = (data) => {
    if (!data.tracks) {
        return [];
    }
    const scaleTicks = ticks => +(ticks / data.header.ppq / 4).toFixed(3);
    return data.tracks[0].notes.map(note => ({
        pitch: note.midi,
        start: scaleTicks(note.ticks),
        duration: scaleTicks(note.durationTicks),
        vel: note.velocity
    }));
};

const PianoRoll = () => {
    const {state} = useStore();
    const [track] = React.useState({
        beats: 4,
        barsInBeat: 4,
        colorHue: Math.floor(360 * Math.random()),
    });
    const beatWidth = React.useMemo(() => track.barsInBeat * geometry.barWidth, [track]);
    const rowWidth = React.useMemo(() => geometry.pianoWidth + track.beats * track.barsInBeat * geometry.barWidth, [track]);
    //const canvasRef = React.useRef();
    const lastNoteRef = React.useRef();

    React.useEffect(() => {
        document.title = "Cult210: " + state.selected.title;
        if (lastNoteRef.current) {
            lastNoteRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [state.selected]);

    const notes = React.useMemo(() => getNotesFromFirstTrack(state.selected.data), [state.selected.data]);
    console.log(notes);

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
            {notes.map((note, index) => {
                return <Note key={index} note={note} beatWidth={beatWidth} ref={lastNoteRef} color={track.colorHue}/>
            })}
        </Roll>
    </>;
};

export default PianoRoll;