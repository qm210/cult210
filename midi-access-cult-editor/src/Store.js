import React from 'react';
import * as StoreLogic from './StoreLogic';
import {atom} from 'recoil';

const StoreContext = React.createContext();
const initialState = {
    midiStore: [],
    tracks: [],
    selected: { // TODO: rename "selected", this is misleading
        title: null,
        filename: null,
        type: null,
        data: {}
    },
    selectedTrackName: null,
};

const Track = (name) => ({
    name,
    active: false,
    selectedPattern: null,
    patterns: [], // unused yet
    notes: [],
    hue: Math.floor(360 * Math.random()),
    channel: 0,
});

export const [RESET, LOAD_MIDISTORE, LOAD_TRACK_FROM_MIDI, SET_ACTIVE_NOTES,
    UPDATE_NOTE, SELECT_TRACK_BY_NAME, TOGGLE_TRACK, SET_TRACK_CHANNEL] = Array.from(Array(99).keys());

const reducer = (state, action) => {
    switch (action.type) {
        case LOAD_MIDISTORE:
            const tracks = [...state.tracks];
            const oldTrackNames = state.tracks.map(track => track.name);
            const newTrackNames = Object.keys(action.payload);
            newTrackNames.forEach(name => {
                if (!(name in oldTrackNames)) {
                    tracks.push(Track(name));
                }
            });
            return {
                ...state,
                tracks,
                midiStore: action.payload,
            };

        case LOAD_TRACK_FROM_MIDI:
            const updatedTracks = state.tracks.map(track =>
                track.name === action.payload.track
                    ? {
                        ...track,
                        active: true,
                        selectedPattern: action.payload.title,
                        notes: StoreLogic.getNotesFromFirstTrack(action.payload.data),
                    } : track
            );
            console.log(action.payload, state.tracks, updatedTracks);
            return {
                ...state,
                selected: {
                    title: action.payload.title,
                    filename: action.payload.filename,
                },
                tracks: updatedTracks,
                selectedTrackName: action.payload.track,
            };

        case UPDATE_NOTE:
            return {
                ...state,
                tracks: state.tracks.map(track =>
                    track.name === state.selectedTrackName
                        ? {
                            ...track,
                            notes: track.notes.map(note =>
                                note.id === action.payload.id
                                    ? action.payload
                                    : note
                            )
                        }
                        : track
                    )
            };

        case SELECT_TRACK_BY_NAME:
            console.log(action.payload);
            return {
                ...state,
                selectedTrackName: action.payload
            }

        case TOGGLE_TRACK:
            return {
                ...state,
                tracks: state.tracks.map(track =>
                    track.name === action.payload.track.name
                        ? {
                            ...track,
                            active: action.payload.value,
                        }
                        : track
                )
            };

        case SET_TRACK_CHANNEL:
            return {
                ...state,
                tracks: state.tracks.map(track =>
                    track.name === action.payload.track.name
                        ? {
                            ...track,
                            channel: action.payload.value,
                        }
                        : track
                )
            };

        case RESET:
            return initialState;

        default:
            throw new Error(`Unknown Action: ${action.type}`);
    }
}

export const StoreProvider = ({children}) => {
    const [state, dispatch] = React.useReducer(reducer, initialState);
    return (
        <StoreContext.Provider value={{state, dispatch}}>
            {children}
        </StoreContext.Provider>
    )
}

export const useStore = () => React.useContext(StoreContext);

//export const activeTracks = React.useMemo(() => useStore()., [state.tracks]); // This is why I will try Recoil

export const noteName = atom({
    key: 'noteName',
    default: 'defaultNoteName'
});
export const trackName = atom({
    key: 'trackName',
    default: 'defaultTrackName :)'
});