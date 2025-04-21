import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    diversionCreationState: {
        isLoading: false,
        diversionId: null,
        error: null,
    },
};
const handleUpdateDiversionCreationState = (state, { payload: { isLoading, diversionId, error } }) => ({
    ...state,
    diversionCreationState: {
        isLoading,
        diversionId,
        error,
    },
});

export default handleActions({
    [ACTION_TYPE.UPDATE_DIVERSION_CREATION_STATE]: handleUpdateDiversionCreationState,
}, INIT_STATE);
