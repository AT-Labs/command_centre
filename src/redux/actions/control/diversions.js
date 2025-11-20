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

export const setDiversionManagerReady = isDiversionManagerReady => ({
    type: ACTION_TYPE.SET_DIVERSION_MANAGER_READY,
    payload: {
        isDiversionManagerReady,
    },
});

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
    console.log('createDiversion action dispatched');
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
    console.log('updateDiversion action dispatched');
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
    console.log('resetDiversionResult action dispatched');
    dispatch(
        updateDiversionResultState(false, null, null),
    );
};
