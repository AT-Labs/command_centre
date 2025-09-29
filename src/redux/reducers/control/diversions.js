import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';
import EDIT_TYPE from '../../../types/edit-types';

export const INIT_STATE = {
    isDiversionManagerOpen: false,
    isDiversionManagerLoading: false,
    diversionEditMode: EDIT_TYPE.CREATE,
    diversionResultState: {
        isLoading: false,
        diversionId: null,
        error: null,
    },
    diversion: null,
    // Centralized diversions data
    diversionsData: {},
    diversionsLoading: {},
    diversionsError: {},
};
const handleUpdateDiversionResultState = (state, { payload: { isLoading, diversionId, error } }) => ({
    ...state,
    diversionResultState: {
        isLoading,
        diversionId,
        error,
    },
});

const handleUpdateDiversionToEdit = (state, { payload: { diversion } }) => ({
    ...state,
    diversion,
});

const handleUpdateDiversionEditMode = (state, { payload: { diversionEditMode } }) => ({
    ...state,
    diversionEditMode,
});

const handleOpenDiversionManager = (state, { payload: { isDiversionManagerOpen } }) => ({
    ...state,
    isDiversionManagerOpen,
    isDiversionManagerLoading: isDiversionManagerOpen ? false : state.isDiversionManagerLoading,
});

const handleFetchDiversionsStart = (state, { payload: { disruptionId } }) => ({
    ...state,
    diversionsLoading: {
        ...state.diversionsLoading,
        [disruptionId]: true,
    },
    diversionsError: {
        ...state.diversionsError,
        [disruptionId]: null,
    },
});

const handleFetchDiversionsSuccess = (state, { payload: { disruptionId, diversions } }) => ({
    ...state,
    diversionsData: {
        ...state.diversionsData,
        [disruptionId]: diversions,
    },
    diversionsLoading: {
        ...state.diversionsLoading,
        [disruptionId]: false,
    },
    diversionsError: {
        ...state.diversionsError,
        [disruptionId]: null,
    },
});

const handleFetchDiversionsError = (state, { payload: { disruptionId, error } }) => ({
    ...state,
    diversionsError: {
        ...state.diversionsError,
        [disruptionId]: error,
    },
    diversionsLoading: {
        ...state.diversionsLoading,
        [disruptionId]: false,
    },
});

const handleClearDiversionsCache = (state, { payload: { disruptionId } }) => {
    const newState = { ...state };
    if (disruptionId) {
        delete newState.diversionsData[disruptionId];
        delete newState.diversionsLoading[disruptionId];
        delete newState.diversionsError[disruptionId];
    } else {
        newState.diversionsData = {};
        newState.diversionsLoading = {};
        newState.diversionsError = {};
    }
    return newState;
};

export default handleActions({
    [ACTION_TYPE.OPEN_DIVERSION_MANAGER]: handleOpenDiversionManager,
    [ACTION_TYPE.UPDATE_DIVERSION_EDIT_MODE]: handleUpdateDiversionEditMode,
    [ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE]: handleUpdateDiversionResultState,
    [ACTION_TYPE.UPDATE_DIVERSION_TO_EDIT]: handleUpdateDiversionToEdit,
    [ACTION_TYPE.FETCH_DIVERSIONS_START]: handleFetchDiversionsStart,
    [ACTION_TYPE.FETCH_DIVERSIONS_SUCCESS]: handleFetchDiversionsSuccess,
    [ACTION_TYPE.FETCH_DIVERSIONS_ERROR]: handleFetchDiversionsError,
    [ACTION_TYPE.CLEAR_DIVERSIONS_CACHE]: handleClearDiversionsCache,
}, INIT_STATE);
