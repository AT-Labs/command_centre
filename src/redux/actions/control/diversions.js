import ACTION_TYPE from '../../action-types';
import * as disruptionsMgtApi from '../../../utils/transmitters/disruption-mgt-api';

export const openCreateDiversion = isCreateDiversionEnabled => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.OPEN_CREATE_DIVERSION,
        payload: {
            isCreateDiversionEnabled,
        },
    });
};

export const updateDiversionMode = editMode => ({
    type: ACTION_TYPE.UPDATE_DIVERSION_EDIT_MODE,
    payload: {
        diversionEditMode: editMode,
    },
});

export const updateDiversionToEdit = diversionToEdit => ({
    type: ACTION_TYPE.UPDATE_DIVERSION_TO_EDIT,
    payload: {
        diversionToEdit,
    },
});

export const updateDiversionCreationState = (isLoading, diversionId, error) => ({
    type: ACTION_TYPE.UPDATE_DIVERSION_CREATION_STATE,
    payload: {
        isLoading,
        diversionId,
        error,
    },
});

export const createDiversion = diversion => async (dispatch) => {
    let response;
    dispatch(
        updateDiversionCreationState(true, null, null),
    );

    try {
        response = await disruptionsMgtApi.addDiversion(diversion);
        dispatch(
            updateDiversionCreationState(false, response.diversionId, null),
        );
    } catch (error) {
        dispatch(updateDiversionCreationState(false, null, error));
    }
};

export const resetDiversionCreation = () => (dispatch) => {
    dispatch(
        updateDiversionCreationState(false, null, null),
    );
};
