const midiStore = [
    {
        title: "test",
        track: "lead",
        filename: "miditest_lead1.mid",
    }, {
        title: "pest",
        track: "lead",
        filename: "miditest_lead2.mid",
    }, {
        title: "fest",
        track: "lead",
        filename: "miditest_lead3.mid",
    }, {
        title: "eins",
        track: "bass",
        filename: "miditest_bass1.mid",
    }, {
        title: "zwei",
        track: "bass",
        filename: "miditest_bass2.mid",
    }, {
        title: "polizei",
        track: "bass",
        filename: "miditest_bass3.mid",
    }, {
        title: "four on floor",
        track: "drums",
        filename: "miditest_drum1.mid",
    }, {
        title: "moar hardcore",
        track: "drums",
        filename: "miditest_drum2.mid",
    }, {
        title: "ganz schön mogulig",
        track: "drums",
        filename: "miditest_drum3.mid",
    }
];

const path = (file) => `${__dirname}/debug_assets/${file || ""}`;

const getTracks = () => [...new Set(midiStore.map(item => item.track))];

const getTrack = (track) => midiStore.filter(midi => midi.track == track);

const getMidisInTracks = () => getTracks().reduce((obj, track) => Object.assign(obj, {[track]: getTrack(track)}), {});

module.exports = {
    midiStore,
    path,
    getTracks,
    getTrack,
    getMidisInTracks
};