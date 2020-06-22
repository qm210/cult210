import React from 'react';
import * as Recoil from 'recoil';
import * as ReactDnd from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import useLocalStorageState from './utils/useLocalStorageState';
import {geometry, RollDiv, KeyRow, Beat, Bar, Note, NoteType, PlayBar} from './components/PianoComponents';
import {NOTES} from './utils/NoteUtils';
import * as State from './state';

const quantX = 1/32;
const quantY = 1;
const quantize = (x, q) => Math.round(x/q) * q;

const convertOffsetXToStart = (x, shift = 0, quant = quantX) =>
    Math.max(quantize(shift + x / geometry.beatWidth, quant), 0);

const convertOffsetYToPitch = (y, shift = 0, quant = quantY) =>
    quantize(shift - y / geometry.pianoHeight, quant);

const Roll = React.forwardRef((props, ref) => {
    const updateNote = props.updateNote;
    const [, drop] = ReactDnd.useDrop({
        accept: NoteType,
        drop: (note, monitor) => {
            const delta = monitor.getDifferenceFromInitialOffset();
            note.start = convertOffsetXToStart(delta.x, note.start);
            note.pitch = convertOffsetYToPitch(delta.y, note.pitch);
            updateNote(note);
            return undefined
        }
    });
    return <div ref={ref}>
        <RollDiv ref={drop} {...props}>
            {props.children}
        </RollDiv>
    </div>
});

const PianoRoll = () => {
    const [session] = useLocalStorageState('session', State.defaultSession);
    const latestTrack = Recoil.useRecoilValue(State.latestTrack);
    const [tracks, setTracks] = Recoil.useRecoilState(State.tracks);
    const [selectedTrackName, setSelectedTrackName] = Recoil.useRecoilState(State.selectedTrackName);
    const playState = Recoil.useRecoilValue(State.playState);
    const [editor, setEditor] = React.useState({
        nextNoteDuration: .25,
    });
    const scrollTop = React.useRef(0);
    const someCenterRef = React.useRef();
    const rollRef = React.createRef();

    const barWidth = geometry.beatWidth / session.barsInBeat;
    const rowWidth = geometry.pianoWidth + session.beats * geometry.beatWidth;

    React.useEffect(() => {
        if (someCenterRef.current) {
            someCenterRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [latestTrack]);

    const leftClickOnNote = React.useCallback((event, track, note) => {
        setSelectedTrackName(track.name);
        State.selectNote(setTracks, track.name, note);
        setEditor(state => ({
            ...state,
            nextNoteDuration: note.duration
        }))
    }, [setSelectedTrackName, setEditor, setTracks]);

    const rightClickOnNote = React.useCallback((event, track, note) => {
        event.preventDefault();
        setSelectedTrackName(track.name);
        State.deleteNote(setTracks, track.name, note);
    }, [setSelectedTrackName, setTracks]);

    const leftClickOutsideNote = React.useCallback((event) => {
        if (!selectedTrackName) {
            return;
        }
        const rectOfRoll = rollRef.current.getBoundingClientRect();
        const positionCorrection = {
            x: rectOfRoll.left + document.documentElement.scrollLeft + geometry.pianoWidth,
            y: scrollTop.current - rectOfRoll.top - document.documentElement.scrollTop
        }
        const noteStart = convertOffsetXToStart(event.pageX - positionCorrection.x, -.5 * editor.nextNoteDuration, editor.nextNoteDuration);
        const notePitch = NOTES.length - convertOffsetYToPitch(-event.pageY - positionCorrection.y, 0.5);
        const newNote = State.addNote(setTracks, selectedTrackName, {
            start: noteStart,
            pitch: notePitch,
            duration: editor.nextNoteDuration,
            velocity: 0.5, // TODO
        });
        State.selectNote(setTracks, selectedTrackName, newNote);
        console.log(newNote);
    }, [rollRef, editor, selectedTrackName, setTracks]);

    const rightClickOutsideNote = React.useCallback((event) => {
        event.preventDefault();
    }, []);

    const scrollRoll = (event) => {
        scrollTop.current = event.target.scrollTop;
//        console.log(event, event.target.scrollHeight, event.target.scrollTop, event.target.clientHeight)
    }

    return <>
        <ReactDnd.DndProvider backend={HTML5Backend}>
            <Roll
                ref = {rollRef}
                onScroll = {scrollRoll}
                updateNote = {note => State.updateNote(setTracks, selectedTrackName, note)}
                >
                {NOTES.slice().reverse().map((note, index) =>
                    <KeyRow
                        key = {index}
                        note = {note}
                        width = {rowWidth}
                        someCenterRef = {someCenterRef}
                    />
                )}
                {[...Array(session.beats).keys()].map((beat) =>
                    <Beat
                        key = {beat}
                        index = {beat}>
                        {[...Array(session.barsInBeat).keys()].map((bar) =>
                            <Bar
                                key = {bar}
                                index = {bar}
                                width = {barWidth}
                                onClick = {event => leftClickOutsideNote(event)}
                                onContextMenu = {event => rightClickOutsideNote(event)}
                            />
                        )}
                    </Beat>
                )}
                {tracks.filter(track => track.active).map(track =>
                    track.notes.map((note, index) =>
                        <Note
                            key={index}
                            note={note}
                            color={track.hue}
                            trackSelected={track.name === selectedTrackName}
                            onMouseDown={event => leftClickOnNote(event, track, note)}
                            onContextMenu={event => rightClickOnNote(event, track, note)}
                        />
                    )
                )}
                {<PlayBar state={playState}/>}
            </Roll>
        </ReactDnd.DndProvider>
        <div style={{marginTop: 10, color: 'black', fontWeight: 'bold'}}>
            <span>
                Ich hoffe, Ihrem Stuhl geht es gut!
            </span>
            <button>Naja... undo.</button>
            <button>Store</button>
            <button>Random</button>
        </div>
    </>;
};

export default PianoRoll;