import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getNotificationsState = state => _.result(state, 'control.notifications');
export const getAllNotifications = createSelector(getNotificationsState, notificationsState => _.result(notificationsState, 'notifications'));
export const getNotificationsDatagridConfig = createSelector(getNotificationsState, notificationsState => _.result(notificationsState, 'datagridConfig'));
export const getNotificationsFilterCount = createSelector(getNotificationsState, notificationsState => _.result(notificationsState, 'totalFilterCount'));
export const getLastFilterRequest = createSelector(getNotificationsState, notificationsState => _.result(notificationsState, 'lastFilterRequest'));
