import { isEmpty, result, pick } from 'lodash-es';
import { createSelector } from 'reselect';
import { getJsonFromWkt } from '../../../../utils/control/tripReplays';
import { getFleetState } from '../../static/fleet';

export const getCurrentTripState = state => result(state, 'control.tripReplays.currentTrip');

export const getShape = createSelector(getCurrentTripState, (tripDetail) => {
    const shape = result(tripDetail, 'shape');
    return isEmpty(shape) ? [] : getJsonFromWkt(shape);
});

export const getRouteShortName = createSelector(getCurrentTripState, tripDetail => result(tripDetail, 'routeShortName'));
export const getRouteColor = createSelector(getCurrentTripState, tripDetail => result(tripDetail, 'route.routeColor'));

export const getFleetByVehicleId = createSelector(getFleetState, getCurrentTripState, (allFleetState, currentTrip) => {
    const vehicleId = result(currentTrip, 'vehicleId');
    if (vehicleId.includes(',')) {
        const id = vehicleId.split(',')[0];
        return allFleetState[id];
    }
    return allFleetState[vehicleId];
});

export const getVehiclePositions = createSelector(getCurrentTripState, (tripDetail) => {
    const vehiclePositions = result(tripDetail, 'vehicleEvents');
    return isEmpty(vehiclePositions) ? [] : vehiclePositions;
});

export const getStops = createSelector(getCurrentTripState, (tripDetail) => {
    const stops = result(tripDetail, 'stopEvents', []);
    return isEmpty(stops) ? [] : stops;
});

export const getOperationalEvents = createSelector(getCurrentTripState, (tripDetail) => {
    const operationalEvents = result(tripDetail, 'operationalEvents', []);
    return isEmpty(operationalEvents) ? [] : operationalEvents;
});

export const getTripStatus = createSelector(getCurrentTripState, tripDetail => result(tripDetail, 'finalStatus'));

export const getVehicleInfo = createSelector(getCurrentTripState, tripDetail => pick(tripDetail, ['vehicleId', 'vehicleLabel', 'vehicleRegistration']));
export const getTripInfo = createSelector(getCurrentTripState, tripDetail => pick(tripDetail, ['tripId', 'tripStart', 'tripSignOn']));
export const getOperatorCode = createSelector(getCurrentTripState, tripDetail => result(tripDetail, 'agencyId'));
export const getTripSignOn = createSelector(getCurrentTripState, tripDetail => result(tripDetail, 'tripSignOn'));
export const getVehicleDepotName = createSelector(getFleetByVehicleId, fleetInfo => result(fleetInfo, 'agency.depot.name'));
