import React from 'react';
import styled from 'styled-components';

export const LargeCheckBox = props =>
    <input type="checkbox" {...props} style={{
        width: 20,
        height: 20,
        marginRight: 10,
    }}/>;

export const ChannelSpinBox = props =>
    <SpinBox {...props}
        min={0}
        max={15}
    />;

export const SpinBox = props =>
    <input type="number"
        {...props}
        required
        disabled={props.value == null}
        style={{
            height: 20
        }}
    />;


export const RedButton = styled.button`
    background-color: #800010;
    font-size: 20;
`
export const DebugButton = (props) => <RedButton {...props}>DEBUG</RedButton>;