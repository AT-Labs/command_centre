import { handleActions } from 'redux-actions';
import moment from 'moment';

import ACTION_TYPE from '../../../action-types';

import { DEFAULT_ROUTE_TYPE } from '../../../../components/Control/Common/Filters/FilterByMode';
import { getStartTimeFromFilterInitialTime } from '../../../../utils/control/routes';

export const INIT_STATE = {
    agencyId: '',
    depotIds: [],
    routeType: DEFAULT_ROUTE_TYPE,
    isGroupedByRoute: false,
    isGroupedByRouteVariant: false,
    startTimeFrom: getStartTimeFromFilterInitialTime(moment()),
    startTimeTo: '',
    endTimeFrom: '',
    endTimeTo: '',
    tripStatus: '',
    vehicleLabels: [],
    referenceIds: [],
    routeShortName: '',
    routeVariantId: '',
    trackingStatuses: [],
    sorting: { sortBy: 'startTime', order: 'asc' },
    delayRange: { min: null, max: null },
};

const handleRouteFiltersMerge = (state, { payload: { filters } }) => ({ ...state, ...filters });

const handleResetSorting = state => ({ ...state, ...{ sorting: INIT_STATE.sorting } });

export default handleActions({
    [ACTION_TYPE.MERGE_CONTROL_ROUTES_FILTERS]: handleRouteFiltersMerge,
    [ACTION_TYPE.RESET_CONTROL_ROUTES_SORTING]: handleResetSorting,
}, INIT_STATE);
