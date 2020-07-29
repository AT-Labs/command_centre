import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    stopMessagesPermissions: [],
    stopMessages: [],
    stopGroups: [],
    isStopMessagesLoading: false,
    isStopGroupsLoading: false,
};

const handleStopMessagesLoadingUpdate = (state, { payload: { isStopMessagesLoading } }) => ({ ...state, isStopMessagesLoading });
const handleStopMessagesUpdate = (state, { payload: { stopMessages } }) => ({ ...state, stopMessages });
const handleStopMessagesPermissionsUpdate = (state, { payload: { stopMessagesPermissions } }) => ({ ...state, stopMessagesPermissions });
const handleStopGroupsLoadingUpdate = (state, { payload: { isStopGroupsLoading } }) => ({ ...state, isStopGroupsLoading });
const handleStopGroupsUpdate = (state, { payload: { stopGroups } }) => ({ ...state, stopGroups });

export default handleActions({
    [ACTION_TYPE.UPDATE_CONTROL_STOP_GROUPS_LOADING]: handleStopGroupsLoadingUpdate,
    [ACTION_TYPE.FETCH_CONTROL_STOP_GROUPS]: handleStopGroupsUpdate,
    [ACTION_TYPE.UPDATE_STOP_MESSAGES_PERMISSIONS]: handleStopMessagesPermissionsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_STOP_MESSAGES_LOADING]: handleStopMessagesLoadingUpdate,
    [ACTION_TYPE.FETCH_CONTROL_STOP_MESSAGES]: handleStopMessagesUpdate,
}, INIT_STATE);
