import _ from 'lodash-es';
import { createSelector } from 'reselect';
import { getJsonFromWkt } from '../../../../utils/control/tripReplays';

export const getCurrentTripState = state => _.result(state, 'control.tripReplays.currentTrip');

export const getRouteInfo = createSelector(getCurrentTripState, tripDetail => _.result(tripDetail, 'route'));
export const getShape = createSelector(getRouteInfo, (route) => {
    const shape = _.result(route, 'shape');
    return _.isEmpty(shape) ? [] : getJsonFromWkt(shape);
});

export const getVehiclePositions = createSelector(getCurrentTripState, (tripDetail) => {
    const vehiclePositions = _.result(tripDetail, 'vehicleEvents');
    return _.isEmpty(vehiclePositions) ? [] : vehiclePositions;
});

export const getStops = createSelector(getCurrentTripState, (tripDetail) => {
    const stops = _.result(tripDetail, 'stopEvents', []);
    return _.isEmpty(stops) ? [] : stops;
});

export const getTripStatus = createSelector(getCurrentTripState, tripDetail => _.result(tripDetail, 'finalStatus'));

export const getVehicleInfo = createSelector(getCurrentTripState, tripDetail => _.pick(tripDetail, ['vehicleId', 'vehicleLabel', 'vehicleRegistration']));
export const getTripInfo = createSelector(getCurrentTripState, tripDetail => _.pick(tripDetail, ['tripId', 'tripStart', 'tripSignOn']));
export const getOperatorCode = createSelector(getCurrentTripState, tripDetail => _.result(tripDetail, 'agencyId'));
export const getTripSignOn = createSelector(getCurrentTripState, tripDetail => _.result(tripDetail, 'tripSignOn'));
