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
        vel: Math.max(0, Math.round(note.velocity * 100)/100),
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