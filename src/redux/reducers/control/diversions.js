import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';
import EDIT_TYPE from '../../../types/edit-types';

export const INIT_STATE = {
    isDiversionManagerOpen: false,
    diversionEditMode: EDIT_TYPE.CREATE,
    diversionResultState: {
        isLoading: false,
        diversionId: null,
        error: null,
    },
    diversion: null,
    selectedRouteVariant: null,
    // Centralized diversions data
    diversionsData: {},
    diversionsLoading: {},
    diversionsError: {},
};

export default handleActions({
    [ACTION_TYPE.OPEN_DIVERSION_MANAGER]: (state, { payload: { isDiversionManagerOpen } }) => ({
        ...state,
        isDiversionManagerOpen,
    }),

    [ACTION_TYPE.UPDATE_DIVERSION_EDIT_MODE]: (state, { payload: { diversionEditMode } }) => ({
        ...state,
        diversionEditMode,
    }),

    [ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE]: (state, { payload: { isLoading, diversionId, error } }) => ({
        ...state,
        diversionResultState: {
            isLoading,
            diversionId,
            error,
        },
    }),

    [ACTION_TYPE.UPDATE_DIVERSION_TO_EDIT]: (state, { payload: { diversion } }) => ({
        ...state,
        diversion,
    }),

    [ACTION_TYPE.SET_SELECTED_ROUTE_VARIANT]: (state, { payload: { selectedRouteVariant } }) => ({
        ...state,
        selectedRouteVariant,
    }),

    [ACTION_TYPE.FETCH_DIVERSIONS_START]: (state, { payload: { disruptionId } }) => {
        const newState = {
            ...state,
            diversionsLoading: {
                ...state.diversionsLoading,
                [disruptionId]: true,
            },
            diversionsError: {
                ...state.diversionsError,
                [disruptionId]: null,
            },
        };
        return newState;
    },

    [ACTION_TYPE.FETCH_DIVERSIONS_SUCCESS]: (state, { payload: { disruptionId, diversions } }) => {
        const newState = {
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
        };
        return newState;
    },

    [ACTION_TYPE.FETCH_DIVERSIONS_ERROR]: (state, { payload: { disruptionId, error } }) => {
        const newState = {
            ...state,
            diversionsError: {
                ...state.diversionsError,
                [disruptionId]: error,
            },
            diversionsLoading: {
                ...state.diversionsLoading,
                [disruptionId]: false,
            },
        };
        return newState;
    },

    [ACTION_TYPE.CLEAR_DIVERSIONS_CACHE]: (state, { payload: { disruptionId } }) => {
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
    },
}, INIT_STATE);
