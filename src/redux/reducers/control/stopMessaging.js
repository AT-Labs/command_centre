import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    stopMessagesPermissions: [],
    stopMessages: [],
    isStopMessagesLoading: false,
    sortingParams: {},
    modal: {
        type: null,
        isOpen: false,
        stopMessage: null,
    },
};

const handleStopMessagesLoadingUpdate = (state, { payload: { isStopMessagesLoading } }) => ({ ...state, isStopMessagesLoading });
const handleStopMessagesUpdate = (state, { payload: { stopMessages } }) => ({ ...state, stopMessages });
const handleStopMessagesPermissionsUpdate = (state, { payload: { stopMessagesPermissions } }) => ({ ...state, stopMessagesPermissions });
const handleSortingParamsUpdate = (state, { payload: { sortingParams } }) => ({ ...state, sortingParams });
const handleToggleModal = (state, { payload: { type, stopMessage } }) => ({
    ...state,
    modal: {
        ...state.modal,
        type,
        stopMessage,
        isOpen: !state.modal.isOpen,
    },
});

export default handleActions({
    [ACTION_TYPE.UPDATE_STOP_MESSAGES_PERMISSIONS]: handleStopMessagesPermissionsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_STOP_MESSAGES_LOADING]: handleStopMessagesLoadingUpdate,
    [ACTION_TYPE.FETCH_CONTROL_STOP_MESSAGES]: handleStopMessagesUpdate,
    [ACTION_TYPE.UPDATE_STOP_MESSAGES_SORTING_PARAMS]: handleSortingParamsUpdate,
    [ACTION_TYPE.TOGGLE_STOP_MESSAGES_MODAL]: handleToggleModal,
}, INIT_STATE);
