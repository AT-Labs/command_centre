import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../../action-types';

export const INIT_STATE = {
    vehicleEventsAndPositions: null,
    totalEvents: 0,
    totalDisplayedEvents: 0,
    hasMoreVehicleStausAndPositions: false,
    vehicleEvents: null,
    vehiclePositions: null,
    firstEvent: null,
    vehicleViewTabStatus: false,
};

const handleVehicleEvents = (state, { payload: {
    vehicleEventsAndPositions,
    totalEvents,
    totalDisplayedEvents,
    hasMoreVehicleStausAndPositions,
} }) => ({ ...state, vehicleEventsAndPositions, totalEvents, totalDisplayedEvents, hasMoreVehicleStausAndPositions });
const handleVehicleEventsAndPositions = (state, { payload: { vehicleEvents, vehiclePositions } }) => ({ ...state, vehicleEvents, vehiclePositions });
const handleVehicleFirstReplayEvent = (state, { payload: { firstEvent } }) => ({ ...state, firstEvent });
const handleVehicleviewTabStatus = (state, { payload: { vehicleViewTabStatus } }) => ({ ...state, vehicleViewTabStatus });

export default handleActions({
    [ACTION_TYPE.FETCH_CONTROL_VEHICLE_REPLAYS]: handleVehicleEvents,
    [ACTION_TYPE.UPDATE_SPLIT_CONTROL_VEHICLE_REPLAYS_EVENTS]: handleVehicleEventsAndPositions,
    [ACTION_TYPE.CLEAR_CONTROL_VEHICLE_REPLAYS_CURRENT_REPLAY_DETAIL]: handleVehicleEventsAndPositions,
    [ACTION_TYPE.UPDATE_CONTROL_VEHICLE_FIRST_REPLAY_EVENT]: handleVehicleFirstReplayEvent,
    [ACTION_TYPE.UPDATE_VEHICLE_VIEW_TAB_STATUS]: handleVehicleviewTabStatus,
}, INIT_STATE);
