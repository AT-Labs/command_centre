import { jsonResponseHandling } from '../fetch';

const CC_REALTIME_QUERY_URL = process.env.REACT_APP_CC_REALTIME_QUERY_URL;
const CC_REALTIME_QUERY_URL_NEW = process.env.REACT_APP_CC_REALTIME_QUERY_URL_NEW;
const CC_REALTIME_SERVICE_INFO_API = process.env.REACT_APP_REALTIME_SERVICE_INFO_API;

export const getHistoryByStopId = (stopId, useNewMonitoring) => {
    const baseUrl = useNewMonitoring ? CC_REALTIME_QUERY_URL_NEW : CC_REALTIME_QUERY_URL;
    return fetch(`${baseUrl}/history?stop_id=${stopId}`, { method: 'GET' })
        .then(response => jsonResponseHandling(response));
};

export const getHistoryByVehicleId = (vehicleId, useNewMonitoring) => {
    const baseUrl = useNewMonitoring ? CC_REALTIME_QUERY_URL_NEW : CC_REALTIME_QUERY_URL;
    return fetch(`${baseUrl}/history?vehicle_id=${vehicleId}`, { method: 'GET' })
        .then(response => jsonResponseHandling(response));
};

export const getUpcomingByStopId = (stopId, useNewMonitoring) => {
    const baseUrl = useNewMonitoring ? CC_REALTIME_QUERY_URL_NEW : CC_REALTIME_QUERY_URL;
    return fetch(`${baseUrl}/upcoming?stop_id=${stopId}`, { method: 'GET' })
        .then(response => jsonResponseHandling(response));
};

export const getUpcomingByVehicleId = (vehicleId, useNewMonitoring) => {
    const baseUrl = useNewMonitoring ? CC_REALTIME_QUERY_URL_NEW : CC_REALTIME_QUERY_URL;
    return fetch(`${baseUrl}/upcoming?vehicle_id=${vehicleId}`, { method: 'GET' })
        .then(response => jsonResponseHandling(response));
};

export const getDeparturesByStopCode = stopCode => fetch(`${CC_REALTIME_SERVICE_INFO_API}/service-info/departures?stop_code=${stopCode}&scope=tripsData`, { method: 'GET' })
    .then(response => jsonResponseHandling(response));

export const getVehiclesByTripId = tripId => fetch(`${CC_REALTIME_SERVICE_INFO_API}/service-info/vehicles/byTripId/${tripId}`, { method: 'GET' })
    .then(response => jsonResponseHandling(response));
