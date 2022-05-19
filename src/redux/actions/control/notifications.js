import moment from 'moment';
import { isEqual } from 'lodash-es';
import ACTION_TYPE from '../../action-types';
import { setBannerError } from '../activity';
import * as notificationsApi from '../../../utils/transmitters/notifications-api';
import { getLastFilterRequest, getNotificationsDatagridConfig } from '../../selectors/control/notifications';

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
        notificationsApi.getNotifications(filterRequest)
            .then((result) => {
                dispatch(updateLastFilterRequest(filterRequest));
                dispatch(totalFilterCount(result.totalResults));
                dispatch(loadNotifications(result.items));
            })
            .catch(() => {
                dispatch(setBannerError('An error occurred requesting Notification data.'));
            });
    }
};

export const updateNotificationsDatagridConfig = dataGridConfig => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_DATAGRID_CONFIG,
        payload: dataGridConfig,
    });
    dispatch(filterNotifications());
};
