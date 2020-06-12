import React from 'react';
import {useRecoilState} from 'recoil';
import * as Store from './Store';
import {loadMidiTrack} from './StoreLogic';
import {LargeCheckBox, ChannelSpinBox, DebugButton} from './components/SharedComponents';

const Selector = () => {
    const {state, dispatch} = Store.useStore();
    const {midiStore, tracks} = state;

    const [, setStoredTrackName] = useRecoilState(Store.trackName);

    return <>
        <ul>
            {tracks.map((track, index) =>
                <li key={index}>
                    <LargeCheckBox
                        checked={track.active}
                        onChange={event => dispatch({
                            type: Store.TOGGLE_TRACK,
                            payload: {track, value: event.target.value}
                        })}
                    />
                    <b>{track.name}</b>:
                    channel <ChannelSpinBox
                        value={track.channel}
                        onChange={event => dispatch({
                            type: Store.SET_TRACK_CHANNEL,
                            payload: {track, value: event.target.value}
                        })}
                    />
                    <div>
                        {midiStore[track.name]
                            ? midiStore[track.name].map((midi, mIndex) =>
                                <button key={mIndex}
                                    onClick={() => {loadMidiTrack(dispatch, midi); setStoredTrackName(midi.title);}}
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

