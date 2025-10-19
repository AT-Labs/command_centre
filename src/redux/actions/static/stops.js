import { keyBy, map } from 'lodash-es';
import ACTION_TYPE from '../../action-types';
import DATE_TYPE from '../../../types/date-types';
import * as ccStatic from '../../../utils/transmitters/cc-static';
import { reportError } from '../activity';
import { getCache, setCache } from '../../../utils/browser-cache';

const moment = require('moment-timezone');

export const loadStops = stops => ({
    type: ACTION_TYPE.FETCH_STOPS,
    payload: {
        all: keyBy(stops, 'stop_code'),
    },
});

const tokenizeStops = stops => stops.map(stop => ({
    ...stop,
    tokens: stop.stop_name.toLowerCase().split(' ').concat(stop.stop_code),
}));

const getStopsCache = async (serviceDate, forceRefresh = false) => {
    const formattedDate = moment(serviceDate).tz(DATE_TYPE.TIME_ZONE).format('YYYYMMDD');
    const cacheKey = `/stops/${formattedDate}`;
    if (!forceRefresh) {
        const cached = await getCache(cacheKey);
        if (cached) return cached;
    }
    return ccStatic.getAllStops(serviceDate)
        .then(response => setCache(response, cacheKey))
        .then(response => response);
};

const getStopTypesCache = async (forceRefresh = false) => {
    const cacheKey = '/stoptypes';
    if (!forceRefresh) {
        const cached = await getCache(cacheKey);
        if (cached) return cached;
    }
    return ccStatic.getAllStopTypes()
        .then(response => setCache(response, cacheKey))
        .then(response => response);
};

export const getStops = (serviceDate, forceRefresh = false) => dispatch => Promise.all([getStopsCache(serviceDate, forceRefresh), getStopTypesCache(forceRefresh)])
    .then((values) => {
        const [stops, stopTypes] = values;
        const keyedStopTypes = keyBy(stopTypes, 'stop_code');
        const stopsWithType = map(stops, stop => (keyedStopTypes[stop.stop_code]
            ? {
                ...stop,
                route_type: keyedStopTypes[stop.stop_code].route_type,
                parent_stop_code: keyedStopTypes[stop.stop_code].parent_stop_code,
            }
            : stop));
        const tokenizedStops = tokenizeStops(stopsWithType);

        dispatch(loadStops(tokenizedStops));
        return tokenizedStops;
    })
    .catch((error) => {
        dispatch(reportError({ error: { critical: error } }, true));
        return [];
    });
