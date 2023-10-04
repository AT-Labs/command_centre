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
    action: {
        resultNotificationId: null,
        isRequesting: false,
        resultStatus: null,
        resultMessage: null,
        resultAction: null,
    },
    selectedNotification: null,
};

const handleNotificationsUpdate = (state, { payload: { notifications } }) => ({ ...state, notifications });

const handleDatagridConfig = (state, action) => ({ ...state, datagridConfig: { ...state.datagridConfig, ...action.payload } });

const handleNotificationsFilterCountUpdate = (state, { payload: { totalFilterCount } }) => ({ ...state, totalFilterCount });

const handleNotificationsLastFilterUpdate = (state, { payload: { lastFilterRequest } }) => ({ ...state, lastFilterRequest });

const handleUpdateNotificationsPermissions = (state, { payload: { permissions } }) => ({ ...state, permissions });

const handleNotificationActionRequestingUpdate = (state, { payload: { isRequesting, resultNotificationId = state.action.resultNotificationId } }) => ({
    ...state,
    action: {
        ...state.action,
        isRequesting,
        resultNotificationId,
    },
});

const handleNotificationActionResultUpdate = (state, { payload: { resultNotificationId, resultMessage, resultStatus, resultAction } }) => ({
    ...state,
    action: {
        ...state.action,
        resultMessage,
        resultStatus,
        resultNotificationId,
        resultAction,
    },
});

const handleUpdateSelectedNotification = (state, { payload: { selectedNotification } }) => ({ ...state, selectedNotification });

export default handleActions({
    [ACTION_TYPE.FETCH_CONTROL_NOTIFICATIONS]: handleNotificationsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_DATAGRID_CONFIG]: handleDatagridConfig,
    [ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_FILTER_COUNT]: handleNotificationsFilterCountUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_LAST_FILTER]: handleNotificationsLastFilterUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_PERMISSIONS]: handleUpdateNotificationsPermissions,
    [ACTION_TYPE.UPDATE_CONTROL_NOTIFICATION_ACTION_REQUESTING]: handleNotificationActionRequestingUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_NOTIFICATION_ACTION_RESULT]: handleNotificationActionResultUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_NOTIFICATION_SELECTED]: handleUpdateSelectedNotification,
}, INIT_STATE);
