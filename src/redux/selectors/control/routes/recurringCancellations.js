/* eslint-disable max-len */
import _ from 'lodash-es';
import { createSelector } from 'reselect';
import USER_PERMISSIONS from '../../../../types/user-permissions-types';

export const getRecurringCancellationsState = state => _.result(state, 'control.routes.recurringCancellations');

export const getRecurringCancellations = createSelector(getRecurringCancellationsState, recurringCancellationsState => _.result(recurringCancellationsState, 'recurringCancellations'));
export const getRecurringCancellationsDatagridConfig = createSelector(getRecurringCancellationsState, recurringCancellationsState => _.result(recurringCancellationsState, 'recurringCancellationsDatagridConfig'));
export const getRecurringCancellationPermissions = createSelector(getRecurringCancellationsState, recurringCancellationsState => _.result(recurringCancellationsState, 'permissions'));
export const getRecurringCancellationRedirectionStatus = createSelector(getRecurringCancellationsState, recurringCancellationsState => _.result(recurringCancellationsState, 'redirectionStatus'));

export const isRecurringCancellationUpdateAllowed = createSelector(getRecurringCancellationPermissions, permissions => !!_.find(permissions, { _rel: USER_PERMISSIONS.RECURRING_CANCELLATIONS.UPDATE_RECURRING_CANCELLATIONS }));
