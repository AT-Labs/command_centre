import { jsonResponseHandling } from '../fetch';

const { REACT_APP_AT_FLEET_API_URL } = process.env;

export const fetchBuses = async () => {
    const api = `${REACT_APP_AT_FLEET_API_URL}?type=bus`;
    return fetch(api, { method: 'GET' }).then(response => jsonResponseHandling(response));
};

export const fetchFerries = async () => {
    const api = `${REACT_APP_AT_FLEET_API_URL}?type=ferry`;
    return fetch(api, { method: 'GET' }).then(response => jsonResponseHandling(response));
};

export const fetchTrains = async () => {
    const api = `${REACT_APP_AT_FLEET_API_URL}?type=train`;
    return fetch(api, { method: 'GET' }).then(response => jsonResponseHandling(response));
};
