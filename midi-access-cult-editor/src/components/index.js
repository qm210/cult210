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
        min={1}
        max={16}
        style={{width: 36}}
    />;

export const TransposeSpinBox = props =>
    <SpinBox {...props}
        min={-8}
        max={8}
        style={{width: 36}}
    />;


export const SpinBox = props =>
    <input type="number"
        {...props}
        required
        disabled={props.value == null}
        style={{
            width: 70,
            height: 20,
            fontSize: '1rem',
            fontWeight: 'bold',
            ...props.style,
        }}
    />;


export const RedButton = styled.button`
    background-color: #800010;
    font-size: 20;
`
export const DebugButton = (props) => <RedButton {...props}>DEBUG</RedButton>;