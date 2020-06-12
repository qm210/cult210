import React from 'react';
import {useRecoilState} from 'recoil';
import * as ReactDnd from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {geometry, RollDiv, KeyRow, Beat, Bar, Note, NoteType} from './components/PianoComponents';
import {NOTES} from './NoteUtils';
import * as Store from './Store';

const quantX = 1/32;
const quantY = 1;
const quantize = (x, q) => Math.round(x/q) * q;

const Roll = (props) => {
    const {dispatch} = Store.useStore();
    const [, drop] = ReactDnd.useDrop({
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

const PianoRoll = () => {
    const {state, dispatch} = Store.useStore();
    const barWidth = geometry.beatWidth / state.header.barsInBeat;
    const rowWidth = geometry.pianoWidth + state.header.beats * geometry.beatWidth;
    const someCenterRef = React.useRef();

    React.useEffect(() => {
        document.title = "Cult210: " + state.selected.title;
        if (someCenterRef.current) {
            someCenterRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [state.selected]);

    const [storedTrackName] = useRecoilState(Store.trackName);
    const [storedNoteName, setStoredNoteName] = useRecoilState(Store.noteName);

    return <>
        <h2>{storedTrackName} {storedNoteName}</h2>
        <ReactDnd.DndProvider backend={HTML5Backend}>
            <Roll>
                {NOTES.slice().reverse().map((note, index) =>
                    <KeyRow
                        key={index}
                        note={note}
                        width={rowWidth}
                        someCenterRef={someCenterRef}
                    />
                )}
                {[...Array(state.header.beats).keys()].map((beat) =>
                    <Beat
                        key={beat}
                        index={beat}>
                        {[...Array(state.header.barsInBeat).keys()].map((bar) =>
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
                            onMouseDown={() => {setStoredNoteName(note.id);
                                dispatch({
                                type: Store.SELECT_TRACK_BY_NAME,
                                payload: track.name
                            })}}
                        />
                    )
                )}
            </Roll>
        </ReactDnd.DndProvider>
    </>;
};

export default PianoRoll;