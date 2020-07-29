import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    shouldMapBeRecentered: false,
};

const handleResetMap = (state, { payload: { shouldMapBeRecentered } }) => ({ ...state, shouldMapBeRecentered });

export default handleActions({
    [ACTION_TYPE.RECENTER_MAP]: handleResetMap,

}, INIT_STATE);
