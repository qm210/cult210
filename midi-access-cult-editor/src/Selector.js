import React from 'react';
import {useStore, TOGGLE_TRACK} from './Store';
import {loadMidiTrack} from './StoreLogic';
import styled from 'styled-components';

const LargeCheckBox = props =>
    <input type="checkbox" {...props} style={{
        width: 20,
        height: 20,
        marginRight: 10,
    }}/>;

const RedButton = styled.button`
    background-color: #800010;
    font-size: 20;
`
const DebugButton = (props) => <RedButton {...props}>DEBUG</RedButton>;

const Selector = () => {
    const {state, dispatch} = useStore();
    const {midiStore, tracks} = state;

    return <>
        <ul>
            {tracks.map((track, index) =>
                <li key={index}>
                    <LargeCheckBox
                        checked={track.active}
                        onChange={event => dispatch({
                            type: TOGGLE_TRACK,
                            payload: {
                                track,
                                value: event.target.value
                            }
                        })}
                    />
                    <b>{track.name}</b>:
                    <div>
                        {midiStore[track.name]
                            ? midiStore[track.name].map((midi, mIndex) =>
                                <button key={mIndex}
                                    onClick={() => loadMidiTrack(dispatch, midi)}
                                    style={{
                                        backgroundColor: track.active ? "purple" : "gray",
                                        borderColor: midi.title === track.selectedPattern ? "red" : "white"
                                    }}
                                    >
                                    {midi.title}
                                </button>)
                            : "empty"
                        }
                    </div>
                </li>
            )}
        </ul>
        <DebugButton onClick={() => console.log(state)}/>
    </>
}

export default Selector;

