import React from 'react';
import ReactDOM from 'react-dom';
import {RecoilRoot} from 'recoil';
import './style/index.css';
import App from './App';
import {StoreProvider} from './Store';

ReactDOM.render(
    <React.StrictMode>
        <RecoilRoot>
            <StoreProvider>
                <App />
            </StoreProvider>
        </RecoilRoot>
    </React.StrictMode>,
    document.getElementById('root')
);
