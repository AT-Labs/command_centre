import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../../action-types';

export const INIT_STATE = {
    isLoading: false,
};

const handleLoadingTripReplayUpdate = (state, { payload: { isLoading } }) => ({ ...state, isLoading });
const handleClearCurrentTrip = (state, { payload }) => ({ ...payload });
const handleTripReplayCurrentTripDetail = (state, { payload: { detail } }) => ({ ...state, ...detail });

export default handleActions({
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_LOADING]: handleLoadingTripReplayUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_CURRENT_TRIP_DETAIL]: handleTripReplayCurrentTripDetail,
    [ACTION_TYPE.CLEAR_CONTROL_TRIP_REPLAY_CURRENT_TRIP]: handleClearCurrentTrip,
}, INIT_STATE);
