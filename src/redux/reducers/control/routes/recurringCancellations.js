import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../../action-types';

export const INIT_STATE = {
    recurringCancellations: [],
    recurringCancellationsDatagridConfig: {
        columns: [],
        page: 0,
        pageSize: 15,
        sortModel: [
            { field: 'routeVariantId', sort: 'asc' },
            { field: 'startTime', sort: 'asc' },
        ],
        density: 'standard',
        routeSelection: '',
        filterModel: { items: [], linkOperator: 'and' },
        pinnedColumns: { right: ['action'] },
    },
    permissions: [],
    redirectionStatus: {
        status: null,
        data: null,
    },
};

const handleRecurringCancellationsUpdate = (state, { payload: { recurringCancellations } }) => ({ ...state, recurringCancellations });
const handleRecurringCancellationsDatagridConfig = (state, action) => (
    { ...state, recurringCancellationsDatagridConfig: { ...state.recurringCancellationsDatagridConfig, ...action.payload } }
);
const handleRecurringCancellationPermissions = (state, { payload: { permissions } }) => ({ ...state, permissions });
const handleRecurringCancellationRedirection = (state, action) => (
    { ...state, redirectionStatus: { ...state.redirectionStatus, ...action.payload } }
);

export default handleActions({
    [ACTION_TYPE.FETCH_RECURRING_CANCELLATIONS]: handleRecurringCancellationsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_RECURRING_CANCELLATIONS_DATAGRID_CONFIG]: handleRecurringCancellationsDatagridConfig,
    [ACTION_TYPE.FETCH_RECURRING_CANCELLATIONS_PERMISSIONS]: handleRecurringCancellationPermissions,
    [ACTION_TYPE.UPDATE_CONTROL_RECURRING_CANCELLATIONS_REDIRECTION]: handleRecurringCancellationRedirection,
}, INIT_STATE);
