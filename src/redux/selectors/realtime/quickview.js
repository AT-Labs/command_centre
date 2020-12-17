import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getQuickviewState = state => result(state, 'realtime.quickview');
export const getTripUpdates = createSelector(getQuickviewState, quickviewState => quickviewState.tripUpdates);
