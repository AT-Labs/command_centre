import _ from 'lodash-es';
import { createSelector } from 'reselect';
import VIEW_TYPE from '../../../types/view-types';
import SEARCH_RESULT_TYPE from '../../../types/search-result-types';
import { getActiveRealTimeDetailView } from '../navigation';
import { getFleetState } from '../static/fleet';
import { getAllocations, getVehicleAllocationByTrip } from '../control/blocks';

export const getDetailState = state => _.result(state, 'realtime.detail');
export const shouldGetActiveRealTimeDetailView = createSelector(
    getActiveRealTimeDetailView,
    activeRealTimeDetailView => activeRealTimeDetailView !== VIEW_TYPE.REAL_TIME_DETAIL.DEFAULT,
);
export const getSelectedSearchResults = createSelector(getDetailState, detailState => _.get(detailState, 'selectedSearchResults'));
export const getCheckedSearchResults = createSelector(
    getSelectedSearchResults,
    allSelectedSearchResults => _.filter(allSelectedSearchResults, selectedSearchResult => selectedSearchResult.checked),
);

export const getViewDetailKey = createSelector(getDetailState, detailState => _.result(detailState, 'viewDetailKey'));

export const getVehicleDetail = createSelector(getDetailState, getViewDetailKey,
    (detailState, viewDetailKey) => ((viewDetailKey && viewDetailKey === _.get(detailState, 'vehicle.key')) ? _.get(detailState, 'vehicle') : {}));

export const getVehicleOccupancyStatus = createSelector(getVehicleDetail,
    vehicleState => _.result(vehicleState, 'occupancyStatus'));
export const getVehicleId = createSelector(getVehicleDetail, vehicleDetailState => vehicleDetailState.id);
export const getCurrentVehicleTripId = createSelector(getVehicleDetail, vehicleDetailState => _.get(vehicleDetailState, 'trip.tripId'));
export const getVehicleLastStopSequence = createSelector(getVehicleDetail, vehicleState => vehicleState.lastStopSequence);
export const getVehicleUpcomingStops = createSelector(getDetailState, detailState => _.result(detailState, 'vehicle.upcomingStops'));
export const getVehiclePastStops = createSelector(getDetailState, detailState => _.result(detailState, 'vehicle.pastStops'));
export const getVehicleFleetInfo = createSelector(getFleetState, getVehicleId, (allFleetState, vehicleId) => _.result(allFleetState, vehicleId));
export const getVehicleCapacity = createSelector(
    getVehicleDetail,
    getFleetState,
    getAllocations,
    (vehicleDetail, fleeState, vehicleAllocations) => {
        const trip = _.get(vehicleDetail, 'trip');
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

export const getStopDetail = createSelector(getDetailState, getViewDetailKey,
    (detailState, viewDetailKey) => ((viewDetailKey && viewDetailKey === _.get(detailState, 'stop.key')) ? _.get(detailState, 'stop') : {}));
export const getStopCode = createSelector(getStopDetail, stopDetail => _.result(stopDetail, 'stop_code'));
export const getStopId = createSelector(getStopDetail, stopDetail => _.result(stopDetail, 'stop_id'));
export const getPastVehicles = createSelector(getStopDetail, stopDetail => _.result(stopDetail, 'pastVehicles'));
export const getUpcomingVehicles = createSelector(getStopDetail, stopDetail => _.result(stopDetail, 'upcomingVehicles'));

export const getPidInformation = createSelector(getStopDetail, stopDetail => _.result(stopDetail, 'pidInformation'));
export const getPidMessages = createSelector(getStopDetail, stopDetail => _.result(stopDetail, 'pidMessages'));
export const getTripStops = createSelector(getDetailState, detailState => _.uniqBy(_.map(_.result(detailState, 'trip.stopTimes', []), 'stop')));
export const getAddressDetail = createSelector(getDetailState, detailState => _.result(detailState, 'address'));
export const getRoutesByStopShape = createSelector(getDetailState, detailState => _.result(detailState, 'stop.routes', []));
export const getRouteIdsByStop = createSelector(getRoutesByStopShape, routes => _.map(routes, 'route_id'));

export const getClearForReplace = createSelector(getDetailState, detailState => detailState.isReplace);

export const getRouteDetail = createSelector(getSelectedSearchResults, getViewDetailKey,
    (selectedSearchResults, viewDetailKey) => (viewDetailKey ? selectedSearchResults[viewDetailKey] : {}));

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
    if (SEARCH_RESULT_TYPE.ROUTE.type === _.result(viewDetailEntity, 'searchResultType')) {
        return _.result(viewDetailEntity, 'checked');
    }
    return !_.isEmpty(viewDetailEntity);
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
                const matchesPredicate = _.isFunction(currentPredicate) ? currentPredicate(vehicle) : _.isMatch(vehicle, currentPredicate);
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
    checkedSearchResults => _.filter(checkedSearchResults,
        checkedSearchResult => (checkedSearchResult.checked && SEARCH_RESULT_TYPE.STOP.type === checkedSearchResult.searchResultType)),
);

export const getVisibleStops = createSelector(
    getViewDetailEntity,
    viewDetailEntity => isCheckedRouteOrOtherEntity(viewDetailEntity) && _.result(viewDetailEntity, 'stops'),
);
