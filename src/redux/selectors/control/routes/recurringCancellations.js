/* eslint-disable max-len */
import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getRecurringCancellationsState = state => _.result(state, 'control.routes.recurringCancellations');

export const getRecurringCancellations = createSelector(getRecurringCancellationsState, recurringCancellationsState => _.result(recurringCancellationsState, 'recurringCancellations'));
export const getRecurringCancellationsDatagridConfig = createSelector(getRecurringCancellationsState, recurringCancellationsState => _.result(recurringCancellationsState, 'recurringCancellationsDatagridConfig'));
