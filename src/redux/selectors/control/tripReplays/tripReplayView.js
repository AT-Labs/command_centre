import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getTripReplaysView = state => result(state, 'control.tripReplays.tripReplaysView');
export const getTripReplayShouldDisplayFilters = createSelector(getTripReplaysView, tripReplaysView => result(tripReplaysView, 'isFiltersViewDisplayed'));
export const getTripReplaySingleTripDisplayed = createSelector(getTripReplaysView, tripReplaysView => result(tripReplaysView, 'isSingleTripDisplayed'));
export const getTripReplayRedirected = createSelector(getTripReplaysView, tripReplaysView => result(tripReplaysView, 'isRedirected'));
export const getTripReplayTrips = createSelector(getTripReplaysView, tripReplaysView => result(tripReplaysView, 'trips'));
export const getTripReplayTotalResults = createSelector(getTripReplaysView, tripReplaysView => result(tripReplaysView, 'totalResults'));
export const getTripReplayHasMore = createSelector(getTripReplaysView, tripReplaysView => result(tripReplaysView, 'hasMore'));
