import * as Recoil from 'recoil';
export * from './trackUtils';

export const session = Recoil.atom({
    key: 'session',
    default: {
        bpm: 210,
        beats: 4,
        barsInBeat: 4,
}});

export const tracks = Recoil.atom({
    key: 'tracks',
    default: []
});

export const activeTracks = Recoil.selector({
    key: 'activeTracks',
    get: ({get}) => get(tracks).filter(track => track.active)
});

export const selectedTrackName = Recoil.atom({
    key: 'selectedTrackName',
    default: null,
});

export const latestTrack = Recoil.atom({
    key: 'latestTrack',
    default: {
        title: null,
        filename: null,
        type: null,
        data: {}
}});

export const midiStore = Recoil.atom({
    key: 'midiStore',
    default: []
});

export const playState = Recoil.atom({
    key: 'playState',
    default: {
        playing: false,
        beat: 0,
    }
})

export const midiOut = Recoil.atom({
    key: 'midiOut',
    default: null
});