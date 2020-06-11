import React from 'react';
import styled from 'styled-components'
import * as Store from './Store';
import {fetchPromise} from './StoreLogic';
import PianoRoll from './PianoRoll';
import Selector from './Selector';
import PlayBox from './PlayBox';

const MainFrame = (props) => <div className="mainframe" {...props}>{props.children}</div>;
const SubFrame = (props) => <div className="subframe" {...props}>{props.children}</div>;;
const Column = styled.div`display: flex; flex-direction:column;`

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
            <SubFrame>
                <PianoRoll/>
            </SubFrame>
            <Column>
                <SubFrame>
                    <Selector/>
                </SubFrame>
                <SubFrame>
                    <PlayBox/>
                </SubFrame>
            </Column>
        </MainFrame>
    </>
}

export default App;
