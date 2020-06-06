import React from 'react';
import * as StoreLogic from './StoreLogic';

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
    selectedTrack: null,
};

const Track = (name) => ({
    name,
    active: false,
    selectedPattern: null,
    patterns: [], // unused yet
    notes: [],
    hue: Math.floor(360 * Math.random()),
    channel: null
});

export const [RESET, LOAD_MIDISTORE, LOAD_TRACK_FROM_MIDI, SET_ACTIVE_NOTES,
    UPDATE_NOTE, TOGGLE_TRACK] = Array.from(Array(99).keys());

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
                        name: track.name,
                        active: true,
                        //selectedPattern: action.payload.title,
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
            };

        case SET_ACTIVE_NOTES:
            return {
                ...state,
                notes: action.payload
            };

        case UPDATE_NOTE:
            return {
                ...state,
                notes: state.notes.map(note =>
                    note.id === action.payload.id
                        ? action.payload
                        : note
                )
            };

        case TOGGLE_TRACK:
            return state;
            /*
            return {
                ...state,
                tracks: [
                    state.tracks.map(track =>
                        track.name === action.payload.track.name
                            ? {
                                ...track,
                                active: action.payload.value,
                            }
                            : track
                    )
                ]
            };
            */

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

//export const activeTracks = (state) => React.useMemo(() => useStore().state.tracks.filter(track => track.active), [state.tracks]);
export const activeTracks = (state) => state.tracks.filter(track => track.active);