import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getTripReplayFilters = state => result(state, 'control.tripReplays.filters');
export const getTripReplaySearchTermFilter = createSelector(getTripReplayFilters, tripReplayFilters => result(tripReplayFilters, 'searchTerm'));
export const getTripReplaySearchDateFilter = createSelector(getTripReplayFilters, tripReplayFilters => result(tripReplayFilters, 'searchDate'));
export const getTripReplayStartTimeFilter = createSelector(getTripReplayFilters, tripReplayFilters => result(tripReplayFilters, 'startTime'));
export const getTripReplayEndTimeFilter = createSelector(getTripReplayFilters, tripReplayFilters => result(tripReplayFilters, 'endTime'));
export const getTripReplayTimeTypeFilter = createSelector(getTripReplayFilters, tripReplayFilters => result(tripReplayFilters, 'timeType'));
