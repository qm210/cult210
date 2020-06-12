import React from 'react';
import * as Recoil from 'recoil';
import styled from 'styled-components'
import { fetchPromise } from "./utils/fetchPromise";
import PianoRoll from './PianoRoll';
import Selector from './Selector';
import PlayBox from './PlayBox';
import * as State from './state';

const MainFrame = (props) => <div className="mainframe" {...props}>{props.children}</div>;
const SubFrame = (props) => <div className="subframe" {...props}>{props.children}</div>;;
const Column = styled.div`display: flex; flex-direction:column;`

const App = () => {
    const session = Recoil.useRecoilValue(State.session);
    const setTracks = Recoil.useSetRecoilState(State.tracks);
    const setMidiStore = Recoil.useSetRecoilState(State.midiStore);

    const setTracksFromMidiStore = React.useCallback(data =>
        State.setTracksFromMidiStore(setTracks, data)
    , [setTracks]);

    React.useEffect(() => {
        document.title = "Cult210: " + session.title;
        fetchPromise('/midis/')
            .then(data => {
                setMidiStore(data);
                setTracksFromMidiStore(data);
            });
    }, [session.title, setMidiStore, setTracksFromMidiStore]); //TODO: check whether useCallback required

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
