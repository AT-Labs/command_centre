import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    notifications: [],
    notificationsDatagridConfig: {
        columns: [],
        page: 0,
        pageSize: 15,
        sortModel: [
            { field: 'date_created', sort: 'desc' },
            { field: 'status', sort: 'asc' },
        ],
        density: 'standard',
        routeSelection: '',
        filterModel: { items: [], linkOperator: 'and' },
    },
};

const handleNotificationsUpdate = (state, { payload: { notifications } }) => ({ ...state, notifications });

const handleNotificationsDatagridConfig = (state, action) => ({ ...state, notificationsDatagridConfig: { ...state.notificationsDatagridConfig, ...action.payload } });

export default handleActions({
    [ACTION_TYPE.FETCH_CONTROL_NOTIFICATIONS]: handleNotificationsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_DATAGRID_CONFIG]: handleNotificationsDatagridConfig,
}, INIT_STATE);
