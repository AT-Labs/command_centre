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
};

export default handleActions({
    [ACTION_TYPE.OPEN_DIVERSION_MANAGER]: (state, { payload: { isDiversionManagerOpen } }) => {
        console.log('🔧 diversions reducer - OPEN_DIVERSION_MANAGER called with:', isDiversionManagerOpen);
        console.log('🔧 diversions reducer - previous state:', state);
        const newState = {
            ...state,
            isDiversionManagerOpen,
        };
        console.log('🔧 diversions reducer - new state:', newState);
        return newState;
    },

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
}, INIT_STATE);
