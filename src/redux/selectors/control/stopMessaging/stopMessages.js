import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getStopMessagesState = state => _.result(state, 'control.stopMessaging');
export const getAllStopMessages = createSelector(getStopMessagesState, stopMessagesState => _.result(stopMessagesState, 'stopMessages'));
export const getStopMessagesPermissions = createSelector(getStopMessagesState, stopMessagesState => _.result(
    stopMessagesState, 'stopMessagesPermissions',
));
export const getStopMessagesLoadingState = createSelector(getStopMessagesState, stopMessagesState => _.result(
    stopMessagesState, 'isStopMessagesLoading',
));
