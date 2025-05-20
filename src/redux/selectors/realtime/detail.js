import { reduce, result, get, filter, isEmpty, isFunction, isMatch, uniqBy, map } from 'lodash-es';
import { createSelector } from 'reselect';
import VIEW_TYPE from '../../../types/view-types';
import SEARCH_RESULT_TYPE from '../../../types/search-result-types';
import { getActiveRealTimeDetailView } from '../navigation';
import { getFleetState } from '../static/fleet';
import { getAllocations, getVehicleAllocationByTrip } from '../control/blocks';

export const getDetailState = state => result(state, 'realtime.detail');
export const shouldGetActiveRealTimeDetailView = createSelector(
    getActiveRealTimeDetailView,
    activeRealTimeDetailView => activeRealTimeDetailView !== VIEW_TYPE.REAL_TIME_DETAIL.DEFAULT,
);
export const getSelectedSearchResults = createSelector(getDetailState, detailState => get(detailState, 'selectedSearchResults'));
export const getCheckedSearchResults = createSelector(
    getSelectedSearchResults,
    allSelectedSearchResults => filter(allSelectedSearchResults, selectedSearchResult => selectedSearchResult.checked),
);

export const getViewDetailKey = createSelector(getDetailState, detailState => result(detailState, 'viewDetailKey'));

export const getVehicleDetail = createSelector(
    getDetailState,
    getViewDetailKey,
    (detailState, viewDetailKey) => ((viewDetailKey && viewDetailKey === get(detailState, 'vehicle.key')) ? get(detailState, 'vehicle') : {}),
);

export const getVehicleOccupancyStatus = createSelector(
    getVehicleDetail,
    vehicleState => result(vehicleState, 'occupancyStatus'),
);
export const getVehicleId = createSelector(getVehicleDetail, vehicleDetailState => vehicleDetailState.id);
export const getCurrentVehicleTripId = createSelector(getVehicleDetail, vehicleDetailState => get(vehicleDetailState, 'trip.tripId'));
export const getVehicleLastStopSequence = createSelector(getVehicleDetail, vehicleState => vehicleState.lastStopSequence);
export const getVehicleUpcomingStops = createSelector(getDetailState, detailState => result(detailState, 'vehicle.upcomingStops'));
export const getVehiclePastStops = createSelector(getDetailState, detailState => result(detailState, 'vehicle.pastStops'));
export const getVehicleFleetInfo = createSelector(getFleetState, getVehicleId, (allFleetState, vehicleId) => result(allFleetState, vehicleId));
export const getVehicleCapacity = createSelector(
    getVehicleDetail,
    getFleetState,
    getAllocations,
    (vehicleDetail, fleeState, vehicleAllocations) => {
        const trip = get(vehicleDetail, 'trip');
        if (!trip) return result(fleeState, `${vehicleDetail.id}.capacity`, 0);

        const allocation = getVehicleAllocationByTrip(trip, vehicleAllocations);
        if (!allocation) return result(fleeState, `${vehicleDetail.id}.capacity`, 0);

        return reduce(allocation, (acc, alloc) => {
            const capacity = result(fleeState, `${alloc.vehicleId}.capacity`);
            if (capacity) {
                return {
                    total: acc.total + result(capacity, 'total', 0),
                    seating: acc.seating + result(capacity, 'seating', 0),
                };
            }
            return acc;
        }, {
            total: 0,
            seating: 0,
        });
    },
);

export const getStopDetail = createSelector(
    getDetailState,
    getViewDetailKey,
    (detailState, viewDetailKey) => ((viewDetailKey && viewDetailKey === get(detailState, 'stop.key')) ? get(detailState, 'stop') : {}),
);
export const getStopCode = createSelector(getStopDetail, stopDetail => result(stopDetail, 'stop_code'));
export const getStopId = createSelector(getStopDetail, stopDetail => result(stopDetail, 'stop_id'));
export const getPastVehicles = createSelector(getStopDetail, stopDetail => result(stopDetail, 'pastVehicles'));
export const getUpcomingVehicles = createSelector(getStopDetail, stopDetail => result(stopDetail, 'upcomingVehicles'));

