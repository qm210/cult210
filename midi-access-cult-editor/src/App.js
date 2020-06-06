import React from 'react';
import * as Store from './Store';
import {fetchPromise} from './StoreLogic';
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
        fetchPromise('/midis/')
            .then(data => {
                dispatch({
                    type: Store.LOAD_MIDISTORE,
                    payload: data,
                })
            })
        }, [dispatch]);

    return <>
        <MainFrame>
            <PianoRoll/>
            <Selector/>
        </MainFrame>
    </>
}

export default App;
