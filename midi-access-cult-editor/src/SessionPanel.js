import React from 'react';
import * as Recoil from 'recoil';
import * as State from './state';
import PatternTable from './PatternTable';
import TrackPanel from './TrackPanel';


const SessionPanel = () => {
    const midiStore = Recoil.useRecoilValue(State.midiStore);

    if (!midiStore) {
        return <div>
            Loading...
        </div>;
    }

    return <>
        <TrackPanel/>
        <PatternTable/>
    </>;
}

export default SessionPanel;