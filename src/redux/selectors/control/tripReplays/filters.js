import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getTripReplayFilters = state => _.result(state, 'control.tripReplays.filters');
export const getTripReplaySearchTermFilter = createSelector(getTripReplayFilters, tripReplayFilters => _.result(tripReplayFilters, 'searchTerm'));
export const getTripReplaySearchDateFilter = createSelector(getTripReplayFilters, tripReplayFilters => _.result(tripReplayFilters, 'searchDate'));
export const getTripReplayStartTimeFilter = createSelector(getTripReplayFilters, tripReplayFilters => _.result(tripReplayFilters, 'startTime'));
export const getTripReplayEndTimeFilter = createSelector(getTripReplayFilters, tripReplayFilters => _.result(tripReplayFilters, 'endTime'));
