import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';
import EDIT_TYPE from '../../../types/edit-types';

export const INIT_STATE = {
    diversionCreationState: {
        isLoading: false,
        diversionId: null,
        error: null,
    },
    diversionEditingState: {
        isLoading: false,
        diversion: null,
        error: null,
    },
    editingMode: EDIT_TYPE.CREATE,
};
const handleUpdateDiversionCreationState = (state, { payload: { isLoading, diversionId, error } }) => ({
    ...state,
    diversionCreationState: {
        isLoading,
        diversionId,
        error,
    },
});

const handleDiversionToEdit = (state, { payload: { diversionToEdit } }) => ({
    ...state,
    diversionEditingState: {
        isLoading: false,
        diversion: diversionToEdit,
        error: null,
    },
});

const handleUpdateDiversionEditMode = (state, { payload: { editingMode } }) => ({
    ...state,
    editingMode,
});

export default handleActions({
    [ACTION_TYPE.UPDATE_DIVERSION_EDIT_MODE]: handleUpdateDiversionEditMode,
    [ACTION_TYPE.UPDATE_DIVERSION_CREATION_STATE]: handleUpdateDiversionCreationState,
    [ACTION_TYPE.UPDATE_DIVERSION_TO_EDIT]: handleDiversionToEdit,
}, INIT_STATE);
