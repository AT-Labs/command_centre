import _ from 'lodash-es';
import { createSelector } from 'reselect';
import { getJsonFromWkt } from '../../../../utils/control/tripReplays';
import { getFleetState } from '../../static/fleet';

export const getCurrentTripState = state => _.result(state, 'control.tripReplays.currentTrip');

export const getShape = createSelector(getCurrentTripState, (tripDetail) => {
    const shape = _.result(tripDetail, 'shape');
    return _.isEmpty(shape) ? [] : getJsonFromWkt(shape);
});

export const getRouteShortName = createSelector(getCurrentTripState, tripDetail => _.result(tripDetail, 'routeShortName'));
export const getRouteColor = createSelector(getCurrentTripState, tripDetail => _.result(tripDetail, 'route.routeColor'));

export const getFleetByVehicleId = createSelector(getFleetState, getCurrentTripState, (allFleetState, currentTrip) => allFleetState[currentTrip.vehicleId]);

export const getVehiclePositions = createSelector(getCurrentTripState, (tripDetail) => {
    const vehiclePositions = _.result(tripDetail, 'vehicleEvents');
    return _.isEmpty(vehiclePositions) ? [] : vehiclePositions;
});

export const getStops = createSelector(getCurrentTripState, (tripDetail) => {
    const stops = _.result(tripDetail, 'stopEvents', []);
    return _.isEmpty(stops) ? [] : stops;
});

export const getOperationalEvents = createSelector(getCurrentTripState, (tripDetail) => {
    const operationalEvents = _.result(tripDetail, 'operationalEvents', []);
    return _.isEmpty(operationalEvents) ? [] : operationalEvents;
});

export const getTripStatus = createSelector(getCurrentTripState, tripDetail => _.result(tripDetail, 'finalStatus'));

export const getVehicleInfo = createSelector(getCurrentTripState, tripDetail => _.pick(tripDetail, ['vehicleId', 'vehicleLabel', 'vehicleRegistration']));
export const getTripInfo = createSelector(getCurrentTripState, tripDetail => _.pick(tripDetail, ['tripId', 'tripStart', 'tripSignOn']));
export const getOperatorCode = createSelector(getCurrentTripState, tripDetail => _.result(tripDetail, 'agencyId'));
export const getTripSignOn = createSelector(getCurrentTripState, tripDetail => _.result(tripDetail, 'tripSignOn'));
