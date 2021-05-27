import L from 'leaflet';
import _ from 'lodash-es';
import { createSelector } from 'reselect';
import { TRAIN_TYPE_ID } from '../../../types/vehicle-types';

export const getStopsState = state => _.result(state, 'static.stops');
export const getAllStops = createSelector(getStopsState, stopsState => _.result(stopsState, 'all', {}));
export const getMinimalStops = createSelector(getAllStops, stops => _.map(stops, stop => _.pick(stop, ['stop_id', 'stop_code', 'stop_lat', 'stop_lon'])));
export const hasStopsLoaded = createSelector(getAllStops, stops => !_.isEmpty(stops));
export const getStopLatLng = stop => new L.LatLng(stop.stop_lat, stop.stop_lon);
export const getStopSearchTerms = stop => _.result(stop, 'stop_code');
export const getChildStops = createSelector(
    getAllStops,
    (allStops) => {
        const isChildStop = stp => stp.location_type === 0;
        const isTrainStation = (stp, trainStops) => {
            const isFound = _.find(trainStops, trainStop => trainStop.parent_stop_code === stp.stop_code);
            if (isFound) return isFound.route_type === TRAIN_TYPE_ID;
            return false;
        };

        const validStops = {};
        const trainStops = _.filter(allStops, stp => stp.route_type === TRAIN_TYPE_ID);

        _.forEach(allStops, (value, key) => {
            if (isChildStop(value) || isTrainStation(value, trainStops)) Object.assign(validStops, { [key]: value });
        });
        return validStops;
    },
);
