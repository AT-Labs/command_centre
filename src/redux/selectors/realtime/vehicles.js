import L from 'leaflet';
import { each, filter, get, isFunction, isMatch, isNull, keyBy, pick, sortBy } from 'lodash-es';
import moment from 'moment';
import { createSelector } from 'reselect';
import VEHICLE_TYPE, { TRIP_DIRECTION_INBOUND, TRIP_DIRECTION_OUTBOUND } from '../../../types/vehicle-types';
import { getAllocations, getVehicleAllocationByTrip, getVehicleAllocationLabelByTrip } from '../control/blocks';
import { getAgencies } from '../static/agencies';
import { getFleetState, getFleetVehicleAgencyId, getFleetVehicleType } from '../static/fleet';
import { isDelayBetweenRange } from '../../../utils/helpers';
import { getTripUpdates } from './quickview';

/** Vehicle model selectors */
export const getVehicleTrip = vehicle => get(vehicle, 'vehicle.trip');
export const getVehicleTripId = vehicle => get(vehicle, 'vehicle.trip.tripId');
export const getVehicleTripStartTime = vehicle => get(vehicle, 'vehicle.trip.startTime');
export const getVehicleTripStartDate = vehicle => get(vehicle, 'vehicle.trip.startDate');
export const getVehicleTripStartTimeISO = (vehicle) => {
    const startTime = get(vehicle, 'vehicle.trip.startTime');
    return startTime && moment(startTime, 'HH:mm:ss').toISOString();
};
export const getVehicleDirectionId = vehicle => get(vehicle, 'vehicle.trip.directionId');
export const getVehiclePosition = vehicle => pick(get(vehicle, 'vehicle.position', {}), ['latitude', 'longitude', 'bearing']);
export const getVehiclePositionCoordinates = createSelector(getVehiclePosition, ({ latitude, longitude }) => `${latitude},${longitude}`);
export const getVehicleLatLng = createSelector(getVehiclePosition, position => new L.LatLng(position.latitude, position.longitude));
export const getVehicleBearing = createSelector(getVehiclePosition, position => position.bearing);
export const getVehicleRoute = vehicle => get(vehicle, 'vehicle.route', {});
export const getVehicleRouteType = createSelector(getVehicleRoute, route => route.route_type);
export const getVehicleRouteName = createSelector(getVehicleRoute, route => route.route_short_name);
export const getVehicleAgencyId = createSelector(getVehicleRoute, route => route.agency_id);
export const getVehicleAgencyName = createSelector(getVehicleRoute, route => route.agency_name);
export const getVehicleInfo = vehicle => get(vehicle, 'vehicle.vehicle');
export const getVehicleId = vehicle => get(vehicle, 'vehicle.vehicle.id');
export const getVehicleTimestamp = vehicle => get(vehicle, 'vehicle.timestamp');
export const getVehicleRouteId = vehicle => get(vehicle, 'vehicle.trip.routeId');
export const getVehicleLat = vehicle => get(vehicle, 'vehicle.position.latitude');
export const getVehicleLabel = vehicle => get(vehicle, 'vehicle.vehicle.label');
export const getJoinedVehicleLabel = (vehicle, allocations) => {
    const trip = getVehicleTrip(vehicle);
    const allocatedVehiclesLabel = getVehicleAllocationLabelByTrip(trip, allocations);
    return allocatedVehiclesLabel || getVehicleLabel(vehicle);
};

export const getVehiclesWithAllocations = (allVehicles, allocations) => {
    const runningAllocations = [];
    each(allVehicles, (vehicle) => {
        const trip = getVehicleTrip(vehicle);
        if (trip) {
            const allocation = getVehicleAllocationByTrip(trip, allocations) || [];
            runningAllocations.push(...allocation);
        }
    });
    return keyBy(runningAllocations, 'vehicleId');
};

