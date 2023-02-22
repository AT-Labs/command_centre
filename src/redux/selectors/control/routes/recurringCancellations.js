/* eslint-disable max-len */
import { result, find } from 'lodash-es';
import { createSelector } from 'reselect';
import USER_PERMISSIONS from '../../../../types/user-permissions-types';

export const getRecurringCancellationsState = state => result(state, 'control.routes.recurringCancellations');

export const getRecurringCancellations = createSelector(getRecurringCancellationsState, recurringCancellationsState => result(recurringCancellationsState, 'recurringCancellations'));
export const getRecurringCancellationsDatagridConfig = createSelector(getRecurringCancellationsState, recurringCancellationsState => result(recurringCancellationsState, 'recurringCancellationsDatagridConfig'));
export const getRecurringCancellationPermissions = createSelector(getRecurringCancellationsState, recurringCancellationsState => result(recurringCancellationsState, 'permissions'));
export const getRecurringCancellationRedirectionStatus = createSelector(getRecurringCancellationsState, recurringCancellationsState => result(recurringCancellationsState, 'redirectionStatus'));

export const isRecurringCancellationUpdateAllowed = createSelector(getRecurringCancellationPermissions, permissions => !!find(permissions, { _rel: USER_PERMISSIONS.RECURRING_CANCELLATIONS.UPDATE_RECURRING_CANCELLATIONS }));
