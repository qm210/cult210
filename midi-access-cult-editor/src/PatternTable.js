import React from 'react';
import * as Recoil from 'recoil';
import * as State from './state';
import {ListButton} from './components';

const scrollBarWidth = 16;

const PatternTable = () => {
    const midiStore = Recoil.useRecoilValue(State.midiStore);

    return <table style={{
                width: 450,
                display: 'block'
            }}>
            <thead style={{
                width: 450,
                display: 'block'
            }}>
                <tr>
                    <th style={{width: 250}}>Pattern</th>
                    <th style={{width: 150}}>Label</th>
                    <th style={{width: 50}}>#Beats</th>
                </tr>
            </thead>
            <tbody style={{
                height: 300,
                width: 450,
                overflowX: 'hidden',
                overflowY: 'auto',
                display: 'block'
            }}>
                {midiStore.map((item, index) =>
                    <tr key={index}>
                        <td style={{width: 250}}>
                            <ListButton>{item.title}</ListButton>
                        </td>
                        <td style={{width: 150}}>{item.track}</td>
                        <td style={{width: 50 - scrollBarWidth}}>{item.beats}</td>
                    </tr>
                )}
            </tbody>
        </table>;
}

export default PatternTable;