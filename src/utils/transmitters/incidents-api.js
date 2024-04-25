import { fetchWithAuthHeader } from '../../auth';
import { jsonResponseHandling } from '../fetch';

const { REACT_APP_REALTIME_TRAFFIC_API_URL } = process.env;

export const fetchIncidents = async () => fetchWithAuthHeader(
    `${REACT_APP_REALTIME_TRAFFIC_API_URL}/traffic/incidents`,
    {
        method: 'GET',
    },
).then(response => jsonResponseHandling(response));
