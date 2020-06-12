import React from 'react';
import * as Recoil from 'recoil';
import * as ReactDnd from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {geometry, RollDiv, KeyRow, Beat, Bar, Note, NoteType, PlayBar} from './components/PianoComponents';
import {NOTES} from './utils/NoteUtils';
import * as State from './state';

const quantX = 1/32;
const quantY = 1;
const quantize = (x, q) => Math.round(x/q) * q;

const Roll = (props) => {
    const updateNote = props.updateNote;
    const [, drop] = ReactDnd.useDrop({
        accept: NoteType,
        drop: (note, monitor) => {
            const delta = monitor.getDifferenceFromInitialOffset();
            note.start = Math.max(quantize(note.start + delta.x / geometry.beatWidth, quantX), 0);
            note.pitch = quantize(note.pitch - delta.y / geometry.pianoHeight, quantY);
            updateNote(note);
            return undefined
        }
    });
    return <RollDiv ref={drop}>
        {props.children}
    </RollDiv>
};

const PianoRoll = () => {
    const session = Recoil.useRecoilValue(State.session);
    const latestTrack = Recoil.useRecoilValue(State.latestTrack);
    const [tracks, setTracks] = Recoil.useRecoilState(State.tracks);
    const [selectedTrackName, setSelectedTrackName] = Recoil.useRecoilState(State.selectedTrackName);
    const playState = Recoil.useRecoilValue(State.playState);
    const someCenterRef = React.useRef();

    const barWidth = geometry.beatWidth / session.barsInBeat;
    const rowWidth = geometry.pianoWidth + session.beats * geometry.beatWidth;

    React.useEffect(() => {
        if (someCenterRef.current) {
            someCenterRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [latestTrack]);

    return <>
        <ReactDnd.DndProvider backend={HTML5Backend}>
            <Roll updateNote={note => State.updateNote(setTracks, selectedTrackName, note)}>
                {NOTES.slice().reverse().map((note, index) =>
                    <KeyRow
                        key={index}
                        note={note}
                        width={rowWidth}
                        someCenterRef={someCenterRef}
                    />
                )}
                {[...Array(session.beats).keys()].map((beat) =>
                    <Beat
                        key={beat}
                        index={beat}>
                        {[...Array(session.barsInBeat).keys()].map((bar) =>
                            <Bar key={bar} index={bar} width={barWidth}/>
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
                            onMouseDown={() => setSelectedTrackName(track.name)}
                        />
                    )
                )}
                <PlayBar state={playState}/>
            </Roll>
        </ReactDnd.DndProvider>
    </>;
};

export default PianoRoll;