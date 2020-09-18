import { jsonResponseHandling } from '../fetch';

const CC_REALTIME_QUERY_URL = process.env.REACT_APP_CC_REALTIME_QUERY_URL;
const CC_REALTIME_SERVICE_INFO_API = process.env.REACT_APP_REALTIME_SERVICE_INFO_API;

export const getHistoryByStopId = stopId => fetch(`${CC_REALTIME_QUERY_URL}/history?stop_id=${stopId}`, { method: 'GET' })
    .then(response => jsonResponseHandling(response));

export const getHistoryByVehicleId = vehicleId => fetch(`${CC_REALTIME_QUERY_URL}/history?vehicle_id=${vehicleId}`, { method: 'GET' })
    .then(response => jsonResponseHandling(response));

export const getUpcomingByStopId = stopId => fetch(`${CC_REALTIME_QUERY_URL}/upcoming?stop_id=${stopId}`, { method: 'GET' })
    .then(response => jsonResponseHandling(response));

export const getUpcomingByVehicleId = vehicleId => fetch(`${CC_REALTIME_QUERY_URL}/upcoming?vehicle_id=${vehicleId}`, { method: 'GET' })
    .then(response => jsonResponseHandling(response));

export const getDeparturesByStopCode = stopCode => fetch(`${CC_REALTIME_SERVICE_INFO_API}/service-info/departures?stop_code=${stopCode}&scope=tripsData`, { method: 'GET' })
    .then(response => jsonResponseHandling(response));
