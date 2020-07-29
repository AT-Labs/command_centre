import { jsonResponseHandling } from '../fetch';

const CC_STATIC_QUERY_URL = process.env.REACT_APP_CC_STATIC_QUERY_URL;
const GTFS_STATIC_QUERY_URL = process.env.REACT_APP_GTFS_STATIC_QUERY_URL;
const REALTIME_HEALTH_API = process.env.REACT_APP_REALTIME_HEALTH_API;

export const getRoutesByStop = stopCode => fetch(
    `${CC_STATIC_QUERY_URL}/shapes?stop_code=${stopCode}`,
    { method: 'GET' },
).then(response => jsonResponseHandling(response));

export const getAllRoutes = () => fetch(
    `${CC_STATIC_QUERY_URL}/routes`,
    { method: 'GET' },
).then(response => jsonResponseHandling(response));


export const getAllStops = () => fetch(
    `${CC_STATIC_QUERY_URL}/stops`,
    { method: 'GET' },
).then(response => jsonResponseHandling(response));

export const getAllStopTypes = () => fetch(
    `${GTFS_STATIC_QUERY_URL}/stopstypes/`,
    { method: 'GET' },
).then(response => jsonResponseHandling(response));

export const getTripById = tripId => fetch(
    `${CC_STATIC_QUERY_URL}/trip?trip_id=${tripId}`,
    { method: 'GET' },
).then(response => jsonResponseHandling(response));

export const getTripHeadsignById = tripId => fetch(
    `${CC_STATIC_QUERY_URL}/trip/${tripId}/headsign`,
    { method: 'GET' },
).then(response => jsonResponseHandling(response));

export const getRoutesByShortName = routeShortName => fetch(
    `${CC_STATIC_QUERY_URL}/trips?route_short_name=${routeShortName}`,
    { method: 'GET' },
).then(response => jsonResponseHandling(response))
    .then(routes => (routes.length && routes) || []);

export const getHealthMonitorData = () => fetch(
    `${REALTIME_HEALTH_API}/healthmonitor/all`,
    { method: 'GET' },
).then(response => jsonResponseHandling(response));
