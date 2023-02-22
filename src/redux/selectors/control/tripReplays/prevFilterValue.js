import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getTripReplaysView = state => result(state, 'control.tripReplays.prevFilterValue');
export const getPreviousTripReplayFilterValues = createSelector(getTripReplaysView, tripReplaysView => result(tripReplaysView, 'filterValues'));
export const getPreviousTripReplayTripValues = createSelector(getTripReplaysView, tripReplaysView => result(tripReplaysView, 'trip'));
