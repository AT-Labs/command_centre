import { jsonResponseHandling } from '../fetch';
import cache from '../cache';

const CC_STATIC_QUERY_URL = process.env.REACT_APP_CC_STATIC_QUERY_URL;
const GTFS_STATIC_QUERY_URL = process.env.REACT_APP_GTFS_STATIC_QUERY_URL;
const REALTIME_HEALTH_API = process.env.REACT_APP_REALTIME_HEALTH_API;

export const getStopsByRoute = routeId => fetch(
    `${CC_STATIC_QUERY_URL}/gtfs/route/${routeId}/stops`,
    { method: 'GET' },
).then(response => jsonResponseHandling(response));

export const getRoutesByStop = stopCode => fetch(
    `${CC_STATIC_QUERY_URL}/shapes?stop_code=${stopCode}`,
    { method: 'GET' },
).then(response => jsonResponseHandling(response));

export const getAllStops = serviceDate => fetch(
    `${CC_STATIC_QUERY_URL}/stops?${serviceDate ? new URLSearchParams({ date: serviceDate }).toString() : ''}`,
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

export const getRoutesByShortName = (routeShortName, date) => fetch(
    date
        ? `${CC_STATIC_QUERY_URL}/trips?route_short_name=${routeShortName}&date=${date}`
        : `${CC_STATIC_QUERY_URL}/trips?route_short_name=${routeShortName}`,
    { method: 'GET' },
).then(response => jsonResponseHandling(response)).then(routes => (routes.length && routes) || []);

export const getHealthMonitorData = () => fetch(
    `${REALTIME_HEALTH_API}/healthmonitor/all`,
    { method: 'GET' },
).then(response => jsonResponseHandling(response));

const fetchAllRoutes = () => fetch(
    `${CC_STATIC_QUERY_URL}/routes`,
    { method: 'GET' },
).then(response => jsonResponseHandling(response));

const tokenizeRoutes = routes => routes.map(route => ({
    ...route,
    tokens: route.route_short_name.toLowerCase().split(' '),
}));

export const getAllRoutes = () => fetchAllRoutes()
    .then((routes) => {
        const tokenizedRoutes = tokenizeRoutes(routes);
        return cache.routes.clear()
            .then(() => cache.routes.bulkAdd(tokenizedRoutes))
            .then(() => tokenizedRoutes);
    })
    .catch((error) => {
        cache.routes.clear();
        throw error;
    });

export const geoSearch = (body, searchEntityType) => {
    const url = `${CC_STATIC_QUERY_URL}/gtfs/geosearch/${searchEntityType}`;
    return fetch(
        url,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        },
    ).then(response => jsonResponseHandling(response));
};

export const getRailHeadsignsStops = includeNewStops => fetch(
    `${CC_STATIC_QUERY_URL}/operational/rail/headsigns?include_new_stations=${includeNewStops}`,
    { method: 'GET' },
).then(response => jsonResponseHandling(response));
