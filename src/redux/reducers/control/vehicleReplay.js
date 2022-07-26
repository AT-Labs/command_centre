import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    trips: null,
    totalStatus: 0,
};

const handleVehicleReplay = (state, { payload }) => ({ ...state, ...payload });

export default handleActions({
    [ACTION_TYPE.FETCH_CONTROL_VEHICLE_REPLAYS]: handleVehicleReplay,
}, INIT_STATE);
