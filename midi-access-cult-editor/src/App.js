import React from 'react';
import {useStore} from './Store';
import {fetchAndDispatch} from './MiscLogic';
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
    const {state, dispatch} = useStore();

    React.useEffect(() => {
        fetchAndDispatch('/tracks/', dispatch, "SET TRACKS");
        fetchAndDispatch('/midis/', dispatch, "SET MIDISTORE");
    }, []);

    return <>
        <MainFrame>
            <PianoRoll/>
            <Selector/>
        </MainFrame>
    </>
}

export default App;
