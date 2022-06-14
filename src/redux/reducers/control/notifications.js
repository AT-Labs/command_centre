import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    notifications: [],
    datagridConfig: {
        columns: [],
        page: 0,
        pageSize: 15,
        sortModel: [],
        density: 'standard',
        routeSelection: '',
        filterModel: { items: [{
            columnField: 'status',
            operatorValue: 'is',
            value: 'in-progress',
        }],
        linkOperator: 'and' },
        pinnedColumns: { right: ['action'] },
    },
    totalFilterCount: 0,
    lastFilterRequest: null,
    permissions: [],
};

const handleNotificationsUpdate = (state, { payload: { notifications } }) => ({ ...state, notifications });

const handleDatagridConfig = (state, action) => ({ ...state, datagridConfig: { ...state.datagridConfig, ...action.payload } });

const handleNotificationsFilterCountUpdate = (state, { payload: { totalFilterCount } }) => ({ ...state, totalFilterCount });

const handleNotificationsLastFilterUpdate = (state, { payload: { lastFilterRequest } }) => ({ ...state, lastFilterRequest });

const handleUpdateNotificationsPermissions = (state, { payload: { permissions } }) => ({ ...state, permissions });

export default handleActions({
    [ACTION_TYPE.FETCH_CONTROL_NOTIFICATIONS]: handleNotificationsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_DATAGRID_CONFIG]: handleDatagridConfig,
    [ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_FILTER_COUNT]: handleNotificationsFilterCountUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_LAST_FILTER]: handleNotificationsLastFilterUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_PERMISSIONS]: handleUpdateNotificationsPermissions,
}, INIT_STATE);
