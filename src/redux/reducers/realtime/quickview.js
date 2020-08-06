import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    tripUpdate: {},
};

const handleGetTripSnapshot = (state, { payload: { tripUpdate } }) => ({ ...state, tripUpdate });

export default handleActions({
    [ACTION_TYPE.FETCH_TRIP_UPDATE_SNAPSHOT]: handleGetTripSnapshot,
}, INIT_STATE);
