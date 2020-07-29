import _ from 'lodash-es';
import { createSelector } from 'reselect';

const PAGE_SIZE = 10;

export const getNotificationsState = state => _.result(state, 'control.notifications');
export const getAllNotifications = createSelector(getNotificationsState, notificationsState => _.result(notificationsState, 'notifications'));
export const getNotificationsFilters = createSelector(getNotificationsState, notificationsState => _.result(notificationsState, 'filters'));
// eslint-disable-next-line max-len
export const getLatestActiveNotifications = createSelector(getAllNotifications, (notifications) => {
    if (!notifications) return [];
    return _.slice(notifications, 0, notifications.length > PAGE_SIZE ? PAGE_SIZE : notifications);
});
export const isNotificationsEmpty = createSelector(getAllNotifications, notifications => _.isEmpty(notifications));
export const latestModifyAt = createSelector(getAllNotifications, (notifications) => {
    const orderedNotifications = _.orderBy(notifications, 'modifiedAt', 'asc');
    return orderedNotifications.length > 0 ? orderedNotifications[orderedNotifications.length - 1].modifiedAt : '';
});
