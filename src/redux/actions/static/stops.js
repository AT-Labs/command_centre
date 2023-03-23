import * as moment from 'moment-timezone';
import { keyBy, map } from 'lodash-es';
import ACTION_TYPE from '../../action-types';
import DATE_TYPE from '../../../types/date-types';
import * as ccStatic from '../../../utils/transmitters/cc-static';
import { reportError } from '../activity';
import { getCache, setCache } from '../../../utils/browser-cache';

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

const getStopsCache = async (serviceDate) => {
    const formattedDate = moment(serviceDate).tz(DATE_TYPE.TIME_ZONE).format('YYYYMMDD');
    const cacheKey = `/stops/${formattedDate}`;
    const cached = await getCache(cacheKey);
    return cached || ccStatic.getAllStops(serviceDate)
        .then(response => setCache(response, cacheKey))
        .then(response => response);
};

const getStopTypesCache = async () => {
    const cacheKey = '/stoptypes';
    const cached = await getCache(cacheKey);
    return cached || ccStatic.getAllStopTypes()
        .then(response => setCache(response, cacheKey))
        .then(response => response);
};

export const getStops = serviceDate => dispatch => Promise.all([getStopsCache(serviceDate), getStopTypesCache()])
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
