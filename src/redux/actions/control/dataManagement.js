import _ from 'lodash-es';
import ACTION_TYPE from '../../action-types';
import STOP_MESSAGE_TYPE from '../../../types/stop-messages-types';
import ERROR_TYPE from '../../../types/error-types';
import * as stopMessagingApi from '../../../utils/transmitters/stop-messaging-api';
import { setBannerError, reportError } from '../activity';

export const updateDataManagementPageSettings = model => ({
    type: ACTION_TYPE.UPDATE_CONTROL_DATAMANAGEMENT_PAGESETTINGS,
    payload: model,
});

const loadStopGroups = (stopGroups, stopGroupsIncludingDeleted) => ({
    type: ACTION_TYPE.FETCH_CONTROL_STOP_GROUPS,
    payload: {
        stopGroups,
        stopGroupsIncludingDeleted,
    },
});

const updateLoadingStopGroupsState = isStopGroupsLoading => ({
    type: ACTION_TYPE.UPDATE_CONTROL_STOP_GROUPS_LOADING,
    payload: {
        isStopGroupsLoading,
    },
});

export const getStopGroups = () => (dispatch) => {
    dispatch(updateLoadingStopGroupsState(true));
    return stopMessagingApi.getStopGroups()
        .then((stopGroups) => {
            const filteredStopGroups = stopGroups.filter(
                stopGroup => stopGroup.workflowState !== STOP_MESSAGE_TYPE.WORKFLOW_STATUS.DELETED,
            );
            const mappedStopGroups = _.keyBy(stopGroups, group => group.id);
            dispatch(loadStopGroups(filteredStopGroups, mappedStopGroups));
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
