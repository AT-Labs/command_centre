import _ from 'lodash-es';
import { createSelector } from 'reselect';
import VIEW_TYPE from '../../../types/view-types';
import { getJSONFromWKT } from '../../../utils/helpers';
import { getActiveRealTimeDetailView } from '../navigation';
import { getFleetState } from '../static/fleet';
import * as vehicleSelectors from './vehicles';
import { getAllocations, getVehicleAllocationByTrip } from '../control/blocks';
import { getVehicleTrip } from './vehicles';

export const getDetailState = state => _.result(state, 'realtime.detail');
export const shouldGetActiveRealTimeDetailView = createSelector(
    getActiveRealTimeDetailView,
    activeRealTimeDetailView => activeRealTimeDetailView !== VIEW_TYPE.REAL_TIME_DETAIL.DEFAULT,
);
export const getVehicleState = createSelector(getDetailState, detailState => detailState.vehicle);
export const getVehicleDetail = createSelector(getVehicleState, vehicleState => _.result(vehicleState, 'updatedVehicle', {}));
export const getVehicleOccupancyStatus = createSelector(getVehicleState,
    vehicleState => _.result(vehicleState, 'updatedVehicle.vehicle.occupancyStatus'));
export const getVehicleId = createSelector(getVehicleDetail, vehicleDetailState => vehicleDetailState.id);
export const getVehicleTripId = createSelector(getVehicleDetail, vehicleDetailState => vehicleSelectors.getVehicleTripId(vehicleDetailState));
export const getVehicleLastStopSequence = createSelector(getVehicleState, vehicleState => vehicleState.lastStopSequence);
export const getVehicleUpcomingStops = createSelector(getDetailState, detailState => _.result(detailState, 'vehicle.upcomingStops'));
export const getVehiclePastStops = createSelector(getDetailState, detailState => _.result(detailState, 'vehicle.pastStops'));
export const getVehicleFleetInfo = createSelector(getFleetState, getVehicleId, (allFleetState, vehicleId) => _.result(allFleetState, vehicleId));
export const getVehicleCapacity = createSelector(
    getVehicleDetail,
    getFleetState,
    getAllocations,
    (vehicleDetail, fleeState, vehicleAllocations) => {
        const trip = getVehicleTrip(vehicleDetail);
        if (!trip) return _.result(fleeState, `${vehicleDetail.id}.capacity`, 0);

        const allocation = getVehicleAllocationByTrip(trip, vehicleAllocations);
        if (!allocation) return _.result(fleeState, `${vehicleDetail.id}.capacity`, 0);

        return _.reduce(allocation, (acc, alloc) => {
            const capacity = _.result(fleeState, `${alloc.vehicleId}.capacity`);
            if (capacity) {
                return {
                    total: acc.total + _.result(capacity, 'total', 0),
                    seating: acc.seating + _.result(capacity, 'seating', 0),
                };
            }
            return acc;
        }, {
            total: 0,
            seating: 0,
        });
    },
);

export const getStopDetail = createSelector(getDetailState, detailState => _.result(detailState, 'stop'));
export const getStopCode = createSelector(getStopDetail, stopDetail => _.result(stopDetail, 'stop_code'));
export const getStopId = createSelector(getStopDetail, stopDetail => _.result(stopDetail, 'stop_id'));
export const getPastVehicles = createSelector(getStopDetail, stopDetail => _.result(stopDetail, 'pastVehicles'));
export const getUpcomingVehicles = createSelector(getStopDetail, stopDetail => _.result(stopDetail, 'upcomingVehicles'));

export const getTripStops = createSelector(getDetailState, detailState => _.uniqBy(_.map(_.result(detailState, 'trip.stopTimes', []), 'stop')));
export const getAddressDetail = createSelector(getDetailState, detailState => _.result(detailState, 'address'));
export const getRouteDetail = createSelector(getDetailState, detailState => _.result(detailState, 'route'));
export const getRoutesByStopShape = createSelector(getDetailState, detailState => _.result(detailState, 'stop.routes', []));
export const getRouteIdsByStop = createSelector(getRoutesByStopShape, routes => _.map(routes, 'route_id'));
export const getTripShape = createSelector(getDetailState, detailState => _.result(detailState, 'trip.shape_wkt'));
export const getTripHeadsign = createSelector(getDetailState, detailState => _.result(detailState, 'trip.trip_headsign'));
export const getRoutesByRoute = createSelector(getDetailState, detailState => _.result(detailState, 'route.routes'));
export const getShapes = createSelector(
    getActiveRealTimeDetailView,
    getRoutesByStopShape,
    getTripShape,
    getRoutesByRoute,
    (activeRealTimeDetailView, routesByStopShape, tripShape, routesByRoute) => {
        let wktShapes = [];
        if (activeRealTimeDetailView === VIEW_TYPE.REAL_TIME_DETAIL.STOP) {
            wktShapes = routesByStopShape.map(r => r.shape_wkt);
        } else if (activeRealTimeDetailView === VIEW_TYPE.REAL_TIME_DETAIL.VEHICLE) {
            wktShapes = tripShape ? [tripShape] : [];
        } else if (activeRealTimeDetailView === VIEW_TYPE.REAL_TIME_DETAIL.ROUTE) {
            wktShapes = routesByRoute ? routesByRoute.map(r => r.shape_wkt) : [];
        }
        return wktShapes.map(wktShape => getJSONFromWKT(wktShape).coordinates.map(c => c.reverse()));
    },
);
