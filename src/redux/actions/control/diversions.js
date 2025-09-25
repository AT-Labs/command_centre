import ACTION_TYPE from '../../action-types';
import * as disruptionsMgtApi from '../../../utils/transmitters/disruption-mgt-api';

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

export const createDiversion = diversion => async (dispatch) => {
    let response;
    dispatch(
        updateDiversionResultState(true, null, null),
    );

    try {
        response = await disruptionsMgtApi.addDiversion(diversion);
        dispatch(
            updateDiversionResultState(false, response.diversionId, null),
        );
    } catch (error) {
        dispatch(updateDiversionResultState(false, null, error));
    }
};

export const updateDiversion = diversion => async (dispatch) => {
    dispatch(
        updateDiversionResultState(true, null, null),
    );

    try {
        await disruptionsMgtApi.updateDiversion(diversion);
        dispatch(
            updateDiversionResultState(false, diversion.diversionId, null),
        );
    } catch (error) {
        dispatch(updateDiversionResultState(false, null, error));
    }
};

export const resetDiversionResult = () => (dispatch) => {
    dispatch(
        updateDiversionResultState(false, null, null),
    );
};

export const clearDiversionsCache = (disruptionId = null) => ({
    type: ACTION_TYPE.CLEAR_DIVERSIONS_CACHE,
    payload: { disruptionId },
});

export const fetchDiversions = (disruptionId, forceRefresh = false) => async (dispatch, getState) => {
    if (!disruptionId) {
        return undefined;
    }

    const state = getState();
    const diversionsState = state.control.diversions;

    if (diversionsState.diversionsLoading[disruptionId]) {
        return undefined;
    }

    if (!forceRefresh && diversionsState.diversionsData[disruptionId]) {
        return diversionsState.diversionsData[disruptionId];
    }

    dispatch({
        type: ACTION_TYPE.FETCH_DIVERSIONS_START,
        payload: { disruptionId },
    });

    try {
        let diversions = await disruptionsMgtApi.getDiversion(disruptionId);

        if ((!diversions || diversions.length === 0) && disruptionId && disruptionId.toString().length > 5) {
            const disruptionsState = state.control?.incidents?.disruptions || [];
            const disruption = disruptionsState.find(d => d.disruptionId === disruptionId);
            if (disruption?.incidentId && disruption.incidentId !== disruptionId) {
                diversions = await disruptionsMgtApi.getDiversion(disruption.incidentId);
            }
        }

        dispatch({
            type: ACTION_TYPE.FETCH_DIVERSIONS_SUCCESS,
            payload: { disruptionId, diversions: diversions || [] },
        });
        return diversions || [];
    } catch (error) {
        dispatch({
            type: ACTION_TYPE.FETCH_DIVERSIONS_ERROR,
            payload: { disruptionId, error: error.message },
        });
        return [];
    }
};
