import React from 'react';
import * as Recoil from 'recoil';
import Midi from '@tonejs/midi';
import * as State from './state';
import {LargeCheckBox, ChannelSpinBox} from './components';

const Selector = () => {
    const [tracks, setTracks] = Recoil.useRecoilState(State.tracks);
    const midiStore = Recoil.useRecoilValue(State.midiStore);
    const setLatestTrack = Recoil.useSetRecoilState(State.latestTrack);
    const setSelectedTrackName = Recoil.useSetRecoilState(State.selectedTrackName);

    const loadTrackFromMidi = async (midi) => {
        const midiUrl = `/midis/${midi.filename}`;
        const midiData = await Midi.fromUrl(midiUrl);
        State.updateTrackFromMidi(setTracks, {...midi, data: midiData});
        setLatestTrack({
            title: midi.title,
            filename: midi.filename,
        });
        setSelectedTrackName(midi.track);
    };

    return <ul>
        {tracks.map((track, index) =>
            <li key={index}>
                <LargeCheckBox
                    checked={track.active}
                    onChange={event => State.toggleTrack(setTracks, {track, value: event.target.value})}
                />
                <b>{track.name}</b>:
                channel <ChannelSpinBox
                    value={track.channel}
                    onChange={event => State.setTrackChannel(setTracks, {track, value: event.target.value})}
                />
                <div>
                    {midiStore[track.name]
                        ? midiStore[track.name].map((midi, mIndex) =>
                            <button key={mIndex}
                                onClick={() => loadTrackFromMidi(midi)}
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
};

export default Selector;

