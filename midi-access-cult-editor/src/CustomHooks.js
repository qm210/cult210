import React from 'react';

// props to https://css-tricks.com/using-requestanimationframe-with-react-hooks/ !!
export const useAnimationFrame = (callback, isRunning) => {
    const request = React.useRef();
    const prevTime = React.useRef();

    const usedCallback = React.useCallback(callback, []);

    React.useEffect(() => {
        const animate = (time) => {
            if (isRunning && prevTime.current !== undefined) {
                usedCallback(time - prevTime.current);
            }
            prevTime.current = time;
            request.current = requestAnimationFrame(animate);
        };

        request.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(request.current);
    }, [usedCallback, isRunning]);
};