/** Vehicle state selectors */
export const getVehiclesState = state => get(state, 'realtime.vehicles');
export const getAllVehicles = createSelector(getVehiclesState, vehiclesState => get(vehiclesState, 'all'));
export const getVehiclesFilters = createSelector(getVehiclesState, vehiclesState => get(vehiclesState, 'filters'));
export const getVehiclesFilterPredicate = createSelector(getVehiclesFilters, filters => get(filters, 'predicate'));
export const getVehiclesFilterRouteType = createSelector(getVehiclesFilters, filters => get(filters, 'routeType'));
export const getVehiclesFilterAgencies = createSelector(
    getVehiclesFilterRouteType,
    getAgencies,
    (routeType, agencies) => sortBy(filter(agencies, agency => agency.route_type === routeType), ['agency_name']),
);
export const getVehiclesFilterAgencyIds = createSelector(getVehiclesFilters, filters => get(filters, 'agencyIds'));
export const getVehiclesFilterIsShowingDirectionInbound = createSelector(getVehiclesFilters, filters => get(filters, 'isShowingDirectionInbound'));
export const getVehiclesFilterIsShowingDirectionOutbound = createSelector(getVehiclesFilters, filters => get(filters, 'isShowingDirectionOutbound'));
export const getVehiclesFilterShowingDelay = createSelector(getVehiclesFilters, filters => get(filters, 'showingDelay', {}));
export const getVehiclesFilterShowingOccupancyLevels = createSelector(getVehiclesFilters, filters => get(filters, 'showingOccupancyLevels', []));
export const getVehiclesFilterIsShowingNIS = createSelector(getVehiclesFilters, filters => get(filters, 'isShowingNIS'));
export const getFilteredVehicles = createSelector(
    getAllVehicles,
    getFleetState,
    getAllocations,
    getTripUpdates,
    getVehiclesFilterRouteType,
    getVehiclesFilterAgencyIds,
    getVehiclesFilterIsShowingDirectionInbound,
    getVehiclesFilterIsShowingDirectionOutbound,
    getVehiclesFilterIsShowingNIS,
    getVehiclesFilterShowingOccupancyLevels,
    getVehiclesFilterShowingDelay,
    (allVehicles, allFleet, allocations, tripUpdates, routeType, agencyIds, showInbound, showOutbound, showNIS, showingOccupancyLevels, showingDelay) => {
        const runningVehiclesWithAllocations = showNIS ? getVehiclesWithAllocations(allVehicles, allocations) : [];
        const visibleVehicles = filter(allVehicles, (vehicle) => {
            const id = getVehicleId(vehicle);
            const tripId = getVehicleTripId(vehicle);

            if (!tripId) {
                if (!showNIS) {
                    return false;
                }

                if (showNIS && runningVehiclesWithAllocations[id]) {
                    return false;
                }
            } else if (showingDelay.early || showingDelay.late) {
                const tripUpdate = tripUpdates[vehicle.id];
                const delay = get(tripUpdate, 'delay');
                if (!delay) {
                    return false;
                }
                const isInRangeEarly = showingDelay.early && delay <= 0 ? isDelayBetweenRange(delay, showingDelay.early) : false;
                const isInRangeLate = showingDelay.late && delay >= 0 ? isDelayBetweenRange(delay, showingDelay.late) : false;
                if (!isInRangeEarly && !isInRangeLate) {
                    return false;
                }
            }

            if (!isNull(routeType)) {
                const fleetInfo = allFleet[id];
                const fleetVehicleType = getFleetVehicleType(fleetInfo);
                const fleetAgencyId = getFleetVehicleAgencyId(fleetInfo);

                if (fleetVehicleType !== VEHICLE_TYPE[routeType].type) {
                    return false;
                }
                if (agencyIds !== null && agencyIds.indexOf(fleetAgencyId) === -1) {
                    return false;
                }

                const tripDirection = getVehicleDirectionId(vehicle);
                if (!showInbound && tripDirection === TRIP_DIRECTION_INBOUND) {
                    return false;
                }
                if (!showOutbound && tripDirection === TRIP_DIRECTION_OUTBOUND) {
                    return false;
                }
            }

            if (!!showingOccupancyLevels.length && !showingOccupancyLevels.includes(vehicle.vehicle.occupancyStatus)) {
                return false;
            }

            return true;
        });

        return keyBy(visibleVehicles, 'vehicle.vehicle.id');
    },
);
export const getVisibleVehicles = createSelector(
    getFilteredVehicles,
    getVehiclesFilterPredicate,
    (unselectedVehicles, predicate) => {
        const visibleVehicles = filter(unselectedVehicles, (vehicle) => {
            if (predicate) {
                const matchesPredicate = isFunction(predicate) ? predicate(vehicle) : isMatch(vehicle, predicate);
                if (!matchesPredicate) {
                    return false;
                }
            }
            return true;
        });
        return keyBy(visibleVehicles, 'vehicle.vehicle.id');
    },
);
