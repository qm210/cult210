import React from 'react';
import * as Recoil from 'recoil';
import {Midi} from '@tonejs/midi';
import * as State from './state';
import {LargeCheckBox, TransposeSpinBox, ChannelSpinBox, DebugButton} from './components';

const Selector = () => {
    const [tracks, setTracks] = Recoil.useRecoilState(State.tracks);
    const midiStore = Recoil.useRecoilValue(State.midiStore);
    const setLatestTrack = Recoil.useSetRecoilState(State.latestTrack);
    const setSelectedTrackName = Recoil.useSetRecoilState(State.selectedTrackName);
    const activeTracks = React.useMemo(() => tracks.filter(track => track.active), [tracks]); // Recoil.useRecoilValue() throws that shady Batcher setState() warnin...

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

    return <>
        {tracks.map((track, index) =>
            <div key={index}>
                <LargeCheckBox
                    checked = {track.active}
                    onChange = {event => State.updateTrack(setTracks, track.name, {active: event.target.checked})}
                    style = {{
                        marginTop: 10
                    }}
                />
                <span style={{
                    fontWeight: 'bold',
                    marginRight: 50
                    }}>
                    {track.name}
                </span>
                <span style={{float: 'right', top: -20}}>
                    oct <TransposeSpinBox
                        value={track.transposeOctaves}
                        onChange={event => State.updateTrack(setTracks, track.name, {transposeOctaves: event.target.value})}
                    />
                    CH <ChannelSpinBox
                        value={track.channel}
                        onChange={event => State.updateTrack(setTracks, track.name, {channel: event.target.value})}
                    />
                </span>
                <div>
                    <select
                        id = {`${track.name}-pattern`}
                        size = {2}
                        style = {{
                            width: '100%',
                        }}
                        >
                        {midiStore[track.name]
                            ? midiStore[track.name].map((midi, mIndex) =>
                                <option
                                    key = {mIndex}
                                    onClick = {() => loadTrackFromMidi(midi)}
                                    defaultValue = {mIndex === midiStore[track.name].length - 1} // TODO: unfinished, whatever I intended to do here
                                    style = {{
                                        backgroundColor: track.active ? "purple" : "gray",
                                        borderColor: midi.title === track.selectedPattern ? "red" : "white",
                                        fontSize: '.8rem'
                                    }}
                                    >
                                    {midi.title}
                                </option>)
                            : "empty"
                        }
                    </select>
                </div>
            </div>
        )}
        <div>
            <button className="alert" onClick={() => State.setTracksFromMidiStore(setTracks, midiStore)}>
                    Re-Init
            </button>
            <DebugButton onClick={() => console.log(JSON.stringify(activeTracks))}/>
        </div>
    </>
};

export default Selector;

