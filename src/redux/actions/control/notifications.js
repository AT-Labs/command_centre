import moment from 'moment';
import { isEqual } from 'lodash-es';
import ACTION_TYPE from '../../action-types';
import { setBannerError } from '../activity';
import * as notificationsApi from '../../../utils/transmitters/notifications-api';
import { getLastFilterRequest, getNotificationsDatagridConfig } from '../../selectors/control/notifications';
import { ACTION_RESULT } from '../../../types/notification-types';
import { transformIncidentNo } from '../../../utils/control/disruptions';
import ERROR_TYPE from '../../../types/error-types';

const loadNotifications = notifications => ({
    type: ACTION_TYPE.FETCH_CONTROL_NOTIFICATIONS,
    payload: {
        notifications,
    },
});

const totalFilterCount = count => ({
    type: ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_FILTER_COUNT,
    payload: {
        totalFilterCount: count,
    },
});

const updateLastFilterRequest = filterObject => ({
    type: ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_LAST_FILTER,
    payload: {
        lastFilterRequest: filterObject,
    },
});

const updateNotificationsPermissions = permissions => ({
    type: ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_PERMISSIONS,
    payload: {
        permissions,
    },
});

const parseOperatorValue = (operatorToParse) => {
    switch (operatorToParse) {
    case 'is':
    case 'equals':
    case '=':
        return '==';
    case 'onOrAfter':
        return '>=';
    case 'onOrBefore':
        return '<=';
    case 'not':
        return '!=';
    case 'isAnyOf':
        return 'IN';
    default:
        return operatorToParse;
    }
};

const parseFilterValue = (fieldName, value) => {
    switch (fieldName) {
    case 'startTime':
    case 'endTime':
        return moment(value).unix();
    default:
        return value;
    }
};

const removeNonNullableFilters = model => model?.items?.filter(item => !!item.value && (!Array.isArray(item.value) || item.value.length > 0));

const convertFilter = model => removeNonNullableFilters(model).flatMap((item) => {
    if (item.columnField === 'sourceId') {
        return [{
            field: 'sourceType',
            operator: parseOperatorValue(item.operatorValue),
            value: parseFilterValue(item.columnField, item.value.source),
        }, {
            field: item.columnField,
            operator: parseOperatorValue(item.operatorValue),
            value: parseFilterValue(item.columnField, item.value.id),
        }];
    }

    return [{
        field: item.columnField,
        operator: parseOperatorValue(item.operatorValue),
        value: parseFilterValue(item.columnField, item.value),
    }];
});

const parseSortModel = sortModel => sortModel.map(model => ({ field: model.field, direction: model.sort.toUpperCase() }));

const getFilterObject = datagridConfig => ({
    filters: convertFilter(datagridConfig.filterModel),
    sorts: parseSortModel(datagridConfig.sortModel),
    offset: datagridConfig.page * datagridConfig.pageSize,
    limit: datagridConfig.pageSize,
});

export const filterNotifications = forceLoad => (dispatch, getState) => {
    const state = getState();
    const datagridConfig = getNotificationsDatagridConfig(state);
    const lastFilterRequest = getLastFilterRequest(state);
    const filterRequest = getFilterObject(datagridConfig);

    if (forceLoad || !lastFilterRequest || !isEqual(filterRequest, lastFilterRequest)) {
        return notificationsApi.getNotifications(filterRequest)
            .then((result) => {
                const { items, totalResults, _links } = result;
                dispatch(updateLastFilterRequest(filterRequest));
                dispatch(updateNotificationsPermissions(_links));
                dispatch(totalFilterCount(totalResults));
                dispatch(loadNotifications(items));
            })
            .catch(() => {
                if (ERROR_TYPE.fetchNotificationsEnabled) {
                    return dispatch(setBannerError(ERROR_TYPE.fetchNotifications));
                }
                return Promise.resolve();
            });
    }
    return Promise.resolve();
};

export const updateNotificationsDatagridConfig = dataGridConfig => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_DATAGRID_CONFIG,
        payload: dataGridConfig,
    });
    dispatch(filterNotifications());
};

const updateRequestingNotificationState = (isRequesting, resultNotificationId) => ({
    type: ACTION_TYPE.UPDATE_CONTROL_NOTIFICATION_ACTION_REQUESTING,
    payload: {
        isRequesting,
        resultNotificationId,
    },
});

export const updateRequestingNotificationResult = (resultNotificationId, { resultStatus, resultMessage }) => ({
    type: ACTION_TYPE.UPDATE_CONTROL_NOTIFICATION_ACTION_RESULT,
    payload: {
        resultNotificationId,
        resultStatus,
        resultMessage,
    },
});

export const clearNotificationActionResult = () => ({
    type: ACTION_TYPE.UPDATE_CONTROL_NOTIFICATION_ACTION_RESULT,
    payload: {
        resultNotificationId: null,
        resultStatus: null,
        resultMessage: null,
    },
});

const notificationApiActions = (notification, apiMethod, successResult, errorResult) => async (dispatch) => {
    const id = notification.notificationContentId;
    const incidentNo = transformIncidentNo(notification.source.identifier);
    dispatch(updateRequestingNotificationState(true, id));

    try {
        await apiMethod(id);
        dispatch(updateRequestingNotificationResult(id, successResult(incidentNo, notification.source.version)));
        dispatch(filterNotifications(true));
    } catch (error) {
        dispatch(updateRequestingNotificationResult(id, errorResult(incidentNo, notification.source.version)));
    } finally {
        dispatch(updateRequestingNotificationState(false, id));
    }
};

export const updateNotification = notificationUpdate => (dispatch) => {
    const { notification, name, content } = notificationUpdate;
    dispatch(notificationApiActions(
        notification,
        id => notificationsApi.updateNotification(id, name, content),
        ACTION_RESULT.UPDATE_SUCCESS,
        ACTION_RESULT.UPDATE_ERROR,
    ));
};

export const deleteNotification = notification => (dispatch) => {
    dispatch(notificationApiActions(
        notification,
        id => notificationsApi.deleteNotification(id),
        ACTION_RESULT.DELETE_SUCCESS,
        ACTION_RESULT.DELETE_ERROR,
    ));
};

export const publishNotification = notification => (dispatch) => {
    dispatch(notificationApiActions(
        notification,
        id => notificationsApi.publishNotification(id),
        ACTION_RESULT.PUBLISH_SUCCESS,
        ACTION_RESULT.PUBLISH_ERROR,
    ));
};
