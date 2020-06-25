import React from 'react';
import * as Recoil from 'recoil';
import styled from 'styled-components'
import { fetchPromise } from "./utils/fetchPromise";
import PianoRoll from './PianoRoll';
import SessionPanel from './SessionPanel';
import PlayBox from './PlayBox';
import * as State from './state';
import useLocalStorageState from './utils/useLocalStorageState';

const MainFrame = (props) => <div className="mainframe" {...props}>{props.children}</div>;
const SubFrame = (props) => <div className="subframe" {...props}>{props.children}</div>;;
const Column = styled.div`
    display: flex;
    flex-direction: column;
`

const App = () => {
    const [session, setSession] = useLocalStorageState('session', State.defaultSession);
    const setTracks = Recoil.useSetRecoilState(State.tracks);
    const setMidiStore = Recoil.useSetRecoilState(State.midiStore);
    const setSelectedTrackName = Recoil.useSetRecoilState(State.selectedTrackName);

    const setSanitizedState = React.useCallback((session) => {
        console.log(session);
        setTracks(State.sanitizeTracks(session.tracks));
        setSession(session.header);
        setSelectedTrackName(session.selectedTrackName);
    }, [setSession, setTracks, setSelectedTrackName])

    React.useEffect(() => {
        fetchPromise('/midis/')
            .then(data => setMidiStore(data));
        fetchPromise('/sessions')
            .then(data => setSanitizedState(data[0]));
    }, [setMidiStore, setSanitizedState]);

    React.useEffect(() => {
        document.title = "Cult210: " + session.title;
    }, [session.title])

    return <>
        <MainFrame>
            <SubFrame>
                <PianoRoll/>
            </SubFrame>
            <Column>
                <SubFrame>
                    <SessionPanel/>
                </SubFrame>
                <SubFrame>
                    <PlayBox/>
                </SubFrame>
            </Column>
        </MainFrame>
    </>
}

export default App;
