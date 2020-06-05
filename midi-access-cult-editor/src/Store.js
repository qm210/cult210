import React from 'react';

const StoreContext = React.createContext();
const initialState = {
    midiStore: [],
    tracks: [],
    selected: {
        title: null,
        filename: null,
        data: {}
    }
};

const reducer = (state, action) => {
    switch (action.type) {
        case "SET TRACKS":
            return {
                ...state,
                tracks: action.payload
            }
        case "SET MIDISTORE":
            return {
                ...state,
                midiStore: action.payload
            }
        case "LOAD MIDI":
            return {
                ...state,
                selected: action.payload
            }
        case "RESET":
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

/*
export const useStoreSelected = () => {
    const {state, dispatch} = useStore();
    return state.selected;
}
*/
