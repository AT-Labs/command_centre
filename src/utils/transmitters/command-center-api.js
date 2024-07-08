import { jsonResponseHandling } from '../fetch';
import { fetchWithAuthHeader } from '../../auth';
import HTTP_TYPES from '../../types/http-types';

const { REACT_APP_REALTIME_COMMAND_CENTER_API_URL } = process.env;
const { GET, PATCH } = HTTP_TYPES;

export const getUserPreferences = () => fetchWithAuthHeader(
    `${REACT_APP_REALTIME_COMMAND_CENTER_API_URL}/preferences`,
    {
        method: GET,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    },
).then(response => jsonResponseHandling(response));

export const updateUserPreferences = filterObject => fetchWithAuthHeader(
    `${REACT_APP_REALTIME_COMMAND_CENTER_API_URL}/preferences`,
    {
        method: PATCH,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(filterObject),
    },
);