export const getPidInformation = createSelector(getStopDetail, stopDetail => result(stopDetail, 'pidInformation'));
export const getPidMessages = createSelector(getStopDetail, stopDetail => result(stopDetail, 'pidMessages'));
export const getTripStops = createSelector(getDetailState, detailState => uniqBy(map(result(detailState, 'trip.stopTimes', []), 'stop')));
export const getAddressDetail = createSelector(getDetailState, detailState => result(detailState, 'address'));
export const getRoutesByStopShape = createSelector(getDetailState, detailState => result(detailState, 'stop.routes', []));
export const getRouteIdsByStop = createSelector(getRoutesByStopShape, routes => map(routes, 'route_id'));

export const getClearForReplace = createSelector(getDetailState, detailState => detailState.isReplace);

export const getRouteDetail = createSelector(
    getSelectedSearchResults,
    getViewDetailKey,
    (selectedSearchResults, viewDetailKey) => (viewDetailKey ? selectedSearchResults[viewDetailKey] : {}),
);

export const getRoutesByRoute = createSelector(getRouteDetail, routeDetail => routeDetail.routes || []);

export const getViewDetailEntity = createSelector(
    getActiveRealTimeDetailView,
    getRouteDetail,
    getStopDetail,
    getVehicleDetail,
    (activeRealTimeDetailView, routeDetail, stopDetail, vehicleDetail) => {
        if (activeRealTimeDetailView === VIEW_TYPE.REAL_TIME_DETAIL.STOP) {
            return stopDetail;
        }
        if (activeRealTimeDetailView === VIEW_TYPE.REAL_TIME_DETAIL.VEHICLE) {
            return vehicleDetail;
        }
        if ([VIEW_TYPE.REAL_TIME_DETAIL.LIST, VIEW_TYPE.REAL_TIME_DETAIL.ROUTE].includes(activeRealTimeDetailView)) {
            return routeDetail;
        }
        return {};
    },
);

const isCheckedRouteOrOtherEntity = (viewDetailEntity) => {
    if (SEARCH_RESULT_TYPE.ROUTE.type === result(viewDetailEntity, 'searchResultType')) {
        return result(viewDetailEntity, 'checked');
    }
    return !isEmpty(viewDetailEntity);
};

export const getVisibleEntities = createSelector(
    getActiveRealTimeDetailView,
    getViewDetailEntity,
    getCheckedSearchResults,
    (activeRealTimeDetailView, currentViewDetailEntity, checkedSearchResults) => {
        if ([VIEW_TYPE.REAL_TIME_DETAIL.LIST, VIEW_TYPE.REAL_TIME_DETAIL.ROUTE].includes(activeRealTimeDetailView)) {
            return checkedSearchResults;
        }
        return isCheckedRouteOrOtherEntity(currentViewDetailEntity) ? [currentViewDetailEntity] : [];
    },
);

export const getVehiclePredicateFromCheckedSearchResults = createSelector(
    getCheckedSearchResults,
    getViewDetailEntity,
    (checkedSearchResults, currentViewDetailEntity) => {
        let predicate = () => true;
        if (isCheckedRouteOrOtherEntity(currentViewDetailEntity)) {
            predicate = currentViewDetailEntity.vehiclePredicate;
        } else if (checkedSearchResults.length) {
            const allPredicates = [];
            predicate = vehicle => allPredicates.reduce((previousResult, currentPredicate) => {
                const matchesPredicate = isFunction(currentPredicate) ? currentPredicate(vehicle) : isMatch(vehicle, currentPredicate);
                return previousResult || matchesPredicate;
            }, false);
            checkedSearchResults.forEach(({ vehiclePredicate, searchResultType }) => {
                if (vehiclePredicate && SEARCH_RESULT_TYPE.STOP.type !== searchResultType) {
                    allPredicates.push(vehiclePredicate);
                }
            });
            predicate.allPredicates = allPredicates;
        }
        return predicate;
    },
);

export const getCheckedStops = createSelector(
    getCheckedSearchResults,
    checkedSearchResults => filter(
        checkedSearchResults,
        checkedSearchResult => (checkedSearchResult.checked && SEARCH_RESULT_TYPE.STOP.type === checkedSearchResult.searchResultType),
    ),
);

export const getCheckedStopsDisruptionsList = createSelector(
    getDetailState,
    detailState => Object.entries(detailState.disruptions || {}).map(([stopCode, disruptions]) => ({
        stopCode,
        disruptions,
    })),
);

export const getVisibleStops = createSelector(
    getViewDetailEntity,
    viewDetailEntity => (isCheckedRouteOrOtherEntity(viewDetailEntity) && result(viewDetailEntity, 'stops')) || [],
);
