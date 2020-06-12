export const fetchPromise = (route) => fetch(route)
    .then(res => {
        if (!res.ok) {
            return Promise.reject();
        }
        return res.json();
    })
    .catch(error => console.error(error));
