import React from 'react';
import {useStore} from './Store';
import {playMidi} from './MiscLogic';

const Selector = () => {
    const {state, dispatch} = useStore();
    const {midiStore, tracks} = state;

    return <>
        <ul>
            {tracks.map((track, index) =>
                <li key={index}>
                    <b>{track}</b>:
                    <div>
                        {midiStore[track] ?
                            midiStore[track].map((midi, mIndex) =>
                                <button key={mIndex}
                                    onClick={() => playMidi(dispatch, midi)}>
                                    {midi.title}
                                </button>
                            )
                        :
                            "empty"
                        }
                    </div>
                </li>
            )}
        </ul>
    </>
}

export default Selector;

