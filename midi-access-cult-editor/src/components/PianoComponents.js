import React from 'react';
import * as ReactDnd from 'react-dnd';
import styled from 'styled-components';
import {NOTES, isBlack} from '../utils/NoteUtils';

export const geometry = {
    pianoWidth: 27,
    beatWidth: 210,
    pianoHeight: 9,
};
geometry.totalHeight = geometry.pianoHeight * NOTES.length;

export const Key = styled.div`
    width: ${geometry.pianoWidth}px;
    border: 1px solid black;
    background-color: ${props => props.black ? 'black' : 'white'};
    color: ${props => props.black ? 'white' : 'black'};
    font-size: .55rem;
    font-weight: bold;
    line-height: ${geometry.pianoHeight - 3}px;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
`

export const KeyRowDiv = styled.div`
    width: ${props => props.width}px;
    border-bottom: 1px solid black;
    background-color: ${props => props.black ? '#101010C0' : '#00500080'};
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
`

export const KeyRow = ({note, width, someCenterRef}) =>
    <KeyRowDiv black={isBlack(note)} width={width}>
        <Key black={isBlack(note)} ref={note === 'A6' ? someCenterRef : null}>
            {note}
        </Key>
    </KeyRowDiv>;

export const Frame = styled.div.attrs(props => ({
    // TODO: do something right in here...
}))`
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    position: absolute;
    width: ${props => props.width ? props.width + 'px' : '100%'};
    height: ${props => props.height || geometry.totalHeight}px;
    top: ${props => props.top || 0}px;
    left: ${props => props.left || 0}px;
    border-right: ${props => `${props.lineWidth || 1}px solid ${props.color || 'black'}`};
`

/*
export const Frame = styled.div.attrs(props => ({
    style: {
        width: props.width ? props.width : '100%',
        height: props.height || geometry.totalHeight,
        top: props.top || 0,
        left: props.left || 0,
        borderRightWidth: props.lineWidth || 1,
        borderRightColor: props.color || 'black',
        borderRightStyle: 'solid',
    }}))`
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    position: absolute;
`;
*/

export const NoteFrame = styled(Frame)`
    height: ${geometry.pianoHeight}px;
    ${props => `
        top: ${geometry.totalHeight - (props.note.pitch + 1) * geometry.pianoHeight - 1}px;
        left: ${geometry.pianoWidth + props.note.start * geometry.beatWidth}px;
        width: ${props.note.duration * geometry.beatWidth - 1}px;
        background-color: hsla(${props.color}, 100%, ${props.note.selected ? 60 : 50}%, ${props.trackSelected ? 100 : 50}%);
        border: 1px solid hsla(${props.color}, 100%, ${props.note.selected ? 100 : 50}%, 50%);
    `}
    border-radius: 2px;
`

export const NoteType = 'Note';
export const Note = (props) => {
    const {note} = props;
    const [{isDragging}, drag] = ReactDnd.useDrag({
        item: {...note, type: NoteType},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        })
    });
    return isDragging ? <div ref={drag}/> :
        <NoteFrame
            ref={drag}
            {...props}
        />;
};

export const barColor = '#008000';

export const Bar = styled(Frame)`
    width: ${props => props.width}px;
    left: ${props => props.index * props.width}px;
    border-right: 1px dashed ${barColor};
`

export const Beat = styled(Frame)`
    width: ${geometry.beatWidth}px;
    left: ${props => geometry.pianoWidth + props.index * geometry.beatWidth}px;
    border-right: 2px solid ${barColor};
`

export const PlayBar = ({state}) =>
    state.playing
        ? <Frame
            left={state.beat * geometry.beatWidth}
            width={geometry.pianoWidth}
            lineWidth={3}
            color="#AF06"/>
        : null;


export const RollDiv = styled.div`
    min-width: 60vw;
    border: 2px solid black;
    border-radius: 4px;
    background-color: #242;
    height: 80vh;
    overflow: scroll;
    position: relative;
`