import { getViewPermission } from '../helpers';
import { jsonResponseHandling } from '../fetch';

const { REACT_APP_AT_FLEET_API_URL } = process.env;

export const getFleetsViewPermission = () => getViewPermission(`${REACT_APP_AT_FLEET_API_URL}`);

export const getFleets = async () => {
    const api = `${REACT_APP_AT_FLEET_API_URL}`;
    return fetch(api, { method: 'GET' }).then(response => jsonResponseHandling(response));
};
