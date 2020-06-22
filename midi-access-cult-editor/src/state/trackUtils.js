export const getNotesFromFirstTrack = (data) => {
    if (!data.tracks) {
        return [];
    }
    const scaleTicks = ticks => +(ticks / data.header.ppq / 4).toFixed(3);
    console.log(data);
    return data.tracks[0].notes.map((note, index) => ({
        id: index,
        pitch: note.midi,
        start: scaleTicks(note.ticks),
        duration: scaleTicks(note.durationTicks),
        velocity: Math.max(0, Math.round(note.velocity * 100)/100),
        selected: index === 0,
    }));
};

export const newTrack = (name) => ({
    name,
    active: false,
    selectedPattern: null,
    patterns: [], // unused yet
    notes: [],
    hue: Math.floor(360 * Math.random()),
    channel: 1,
    transposeOctaves: 0,
});

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

export const updateTrack = (setTracks, trackName, update) => {
    setTracks(tracks =>
        tracks.map(track =>
            track.name === trackName
                ? {...track, ...update}
                : track
    ));
}

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

export const deleteNote = (setTracks, trackName, noteToDelete) =>
    setTracks(tracks =>
        tracks.map(track =>
            track.name === trackName
                ? {
                    ...track,
                    notes: track.notes.filter(note =>
                        note.id !== noteToDelete.id
                    )
                }
                : track
    ));

export const selectNote = (setTracks, trackName, noteToSelect) =>
    setTracks(tracks =>
        tracks.map(track =>
            track.name === trackName
                ? {
                    ...track,
                    notes: track.notes.map(note => ({
                        ...note,
                        selected: note.id === noteToSelect.id
                    }))
                }
                : track
    ));

export const addNote = (setTracks, trackName, notePrototype) => {
    let resultingNote = null;
    setTracks(tracks =>
        tracks.map(track => {
            if (track.name === trackName) {
                resultingNote = {
                    ...notePrototype,
                    id: track.notes.length,
                    selected: false,
                };
                return {
                    ...track,
                    notes: [...track.notes, resultingNote]
                };
            }
            return track;
        }));
    return resultingNote;
};
