import React from 'react';
import * as Recoil from 'recoil';
import {Midi} from '@tonejs/midi';
import * as State from './state';
import {LargeCheckBox, TransposeSpinBox, ChannelSpinBox, DebugButton} from './components';

const TrackPanel = () => {
    const [tracks, setTracks] = Recoil.useRecoilState(State.tracks);
    const setSelectedTrackName = Recoil.useSetRecoilState(State.selectedTrackName);
    const [midiStore, setMidiStore] = Recoil.useRecoilState(State.midiStore);
    //const activeTracks = React.useMemo(() => tracks.filter(track => track.active), [tracks]); // Recoil.useRecoilValue() throws that shady Batcher setState() warnin...

    React.useEffect(() => {
        const updateNotes = (setTracks, track, notes) =>
            setTracks(currentTracks =>
                currentTracks.map(currentTrack =>
                    currentTrack.name === track.name
                        ? {
                        ...track,
                        notes
                        }
                        : currentTrack
        ));

        const loadPatternFromMidi = async (filename) => {
            console.log('u ded?', filename)
            return;
            const midiData = await Midi.fromUrl(`/midis/${filename}`);
            console.log("OK", filename, midiData);
            return State.getNotesFromFirstTrack(midiData)
        };

        const updateNotesFrom = async (pendingLoads) => {
            const loadedLoads = await Promise.all(
                pendingLoads.map(load => loadPatternFromMidi(load.file))
            );
            setTracks(state => state.map(track => {
                const loadIndex = pendingLoads.findIndex(load => load.track === track);
                return (loadIndex >= 0)
                    ? {
                        ...track,
                        notes: loadedLoads[loadIndex]
                    }
                    : track;
            }));
        }

        console.log("TRACKS ARE", tracks, midiStore);
        const pendingLoads = [];
        tracks.forEach(async (track) => {
            console.log(track, midiStore);
            let notes = track.notes;
            if (notes == null) {
                notes = [];
                const findPattern = midiStore.find(
                    pattern => pattern.title === track.selectedPattern
                );
                console.log("leeeeel", findPattern);
                if (findPattern !== undefined) {
                    if (!findPattern.data) {
                        pendingLoads.push({
                            track,
                            file: findPattern.filename,
                        });
                    }
                    notes = findPattern.notes;
                }
                console.log("gonne change teh shit!", notes);
                updateNotes(setTracks, track, notes);
            }
        });
        console.log("YO", pendingLoads);
        updateNotesFrom(pendingLoads);
        /*
        pendingLoads.forEach(item => {
            const midiData = await loadPatternFromMidi(findPattern.filename);
            console.log("AHA", midiData);
            updateNotes(setTracks, track, midiData);
            // setMidiStore(state =>)
        })
        */
    }, [midiStore, tracks]);

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
            </div>
        )}
        <DebugButton onClick={() => console.log(tracks)}/>
    </>;
}

export default TrackPanel;