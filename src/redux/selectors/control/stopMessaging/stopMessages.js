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
export const getStopMessagesSortingParams = createSelector(getStopMessagesState, stopMessagesState => _.result(
    stopMessagesState, 'sortingParams',
));
export const getSortedStopMesssages = createSelector(
    getAllStopMessages,
    getStopMessagesSortingParams,
    (allStopMessages, stopMessagesSortingParams) => (!_.isEmpty(stopMessagesSortingParams)
        ? _.orderBy(allStopMessages, stopMessagesSortingParams.sortBy, stopMessagesSortingParams.order)
        : allStopMessages),
);
export const getModal = createSelector(getStopMessagesState, stopMessagesState => _.result(
    stopMessagesState, 'modal',
));
