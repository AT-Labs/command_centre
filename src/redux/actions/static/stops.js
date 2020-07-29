/* eslint-disable camelcase */
import _ from 'lodash-es';
import cache, { isCacheValid } from '../../../utils/cache';
import ACTION_TYPE from '../../action-types';
import * as ccStatic from '../../../utils/transmitters/cc-static';
import { reportError } from '../activity';

const loadStops = stops => ({
    type: ACTION_TYPE.FETCH_STOPS,
    payload: {
        all: _.keyBy(stops, 'stop_code'),
    },
});

const tokenizeStops = stops => stops.map(stop => ({
    ...stop,
    tokens: stop.stop_name.toLowerCase().split(' ').concat(stop.stop_code),
}));

export const updateVisibleStops = visible => ({
    type: ACTION_TYPE.UPDATE_VISIBLE_STOPS,
    payload: {
        visible,
    },
});

export const getStops = () => dispatch => isCacheValid('stops')
    .then(({ isValid }) => {
        if (isValid) return cache.stops.toArray();
        return Promise.all([ccStatic.getAllStops(), ccStatic.getAllStopTypes()])
            .then((values) => {
                const [stops, stopTypes] = values;
                const keyedStopTypes = _.keyBy(stopTypes, 'stop_code');
                const stopsWithType = _.map(stops, stop => (keyedStopTypes[stop.stop_code]
                    ? {
                        ...stop,
                        route_type: keyedStopTypes[stop.stop_code].route_type,
                        parent_stop_code: keyedStopTypes[stop.stop_code].parent_stop_code,
                    }
                    : stop));
                const tokenizedStops = tokenizeStops(stopsWithType);

                return cache.stops.clear()
                    .then(() => cache.stops.bulkAdd(tokenizedStops))
                    .then(() => tokenizedStops);
            })
            .catch((error) => {
                dispatch(reportError({ error: { critical: error } }, true));
                cache.stops.clear();
                return [];
            });
    })
    .then(stops => dispatch(loadStops(stops)))
    .catch((error) => {
        dispatch(reportError({ error: { critical: error } }));
        throw error;
    });
