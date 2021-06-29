import { jsonResponseHandling } from '../fetch';

const { REACT_APP_REALTIME_EVENT_STORE } = process.env;

export const fetchOccupancyEvents = async (from = '') => fetch(`${REACT_APP_REALTIME_EVENT_STORE}/analytics/occupancy?from=${from}`, { method: 'GET' })
    .then(response => jsonResponseHandling(response))
    .then(data => data);
