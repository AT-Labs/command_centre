import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getStopMessagingState = state => _.result(state, 'control.stopMessaging');
export const getAllStopGroups = createSelector(getStopMessagingState, stopGroupsState => _.result(stopGroupsState, 'stopGroups'));
export const getStopGroupsLoadingState = createSelector(getStopMessagingState, stopGroupsState => _.result(stopGroupsState, 'isStopGroupsLoading'));
