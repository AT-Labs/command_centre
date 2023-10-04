import { result, find } from 'lodash-es';
import { createSelector } from 'reselect';

import USER_PERMISSIONS from '../../../types/user-permissions-types';

export const getNotificationsState = state => result(state, 'control.notifications');
export const getAllNotifications = createSelector(getNotificationsState, notificationsState => result(notificationsState, 'notifications'));
export const getNotificationsDatagridConfig = createSelector(getNotificationsState, notificationsState => result(notificationsState, 'datagridConfig'));
export const getNotificationsFilterCount = createSelector(getNotificationsState, notificationsState => result(notificationsState, 'totalFilterCount'));
export const getLastFilterRequest = createSelector(getNotificationsState, notificationsState => result(notificationsState, 'lastFilterRequest'));
export const getNotificationAction = createSelector(getNotificationsState, ({ action }) => action);

export const isNotificationUpdateAllowed = notification => !!find(result(notification, '_links.permissions'), { _rel: USER_PERMISSIONS.NOTIFICATIONS.EDIT_NOTIFICATION });
export const getSelectedNotification = createSelector(getNotificationsState, notificationsState => result(notificationsState, 'selectedNotification'));
