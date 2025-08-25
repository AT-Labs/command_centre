import { fetchWithAuthHeader } from '../../auth';
import { jsonResponseHandling } from '../fetch';

const { REACT_APP_REALTIME_TRAFFIC_API_URL } = process.env;

export const fetchTrafficFlows = async (lat, long, radius, detailed) => fetchWithAuthHeader(
    `${REACT_APP_REALTIME_TRAFFIC_API_URL}/traffic/flows?long=${long}&lat=${lat}&radius=${radius}&detailed=${detailed}`,
    {
        method: 'GET',
    },
).then(response => jsonResponseHandling(response));
