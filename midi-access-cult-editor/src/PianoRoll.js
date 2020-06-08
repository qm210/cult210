import React from 'react';
import styled from 'styled-components';
import * as Store from './Store';
import {DndProvider, useDrag, useDrop} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';

const BASE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const isBlack = note => note.includes('#');

const NOTES = [];
for (let octave = -1; octave < 10; octave++) {
    BASE_NOTES.forEach(note => NOTES.push(`${note}${octave}`));
}

const geometry = {
    pianoWidth: 27,
    beatWidth: 210,
    pianoHeight: 9,
};
geometry.totalHeight = geometry.pianoHeight * NOTES.length;

const Key = styled.div`
    width: ${geometry.pianoWidth}px;
    border: 1px solid black;
    background-color: ${props => props.black ? 'black' : 'white'};
    color: ${props => props.black ? 'white' : 'black'};
    font-size: .55rem;
    font-weight: bold;
    line-height: ${geometry.pianoHeight - 3}px;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
`

const KeyRowDiv = styled.div`
    width: ${props => props.width}px;
    border-bottom: 1px solid black;
    background-color: ${props => props.black ? '#101010C0' : '#00500080'};
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
`

const KeyRow = ({note, width, someCenterRef}) =>
    <KeyRowDiv black={isBlack(note)} width={width}>
        <Key black={isBlack(note)} ref={note === 'A6' ? someCenterRef : null}>
            {note}
        </Key>
    </KeyRowDiv>;

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

const NoteFrame = styled(Frame)`
    height: ${geometry.pianoHeight}px;
    ${props => `
        top: ${geometry.totalHeight - (props.note.pitch + 1) * geometry.pianoHeight - 1}px;
        left: ${geometry.pianoWidth + props.note.start * geometry.beatWidth}px;
        width: ${props.note.duration * geometry.beatWidth - 1}px;
        background-color: hsla(${props.color}, 100%, ${props.note.selected ? 60 : 50}%, ${props.trackSelected ? 100 : 50}%);
        border: 1px solid hsla(${props.color}, 100%, ${props.note.selected ? 100 : 50}%, 50%);
    `}
    border-radius: 2px;
`
const NoteType = 'Note';
const Note = (props) => {
    const {note} = props;
    const [{isDragging}, drag] = useDrag({
        item: {...note, type: NoteType},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        })
    });
    return isDragging ? <div ref={drag}/> :
        <NoteFrame
            ref={drag}
            {...props}
        />;
};

const barColor = '#008000';

const Bar = styled(Frame)`
    width: ${props => props.width}px;
    left: ${props => props.index * props.width + (props.offset || 0)}px;
    border-right: 1px dashed ${barColor};
`

const Beat = styled(Frame)`
    width: ${geometry.beatWidth}px;
    left: ${props => geometry.pianoWidth + props.index * geometry.beatWidth}px;
    border-right: 2px solid ${barColor};
`

const RollDiv = styled.div`
    min-width: 60vw;
    border: 2px solid black;
    border-radius: 4px;
    background-color: #242;
    height: 80vh;
    overflow: scroll;
    position: relative;
`

const quantize = (x, q) => Math.round(x/q) * q;

const Roll = (props) => {
    const {dispatch} = Store.useStore();
    const quantX = 1/32;
    const quantY = 1;
    const [, drop] = useDrop({
        accept: NoteType,
        drop: (note, monitor) => {
            const delta = monitor.getDifferenceFromInitialOffset();
            note.start = Math.max(quantize(note.start + delta.x / geometry.beatWidth, quantX), 0);
            note.pitch = quantize(note.pitch - delta.y / geometry.pianoHeight, quantY);
            dispatch({
                type: Store.UPDATE_NOTE,
                payload: note
            });
            return undefined
        }
    });
    return <RollDiv ref={drop}>
        {props.children}
    </RollDiv>
};

// TODO: think about React.memo()..? - custom "track hash" equality check..?

const PianoRoll = () => {
    const {state, dispatch} = Store.useStore();
    const [global] = React.useState({
        beats: 4,
        barsInBeat: 4,
    });
    const barWidth = React.useMemo(() => geometry.beatWidth / global.barsInBeat, [global]);
    const rowWidth = React.useMemo(() => geometry.pianoWidth + global.beats * geometry.beatWidth, [global]);
    const someCenterRef = React.useRef();

    React.useEffect(() => {
        document.title = "Cult210: " + state.selected.title;
        if (someCenterRef.current) {
            someCenterRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [state.selected]);

    return <>
        <div>
            {state.selected.title || "nothing selected"}
        </div>
        <DndProvider backend={HTML5Backend}>
            <Roll>
                {NOTES.slice().reverse().map((note, index) =>
                    <KeyRow
                        key={index}
                        note={note}
                        width={rowWidth}
                        someCenterRef={someCenterRef}
                    />
                )}
                {[...Array(global.beats).keys()].map((beat) =>
                    <Beat
                        key={beat}
                        index={beat}>
                        {[...Array(global.barsInBeat).keys()].map((bar) =>
                            <Bar key={bar} index={bar} width={barWidth}/>
                        )}
                    </Beat>
                )}
                {state.tracks.filter(track => track.active).map(track =>
                    track.notes.map((note, index) =>
                        <Note
                            key={index}
                            note={note}
                            color={track.hue}
                            trackSelected={track.name === state.selectedTrackName}
                            onClick={() => dispatch({
                                type: Store.SELECT_TRACK_BY_NAME,
                                payload: track.name
                            })}
                        />
                    )
                )}
            </Roll>
        </DndProvider>
    </>;
};

export default PianoRoll;