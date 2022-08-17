import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../../action-types';

export const INIT_STATE = {
    events: null,
    firstEvent: null,
};

const handleVehicleReplayEvents = (state, { payload: { events } }) => ({ ...state, events });
const handleVehicleFirstReplayEvent = (state, { payload: { firstEvent } }) => ({ ...state, firstEvent });
const handleClearVehicleReplayCurrentReplayDetail = (_state, { payload }) => ({ ...payload });

export default handleActions({
    [ACTION_TYPE.UPDATE_CONTROL_VEHICLE_REPLAYS_EVENTS]: handleVehicleReplayEvents,
    [ACTION_TYPE.UPDATE_CONTROL_VEHICLE_FIRST_REPLAY_EVENT]: handleVehicleFirstReplayEvent,
    [ACTION_TYPE.CLEAR_CONTROL_VEHICLE_REPLAYS_CURRENT_REPLAY_DETAIL]: handleClearVehicleReplayCurrentReplayDetail,
}, INIT_STATE);
