import _ from 'lodash-es';
import ACTION_TYPE from '../../action-types';
import ERROR_TYPE from '../../../types/error-types';
import STOP_MESSAGE_TYPE from '../../../types/stop-messages-types';
import * as stopMessagingApi from '../../../utils/transmitters/stop-messaging-api';
import { setBannerError, reportError } from '../activity';
import { transformIncidentNo } from '../../../utils/control/disruptions';

const loadStopMessages = stopMessages => ({
    type: ACTION_TYPE.FETCH_CONTROL_STOP_MESSAGES,
    payload: {
        stopMessages,
    },
});

const updateStopMessagesPermissions = stopMessagesPermissions => ({
    type: ACTION_TYPE.UPDATE_STOP_MESSAGES_PERMISSIONS,
    payload: {
        stopMessagesPermissions,
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

            const filteredStopMessages = stopMessages.filter(stopMessage => stopMessage.workflowState !== STOP_MESSAGE_TYPE.WORKFLOW_STATUS.DELETED);
            let activeStopMessages = _.sortBy(filteredStopMessages, 'startTime');

            activeStopMessages = activeStopMessages.map((message) => {
                if (message.incidentId) {
                    return {
                        ...message,
                        incidentNo: transformIncidentNo(message.incidentId),
                    };
                }
                return message;
            });

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

export const updateStopMessage = (payload, stopMessageId, recurrence) => (dispatch) => {
    dispatch(updateLoadingStopMessagesState(true));

    const promises = [];
    if (!recurrence) {
        promises.push(stopMessagingApi.updateStopMessage(payload, stopMessageId));
    } else {
        for (let index = 1; index <= recurrence.weeks; index++) {
            let startTime = payload.startTime.clone();
            let endTime = payload.endTime.clone();
            const week = index - 1;
            if (week > 0) {
                startTime.add(week, 'w');
                endTime.add(week, 'w');
            }

            recurrence.days.forEach((day) => {
                // It's not necessary to clone it every time but it avoids moment variables being the same instance (saw in tests)
                startTime = startTime.clone().weekday(day);
                endTime = endTime.clone().weekday(day);

                if (startTime.isBefore(payload.startTime) || endTime.isBefore(Date.now())) {
                    // We skip recurrent dates that are before the event's start date or that they already ended.
                    return;
                }

                const newPayload = {
                    ...payload,
                    startTime,
                    endTime,
                };
                promises.push(stopMessagingApi.updateStopMessage(newPayload, stopMessageId));
            });
        }
    }
    return Promise.all(promises)
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
