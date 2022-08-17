import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getTripReplaysView = state => _.result(state, 'control.tripReplays.tripReplaysView');
export const getTripReplayShouldDisplayFilters = createSelector(getTripReplaysView, tripReplaysView => _.result(tripReplaysView, 'isFiltersViewDisplayed'));
export const getTripReplaySingleTripDisplayed = createSelector(getTripReplaysView, tripReplaysView => _.result(tripReplaysView, 'isSingleTripDisplayed'));
export const getTripReplayRedirected = createSelector(getTripReplaysView, tripReplaysView => _.result(tripReplaysView, 'isRedirected'));
export const getTripReplayTrips = createSelector(getTripReplaysView, tripReplaysView => _.result(tripReplaysView, 'trips'));
export const getTripReplayTotalResults = createSelector(getTripReplaysView, tripReplaysView => _.result(tripReplaysView, 'totalResults'));
export const getTripReplayHasMore = createSelector(getTripReplaysView, tripReplaysView => _.result(tripReplaysView, 'hasMore'));
