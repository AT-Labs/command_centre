import ACTION_TYPE from '../../../action-types';

import { clearActiveRoute } from './routes';
import { clearActiveTripInstanceId } from './trip-instances';

const mergeRouteFiltersAction = filters => ({
    type: ACTION_TYPE.MERGE_CONTROL_ROUTES_FILTERS,
    payload: {
        filters,
    },
});

export const mergeRouteFilters = (filters, isCleanUpActiveNeeded) => (dispatch) => {
    if (isCleanUpActiveNeeded !== false) {
        dispatch(clearActiveRoute());
        dispatch(clearActiveTripInstanceId());
    }

    if (Object.prototype.hasOwnProperty.call(filters, 'agencyId')) {
        dispatch(mergeRouteFiltersAction({ ...filters, depotIds: [] }));
    } else {
        dispatch(mergeRouteFiltersAction(filters));
    }
};
