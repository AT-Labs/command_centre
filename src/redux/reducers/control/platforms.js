import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    all: {},
};

const handlePlatformsUpdate = (state, { payload: { platforms } }) => ({ ...state, all: platforms });

export default handleActions({
    [ACTION_TYPE.UPDATE_PLATFORMS]: handlePlatformsUpdate,
}, INIT_STATE);
