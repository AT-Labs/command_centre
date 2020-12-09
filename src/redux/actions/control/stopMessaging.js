import _ from 'lodash-es';
import ACTION_TYPE from '../../action-types';
import ERROR_TYPE from '../../../types/error-types';
import STOP_MESSAGE_TYPE from '../../../types/stop-messages-types';
import * as stopMessagingApi from '../../../utils/transmitters/stop-messaging-api';
import { setBannerError, reportError } from '../activity';

const loadStopMessages = stopMessages => ({
    type: ACTION_TYPE.FETCH_CONTROL_STOP_MESSAGES,
    payload: {
        stopMessages,
    },
});

const loadStopGroups = stopGroups => ({
    type: ACTION_TYPE.FETCH_CONTROL_STOP_GROUPS,
    payload: {
        stopGroups,
    },
});

const updateStopMessagesPermissions = stopMessagesPermissions => ({
    type: ACTION_TYPE.UPDATE_STOP_MESSAGES_PERMISSIONS,
    payload: {
        stopMessagesPermissions,
    },
});

const updateLoadingStopGroupsState = isStopGroupsLoading => ({
    type: ACTION_TYPE.UPDATE_CONTROL_STOP_GROUPS_LOADING,
    payload: {
        isStopGroupsLoading,
    },
});

const updateLoadingStopMessagesState = isStopMessagesLoading => ({
    type: ACTION_TYPE.UPDATE_CONTROL_STOP_MESSAGES_LOADING,
    payload: {
        isStopMessagesLoading,
    },
});

export const getStopMessagesAndPermissions = () => (dispatch) => {
    dispatch(updateLoadingStopMessagesState(true));
    return stopMessagingApi.getStopMessages()
        .then((messagesAndPermissions) => {
            const stopMessages = messagesAndPermissions.messages;
            const { permissions } = messagesAndPermissions._links; // eslint-disable-line

            const filteredStopMessages = stopMessages.filter(stopMessage => stopMessage.workflowState !== STOP_MESSAGE_TYPE.STATUS.DELETED);
            const activeStopMessages = _.sortBy(filteredStopMessages, 'startTime');
            dispatch(updateStopMessagesPermissions(permissions));
            dispatch(loadStopMessages(activeStopMessages));
            dispatch(updateLoadingStopMessagesState(false));
        })
        .catch((error) => {
            if (ERROR_TYPE.fetchStopMessagesEnabled) {
                const errorMessage = error.code === 500 ? ERROR_TYPE.fetchStopMessages : error.message;
                dispatch(setBannerError(errorMessage));
            }
            dispatch(updateLoadingStopMessagesState(false));
        });
};

export const updateStopMessage = (payload, stopMessageId) => (dispatch) => {
    dispatch(updateLoadingStopMessagesState(true));
    return stopMessagingApi.updateStopMessage(payload, stopMessageId)
        .then(() => {
            dispatch(getStopMessagesAndPermissions());
            dispatch(updateLoadingStopMessagesState(false));
        })
        .catch((error) => {
            const errorMessage = error.code === 500 ? ERROR_TYPE.createStopMessage : error.message;
            dispatch(reportError({ error: { createStopMessage: errorMessage } }));
            dispatch(updateLoadingStopMessagesState(false));
            return Promise.reject();
        });
};

export const getStopGroups = () => (dispatch) => {
    dispatch(updateLoadingStopGroupsState(true));
    return stopMessagingApi.getStopGroups()
        .then((stopGroups) => {
            const filteredStopGroups = stopGroups.filter(
                stopGroup => stopGroup.workflowState !== STOP_MESSAGE_TYPE.STATUS.DELETED,
            );
            dispatch(loadStopGroups(filteredStopGroups));
            dispatch(updateLoadingStopGroupsState(false));
        })
        .catch((error) => {
            if (ERROR_TYPE.fetchStopMessagesEnabled) {
                const errorMessage = error.code === 500 ? ERROR_TYPE.fetchStopGroups : error.message;
                dispatch(setBannerError(errorMessage));
            }
            dispatch(updateLoadingStopGroupsState(false));
        });
};

export const updateStopGroup = (payload, stopGroupId) => (dispatch) => {
    dispatch(updateLoadingStopGroupsState(true));
    return stopMessagingApi.updateStopGroup(payload, stopGroupId)
        .then(() => {
            dispatch(getStopGroups());
            dispatch(updateLoadingStopGroupsState(false));
        })
        .catch((error) => {
            const errorMessage = error.code === 500 ? ERROR_TYPE.createStopGroup : error.message;
            dispatch(reportError({ error: { createStopGroup: errorMessage } }));
            dispatch(updateLoadingStopGroupsState(false));
            return Promise.reject();
        });
};

export const updateStopMessagesSortingParams = sortingParams => ({
    type: ACTION_TYPE.UPDATE_STOP_MESSAGES_SORTING_PARAMS,
    payload: {
        sortingParams,
    },
});

export const toggleModals = (type, stopMessage) => ({
    type: ACTION_TYPE.TOGGLE_STOP_MESSAGES_MODAL,
    payload: {
        type,
        stopMessage,
    },
});
