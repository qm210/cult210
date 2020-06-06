import React from 'react';
import {getNotesFromFirstTrack} from './StoreLogic';

const StoreContext = React.createContext();
const initialState = {
    midiStore: [],
    tracks: [],
    selected: {
        title: null,
        filename: null,
        type: null,
        data: {}
    },
    notes: [],
};

export const SET_TRACKS = "SET TRACKS";
export const SET_MIDISTORE = "SET MIDISTORE";
export const LOAD_TRACK_FROM_MIDI = "LOAD MIDI";
export const SET_NOTES = "SET NOTES";
export const UPDATE_NOTE = "UPDATE NOTE";
export const RESET = "RESET";

const reducer = (state, action) => {
    switch (action.type) {
        case SET_TRACKS:
            return {
                ...state,
                tracks: action.payload
            }
        case SET_MIDISTORE:
            return {
                ...state,
                midiStore: action.payload
            }
        case LOAD_TRACK_FROM_MIDI:
            return {
                ...state,
                selected: action.payload,
                notes: getNotesFromFirstTrack(action.payload.data),
            }
        case SET_NOTES:
            return {
                ...state,
                notes: action.payload
            }
        case UPDATE_NOTE:
            return {
                ...state,
                notes: state.notes.map(note =>
                    note.id === action.payload.id
                        ? action.payload
                        : note
                )
            }
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
