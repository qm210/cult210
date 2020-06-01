import React from 'react';
import ReactDOM from 'react-dom';
import './style/index.css';
import App from './App';
import {StoreProvider} from './Store';

ReactDOM.render(
    <React.StrictMode>
        <StoreProvider>
            <App />
        </StoreProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
