import React from 'react';

export const useLocalStorageState = (key, defaultValue) => {
    const [state, setState] = React.useState(() => {
        let value;
        try {
            value = JSON.parse(window.localStorage.getItem(key) || String(defaultValue))
        }
        catch (err) {
            value = defaultValue;
        }
        return value;
    });
    React.useEffect(() => {
        window.localStorage.setItem(key, state);
    }, [state]);
    return [state, setState];
}

export default useLocalStorageState;