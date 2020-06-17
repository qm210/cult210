import React from 'react';

// props to https://css-tricks.com/using-requestanimationframe-with-react-hooks/ !!
export const useAnimationFrame = (callback, isRunning) => {
    const request = React.useRef();
    const prevTime = React.useRef();

    React.useEffect(() => {
        const animate = (time) => {
            if (isRunning && prevTime.current !== undefined) {
                callback(time - prevTime.current);
            }
            prevTime.current = time;
            request.current = requestAnimationFrame(animate);
        };

        request.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(request.current);
    }, [callback, isRunning]);
};

export default useAnimationFrame;