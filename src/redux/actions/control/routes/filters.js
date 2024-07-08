import ACTION_TYPE from '../../../action-types';

import { clearActiveRoute } from './routes';
import { clearActiveTripInstanceId } from './trip-instances';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';

const mergeRouteFiltersAction = filters => ({
    type: ACTION_TYPE.MERGE_CONTROL_ROUTES_FILTERS,
    payload: {
        filters,
    },
});

export const delayRangeAllowedTripStatuses = [
    TRIP_STATUS_TYPES.notStarted,
    TRIP_STATUS_TYPES.inProgress,
    TRIP_STATUS_TYPES.completed,
];

export const mergeRouteFilters = (filters, isCleanUpActiveNeeded, avoidReset) => (dispatch) => {
    if (isCleanUpActiveNeeded !== false) {
        dispatch(clearActiveRoute());
        dispatch(clearActiveTripInstanceId());
    }

    if (avoidReset) {
        dispatch(mergeRouteFiltersAction(filters));
    } else if (Object.prototype.hasOwnProperty.call(filters, 'agencyId')) {
        dispatch(mergeRouteFiltersAction({ ...filters, depotIds: [] }));
    } else if (Object.prototype.hasOwnProperty.call(filters, 'tripStatus') && !delayRangeAllowedTripStatuses.includes(filters.tripStatus)) {
        dispatch(mergeRouteFiltersAction({ ...filters, delayRange: {} }));
    } else {
        dispatch(mergeRouteFiltersAction(filters));
    }
};

export const resetSorting = () => ({
    type: ACTION_TYPE.RESET_CONTROL_ROUTES_SORTING,
});
