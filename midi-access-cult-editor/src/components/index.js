import React from 'react';

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

export const TextInput = (props) => <input type="text" {...props}/>;

export const DebugButton = (props) => <button className="debug" {...props}>DEBUG</button>;

export const ListButton = (props) => <button className="list-button" {...props}>{props.children}</button>;