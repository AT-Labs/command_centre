import { result, isEmpty, orderBy } from 'lodash-es';
import { createSelector } from 'reselect';

export const getStopMessagesState = state => result(state, 'control.stopMessaging');
export const getAllStopMessages = createSelector(getStopMessagesState, stopMessagesState => result(stopMessagesState, 'stopMessages'));
export const getStopMessagesPermissions = createSelector(getStopMessagesState, stopMessagesState => result(
    stopMessagesState,
    'stopMessagesPermissions',
));
export const getStopMessagesLoadingState = createSelector(getStopMessagesState, stopMessagesState => result(
    stopMessagesState,
    'isStopMessagesLoading',
));
export const getStopMessagesSortingParams = createSelector(getStopMessagesState, stopMessagesState => result(
    stopMessagesState,
    'sortingParams',
));
export const getSortedStopMesssages = createSelector(
    getAllStopMessages,
    getStopMessagesSortingParams,
    (allStopMessages, stopMessagesSortingParams) => (!isEmpty(stopMessagesSortingParams)
        ? orderBy(allStopMessages, stopMessagesSortingParams.sortBy, stopMessagesSortingParams.order)
        : allStopMessages),
);
export const getModal = createSelector(getStopMessagesState, stopMessagesState => result(
    stopMessagesState,
    'modal',
));
