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

const handleOpenDiversionManager = (state, { payload: { isDiversionManagerOpen } }) => ({ ...state, isDiversionManagerOpen });

export default handleActions({
    [ACTION_TYPE.OPEN_DIVERSION_MANAGER]: handleOpenDiversionManager,
    [ACTION_TYPE.UPDATE_DIVERSION_EDIT_MODE]: handleUpdateDiversionEditMode,
    [ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE]: handleUpdateDiversionResultState,
    [ACTION_TYPE.UPDATE_DIVERSION_TO_EDIT]: handleUpdateDiversionToEdit,
}, INIT_STATE);
