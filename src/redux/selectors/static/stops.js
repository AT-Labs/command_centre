import L from 'leaflet';
import { result, find, map, isEmpty, pick, filter, forEach } from 'lodash-es';
import { createSelector } from 'reselect';
import { TRAIN_TYPE_ID } from '../../../types/vehicle-types';

export const getStopsState = state => result(state, 'static.stops');
export const getAllStops = createSelector(getStopsState, stopsState => result(stopsState, 'all', {}));
export const getMinimalStops = createSelector(getAllStops, stops => map(stops, stop => pick(stop, ['stop_id', 'stop_code', 'stop_lat', 'stop_lon'])));
export const hasStopsLoaded = createSelector(getAllStops, stops => !isEmpty(stops));
export const getStopLatLng = stop => new L.LatLng(stop.stop_lat, stop.stop_lon);
export const getStopSearchTerms = stop => result(stop, 'stop_code');
export const getChildStops = createSelector(
    getAllStops,
    (allStops) => {
        const isChildStop = stp => stp.location_type === 0;
        const isTrainStation = (stp, trainStops) => {
            const isFound = find(trainStops, trainStop => trainStop.parent_stop_code === stp.stop_code);
            if (isFound) return isFound.route_type === TRAIN_TYPE_ID;
            return false;
        };

        const validStops = {};
        const trainStops = filter(allStops, stp => stp.route_type === TRAIN_TYPE_ID);

        forEach(allStops, (value, key) => {
            if (isChildStop(value) || isTrainStation(value, trainStops)) Object.assign(validStops, { [key]: value });
        });
        return validStops;
    },
);
