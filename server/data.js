const ensureExistance = require('./utils/ensureExistance');

const storeFile = './bin/store.json';
ensureExistance(storeFile, './data/store.json');

const sessionsFile = './bin/sessions.json';
ensureExistance(sessionsFile, './data/sessions.json');

const midiStore = require(storeFile);
const sessions = require(sessionsFile);

const path = (file) => `${__dirname}/data/${file || ""}`;

const getTracks = () => [...new Set(storeFile.map(item => item.track))];

const getTrack = (track) => storeFile.filter(midi => midi.track == track);

const getMidisInTracks = () => getTracks().reduce((obj, track) => Object.assign(obj, {[track]: getTrack(track)}), {});

module.exports = {
    midiStore,
    sessions,
    path,
    getTracks,
    getTrack,
    getMidisInTracks
};