import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    stopMessagesPermissions: [],
    stopMessages: [],
    stopGroups: [],
    isStopMessagesLoading: false,
    isStopGroupsLoading: false,
    sortingParams: {},
};

const handleStopMessagesLoadingUpdate = (state, { payload: { isStopMessagesLoading } }) => ({ ...state, isStopMessagesLoading });
const handleStopMessagesUpdate = (state, { payload: { stopMessages } }) => ({ ...state, stopMessages });
const handleStopMessagesPermissionsUpdate = (state, { payload: { stopMessagesPermissions } }) => ({ ...state, stopMessagesPermissions });
const handleStopGroupsLoadingUpdate = (state, { payload: { isStopGroupsLoading } }) => ({ ...state, isStopGroupsLoading });
const handleStopGroupsUpdate = (state, { payload: { stopGroups } }) => ({ ...state, stopGroups });
const handleSortingParamsUpdate = (state, { payload: { sortingParams } }) => ({ ...state, sortingParams });

export default handleActions({
    [ACTION_TYPE.UPDATE_CONTROL_STOP_GROUPS_LOADING]: handleStopGroupsLoadingUpdate,
    [ACTION_TYPE.FETCH_CONTROL_STOP_GROUPS]: handleStopGroupsUpdate,
    [ACTION_TYPE.UPDATE_STOP_MESSAGES_PERMISSIONS]: handleStopMessagesPermissionsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_STOP_MESSAGES_LOADING]: handleStopMessagesLoadingUpdate,
    [ACTION_TYPE.FETCH_CONTROL_STOP_MESSAGES]: handleStopMessagesUpdate,
    [ACTION_TYPE.UPDATE_STOP_MESSAGES_SORTING_PARAMS]: handleSortingParamsUpdate,
}, INIT_STATE);
