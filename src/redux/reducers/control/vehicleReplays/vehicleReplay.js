import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../../action-types';

export const INIT_STATE = {
    vehicleEvents: null,
    totalEvents: 0,
    totalDisplayedEvents: 0,
    hasMoreVehicleStausAndPositions: false,
};

const handleVehicleEvents = (state, { payload }) => ({ ...state, ...payload });

export default handleActions({
    [ACTION_TYPE.FETCH_CONTROL_VEHICLE_REPLAYS]: handleVehicleEvents,
}, INIT_STATE);
