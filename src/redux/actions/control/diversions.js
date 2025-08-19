import ACTION_TYPE from '../../action-types';
import { getDiversion, addDiversion, updateDiversion as updateDiversionAPI } from '../../../utils/transmitters/disruption-mgt-api';

export const openDiversionManager = isDiversionManagerOpen => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.OPEN_DIVERSION_MANAGER,
        payload: {
            isDiversionManagerOpen,
        },
    });
};

export const updateDiversionMode = editMode => ({
    type: ACTION_TYPE.UPDATE_DIVERSION_EDIT_MODE,
    payload: {
        diversionEditMode: editMode,
    },
});

export const updateDiversionToEdit = diversion => ({
    type: ACTION_TYPE.UPDATE_DIVERSION_TO_EDIT,
    payload: {
        diversion,
    },
});

export const updateDiversionResultState = (isLoading, diversionId, error) => ({
    type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
    payload: {
        isLoading,
        diversionId,
        error,
    },
});

// Centralized diversions data actions
export const fetchDiversionsStart = disruptionId => ({
    type: ACTION_TYPE.FETCH_DIVERSIONS_START,
    payload: { disruptionId },
});

export const fetchDiversionsSuccess = (disruptionId, diversions) => ({
    type: ACTION_TYPE.FETCH_DIVERSIONS_SUCCESS,
    payload: { disruptionId, diversions },
});

export const fetchDiversionsError = (disruptionId, error) => ({
    type: ACTION_TYPE.FETCH_DIVERSIONS_ERROR,
    payload: { disruptionId, error },
});

export const clearDiversionsCache = (disruptionId = null) => ({
    type: ACTION_TYPE.CLEAR_DIVERSIONS_CACHE,
    payload: { disruptionId },
});

// Thunk action for fetching diversions with centralized management
export const fetchDiversions = (disruptionId, forceRefresh = false) => async (dispatch, getState) => {
    if (!disruptionId) {
        return undefined;
    }

    const state = getState();
    const diversionsState = state.control.diversions;
    
    // Check if already loading
    if (diversionsState.diversionsLoading[disruptionId]) {
        return undefined;
    }

    // Check if we have cached data (skip if force refresh)
    if (!forceRefresh && diversionsState.diversionsData[disruptionId]) {
        return diversionsState.diversionsData[disruptionId];
    }

    dispatch(fetchDiversionsStart(disruptionId));

    try {
        const diversions = await getDiversion(disruptionId);
        dispatch(fetchDiversionsSuccess(disruptionId, diversions || []));
        return diversions || [];
    } catch (error) {
        dispatch(fetchDiversionsError(disruptionId, error.message));
        return [];
    }
};

export const createDiversion = diversion => async (dispatch) => {
    let response;
    dispatch(
        updateDiversionResultState(true, null, null),
    );

    try {
        response = await addDiversion(diversion);
        dispatch(
            updateDiversionResultState(false, response.diversionId, null),
        );
        
        // Refresh diversions data after successful creation
        if (diversion.disruptionId) {
            // Clear cache first, then fetch fresh data
            dispatch(clearDiversionsCache(diversion.disruptionId));
            dispatch(fetchDiversions(diversion.disruptionId, true));
        }
    } catch (error) {
        dispatch(updateDiversionResultState(false, null, error));
    }
};

export const updateDiversion = diversion => async (dispatch) => {
    dispatch(
        updateDiversionResultState(true, null, null),
    );

    try {
        await updateDiversionAPI(diversion);
        dispatch(
            updateDiversionResultState(false, diversion.diversionId, null),
        );
        
        // Refresh diversions data after successful update
        if (diversion.disruptionId) {
            // Clear cache first, then fetch fresh data
            dispatch(clearDiversionsCache(diversion.disruptionId));
            dispatch(fetchDiversions(diversion.disruptionId, true));
        }
    } catch (error) {
        dispatch(updateDiversionResultState(false, null, error));
    }
};

export const resetDiversionResult = () => (dispatch) => {
    dispatch(
        updateDiversionResultState(false, null, null),
    );
};

export const setSelectedRouteVariant = routeVariant => ({
    type: ACTION_TYPE.SET_SELECTED_ROUTE_VARIANT,
    payload: {
        selectedRouteVariant: routeVariant,
    },
});
