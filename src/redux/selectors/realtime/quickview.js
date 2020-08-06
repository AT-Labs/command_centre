import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getQuickviewState = state => result(state, 'realtime.quickview');
export const getTripUpdateState = createSelector(getQuickviewState, quickviewState => quickviewState.tripUpdate);
export const getTripUpdateDelay = createSelector(getTripUpdateState, tripUpdateState => result(tripUpdateState, 'delay', null));
