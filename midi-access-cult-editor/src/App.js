import React from 'react';
import * as Store from './Store';
import {fetchAndDispatch} from './StoreLogic';
import PianoRoll from './PianoRoll';
import Selector from './Selector';

const MainFrame = ({children}) =>
    <div className="mainframe">
        {children.map((child, index) =>
            <div key={index} className="subframe">
                {child}
            </div>
        )}
    </div>;

const App = () => {
    const {dispatch} = Store.useStore();

    React.useEffect(() => {
        fetchAndDispatch('/tracks/', Store.SET_TRACKS, dispatch);
        fetchAndDispatch('/midis/', Store.SET_MIDISTORE, dispatch);
    }, [dispatch]);

    return <>
        <MainFrame>
            <PianoRoll/>
            <Selector/>
        </MainFrame>
    </>
}

export default App;
