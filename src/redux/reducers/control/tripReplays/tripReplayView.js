import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../../action-types';

export const INIT_STATE = {
    permissions: [],
    isFiltersViewDisplayed: true,
    isSingleTripDisplayed: false,
    isRedirected: false,
    trips: null,
    hasMore: false,
    totalResults: 0,
};

const handleTripReplayDisplayFiltersUpdate = (state, { payload: { isFiltersViewDisplayed } }) => ({ ...state, isFiltersViewDisplayed });
const handleTripReplaySingleTripDisplay = (state, { payload: { isSingleTripDisplayed } }) => ({ ...state, isSingleTripDisplayed });
const handleTripReplaySingleTripRedirect = (state, { payload: { isRedirected } }) => ({ ...state, isRedirected });
const handleTripReplayTrips = (state, { payload }) => ({ ...state, ...payload });
const handleTripReplayClearTrips = (state, { payload }) => ({ ...state, ...payload });

export default handleActions({
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_DISPLAY_FILTERS]: handleTripReplayDisplayFiltersUpdate,
    [ACTION_TYPE.REDIRECT_CONTROL_TRIP_REPLAYS]: handleTripReplaySingleTripRedirect,
    [ACTION_TYPE.FETCH_CONTROL_TRIP_REPLAYS_TRIPS]: handleTripReplayTrips,
    [ACTION_TYPE.CLEAR_CONTROL_TRIP_REPLAYS_TRIPS]: handleTripReplayClearTrips,
    [ACTION_TYPE.DISPLAY_CONTROL_TRIP_REPLAYS_SINGLE_TRIP]: handleTripReplaySingleTripDisplay,
}, INIT_STATE);
