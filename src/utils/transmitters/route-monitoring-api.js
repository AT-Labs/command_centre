import { fetchWithAuthHeader } from '../../auth';
import { jsonResponseHandling } from '../fetch';

const { REACT_APP_REALTIME_TRAFFIC_API_URL } = process.env;

export const fetchRouteAlerts = async () => fetchWithAuthHeader(
    `${REACT_APP_REALTIME_TRAFFIC_API_URL}/monitoring/routes`,
    {
        method: 'GET',
    },
).then(response => jsonResponseHandling(response));

export const fetchRouteAlertDetailsById = async id => fetchWithAuthHeader(
    `${REACT_APP_REALTIME_TRAFFIC_API_URL}/monitoring/routes/${id}`,
    {
        method: 'GET',
    },
).then(response => jsonResponseHandling(response));

export const fetchRouteAlertDetailsByIds = async ids => fetchWithAuthHeader(
    `${REACT_APP_REALTIME_TRAFFIC_API_URL}/monitoring/routes/search`,
    {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ids),
    },
).then(response => jsonResponseHandling(response));

export const fetchAllRouteAlertDetails = async () => fetchWithAuthHeader(
    `${REACT_APP_REALTIME_TRAFFIC_API_URL}/monitoring/routes/all`,
    {
        method: 'GET',
    },
).then(response => jsonResponseHandling(response));
