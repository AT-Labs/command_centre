import _ from 'lodash-es';
import { createSelector } from 'reselect';

import USER_PERMISSIONS from '../../../types/user-permissions-types';

export const getNotificationsState = state => _.result(state, 'control.notifications');
export const getAllNotifications = createSelector(getNotificationsState, notificationsState => _.result(notificationsState, 'notifications'));
export const getNotificationsDatagridConfig = createSelector(getNotificationsState, notificationsState => _.result(notificationsState, 'datagridConfig'));
export const getNotificationsFilterCount = createSelector(getNotificationsState, notificationsState => _.result(notificationsState, 'totalFilterCount'));
export const getLastFilterRequest = createSelector(getNotificationsState, notificationsState => _.result(notificationsState, 'lastFilterRequest'));

export const isNotificationUpdateAllowed = notification => !!_.find(_.result(notification, '_links.permissions'), { _rel: USER_PERMISSIONS.NOTIFICATIONS.EDIT_NOTIFICATION });
