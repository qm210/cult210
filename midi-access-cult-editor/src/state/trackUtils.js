export const getNotesFromFirstTrack = (data) => {
    if (!data.tracks) {
        return [];
    }
    const scaleTicks = ticks => +(ticks / data.header.ppq / 4).toFixed(3);
    return data.tracks[0].notes.map((note, index) => ({
        id: `note${index}`,
        pitch: note.midi,
        start: scaleTicks(note.ticks),
        duration: scaleTicks(note.durationTicks),
        velocity: Math.max(0, Math.round(note.velocity * 100)/100),
        selected: index === 0,
        playing: false,
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

export const updateTrack = (setTracks, trackName, update) =>
    setTracks(tracks =>
        tracks.map(track =>
            track.name === trackName
                ? {...track, ...update}
                : track
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
