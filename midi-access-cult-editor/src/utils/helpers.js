export const equalJson = (a, b) => {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    }
    catch (err) {
        console.error(err)
        return false;
    }
};
