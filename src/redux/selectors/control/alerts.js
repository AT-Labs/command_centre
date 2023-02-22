import { result, slice, orderBy, isEmpty } from 'lodash-es';
import { createSelector } from 'reselect';

const PAGE_SIZE = 10;

export const getAlertsState = state => result(state, 'control.alerts');
export const getAllAlerts = createSelector(getAlertsState, alertsState => result(alertsState, 'alerts'));
export const getAlertsDatagridConfig = createSelector(getAlertsState, alertsState => result(alertsState, 'alertsDatagridConfig'));
// eslint-disable-next-line max-len
export const getLatestActiveAlerts = createSelector(getAllAlerts, (alerts) => {
    if (!alerts) return [];
    return slice(alerts, 0, alerts.length > PAGE_SIZE ? PAGE_SIZE : alerts);
});
export const isAlertsEmpty = createSelector(getAllAlerts, alerts => isEmpty(alerts));
export const latestModifyAt = createSelector(getAllAlerts, (alerts) => {
    const orderedAlerts = orderBy(alerts, 'modifiedAt', 'asc');
    return orderedAlerts.length > 0 ? orderedAlerts[orderedAlerts.length - 1].modifiedAt : '';
});
