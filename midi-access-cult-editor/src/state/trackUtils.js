import {newTrack, getNotesFromFirstTrack} from './logic';

export const setTracksFromMidiStore = (setTracks, payload) =>
    setTracks(tracks => {
        const newTracks = [...tracks];
        const oldTrackNames = tracks.map(track => track.name);
        const newTrackNames = Object.keys(payload).filter(trackName =>
            !(trackName in oldTrackNames)
        );
        newTrackNames.forEach(trackName =>
            newTracks.push(newTrack(trackName))
        );
        return newTracks;
    });

export const updateTrackFromMidi = (setTracks, payload) =>
    setTracks(tracks =>
        tracks.map(track =>
            track.name === payload.track
                ? {
                    ...track,
                    active: true,
                    selectedPattern: payload.title,
                    notes: getNotesFromFirstTrack(payload.data),
                }
                : track
        )
    );

export const setTrackChannel = (setTracks, {trackName, channel}) =>
    setTracks(tracks =>
        tracks.map(track =>
            track.name === trackName ? {...track, channel}: track
    ));


export const toggleTrack = (setTracks, {trackName, nowActive}) =>
    setTracks(tracks =>
        tracks.map(track =>
            track.name === trackName ? {...track, active: nowActive} : track
        ));

export const updateNote = (setTracks, trackName, noteUpdate) =>
    setTracks(tracks =>
        tracks.map(track =>
            track.name === trackName
                ? {
                    ...track,
                    notes: track.notes.map(note =>
                        note.id === noteUpdate.id ? noteUpdate : note
                    )}
                : track
    ));
