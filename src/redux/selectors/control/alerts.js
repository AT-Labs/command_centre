import _ from 'lodash-es';
import { createSelector } from 'reselect';

const PAGE_SIZE = 10;

export const getAlertsState = state => _.result(state, 'control.alerts');
export const getAllAlerts = createSelector(getAlertsState, alertsState => _.result(alertsState, 'alerts'));
export const getAlertsDatagridConfig = createSelector(getAlertsState, alertsState => _.result(alertsState, 'alertsDatagridConfig'));
// eslint-disable-next-line max-len
export const getLatestActiveAlerts = createSelector(getAllAlerts, (alerts) => {
    if (!alerts) return [];
    return _.slice(alerts, 0, alerts.length > PAGE_SIZE ? PAGE_SIZE : alerts);
});
export const isAlertsEmpty = createSelector(getAllAlerts, alerts => _.isEmpty(alerts));
export const latestModifyAt = createSelector(getAllAlerts, (alerts) => {
    const orderedAlerts = _.orderBy(alerts, 'modifiedAt', 'asc');
    return orderedAlerts.length > 0 ? orderedAlerts[orderedAlerts.length - 1].modifiedAt : '';
});
