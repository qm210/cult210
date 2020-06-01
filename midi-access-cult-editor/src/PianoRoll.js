import React from 'react';
import {useStore} from './Store';
import styled from 'styled-components';
import './style/PianoRoll.css'

const BASE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const isBlack = note => note.includes('#');

const notes = [];
for (let octave = -1; octave < 10; octave++) {
    BASE_NOTES.forEach(note => notes.push(`${note}${octave}`));
}

const Key = styled.div`
    width: 20px;
    border: 1px solid black;
    background-color: ${props => props.black? 'black': 'white'};
    color: ${props => props.black? 'white': 'black'};
    font-size: .55rem;
    font-weight: bold;
    line-height: .55rem;
`

const KeyRow = styled.div`
    width: ${props => props.length}px;
    border-bottom: 1px solid black;
    background-color: #FFFFFF80;
`

const Roll = styled.div`
    min-width: 60vw;
    border: 2px solid black;
    border-radius: 4px;
    background-color: green;
    height: 80vh;
    overflow: scroll;
`

const PianoRoll = () => {
    const {state, dispatch} = useStore();
    const [track, setTrack] = React.useState({
        beats: 4,
    });
    const [barStyle, setBarStyle] = React.useState({
        width: '1rem',
    });
    const [beatStyle, setBeatStyle] = React.useState({
        bars: 4,
    })
    const canvasRef = React.useRef();

    React.useEffect(() => {
        document.title = "Cult210: " + state.selected.title;
        console.log(state.selected.data);
    }, [state.selected]);

    return <>
        <div>
            {state.selected.title || "nothing selected"}
        </div>
        <Roll>
        {
        notes.slice().reverse().map((note, index) =>
            <>
                <Key black={isBlack(note)}>
                    {note}
                </Key>
                <KeyRow length={track.beats * beatStyle.bars * barStyle.width}/>
            </>
        )
        }
        </Roll>
    </>;
};

export default PianoRoll;