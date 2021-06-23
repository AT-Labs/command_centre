import { jsonResponseHandling } from '../fetch';
import { getViewPermission } from '../helpers';
import { fetchWithAuthHeader } from '../../auth';
import HTTP_TYPES from '../../types/http-types';

const { REACT_APP_DISRUPTION_MGT_QUERY_URL } = process.env;
const { GET, POST, PUT } = HTTP_TYPES;

export const getDisruptionsViewPermission = () => getViewPermission(`${REACT_APP_DISRUPTION_MGT_QUERY_URL}/view`);

export const getDisruptions = () => fetchWithAuthHeader(`${REACT_APP_DISRUPTION_MGT_QUERY_URL}/disruptions`, { method: GET })
    .then(response => jsonResponseHandling(response));

export const updateDisruption = (disruption) => {
    const { disruptionId } = disruption;
    const url = `${REACT_APP_DISRUPTION_MGT_QUERY_URL}/disruptions/${disruptionId}`;
    return fetchWithAuthHeader(
        url,
        {
            method: PUT,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(disruption),
        },
    ).then(response => jsonResponseHandling(response));
};

export const createDisruption = (disruption) => {
    const url = `${REACT_APP_DISRUPTION_MGT_QUERY_URL}/disruptions/`;
    return fetchWithAuthHeader(
        url,
        {
            method: POST,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(disruption),
        },
    ).then(response => jsonResponseHandling(response));
};
