import { handleActions } from 'redux-actions';
import { TIME_TYPE } from '../../../../constants/tripReplays';
import ACTION_TYPE from '../../../action-types';

const SEARCH_TERM_INIT_STATE = {
    id: '',
    label: '',
    type: '',
};

export const INIT_STATE = {
    searchTerm: SEARCH_TERM_INIT_STATE,
    searchDate: undefined,
    startTime: '',
    endTime: '',
    timeType: TIME_TYPE.Scheduled,
};

const handleTripReplaySearchTermUpdate = (state, { payload: { searchTerm } }) => ({ ...state, searchTerm });
const handleTripReplaySearchTermReset = state => ({ ...state, searchTerm: SEARCH_TERM_INIT_STATE });
const handleTripReplaySearchDateUpdate = (state, { payload: { searchDate } }) => ({ ...state, searchDate });
const handleTripReplayStartTimeUpdate = (state, { payload: { startTime } }) => ({ ...state, startTime });
const handleTripReplayEndTimeUpdate = (state, { payload: { endTime } }) => ({ ...state, endTime });
const handleTripReplayTimeTypeUpdate = (state, { payload: { timeType } }) => ({ ...state, timeType });
const handleTripReplayClearDate = (state, { payload }) => ({ ...state, ...payload });

export default handleActions({
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_SEARCH_TERM]: handleTripReplaySearchTermUpdate,
    [ACTION_TYPE.RESET_CONTROL_TRIP_REPLAYS_SEARCH_TERM]: handleTripReplaySearchTermReset,
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_SEARCH_DATE]: handleTripReplaySearchDateUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_START_TIME]: handleTripReplayStartTimeUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_END_TIME]: handleTripReplayEndTimeUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_TIME_TYPE]: handleTripReplayTimeTypeUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_CLEAR_DATE]: handleTripReplayClearDate,
}, INIT_STATE);
