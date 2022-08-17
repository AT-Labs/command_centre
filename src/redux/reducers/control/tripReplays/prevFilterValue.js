import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../../action-types';

export const INIT_STATE = {
    filterValues: null,
    trip: null,
};

const handlePrevFilterValues = (state, { payload: { filterValues } }) => ({ ...state, filterValues });
const handlePrevTripValues = (state, { payload: { trip } }) => ({ ...state, trip });

export default handleActions({
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_PREVIOUS_FILTER_VALUES]: handlePrevFilterValues,
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_PREVIOUS_TRIP_DETAIL]: handlePrevTripValues,
}, INIT_STATE);
