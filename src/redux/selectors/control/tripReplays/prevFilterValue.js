import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getTripReplaysView = state => _.result(state, 'control.tripReplays.prevFilterValue');
export const getPreviousTripReplayFilterValues = createSelector(getTripReplaysView, tripReplaysView => _.result(tripReplaysView, 'filterValues'));
export const getPreviousTripReplayTripValues = createSelector(getTripReplaysView, tripReplaysView => _.result(tripReplaysView, 'trip'));
