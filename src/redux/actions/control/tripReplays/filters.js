import moment from 'moment';
import ACTION_TYPE from '../../../action-types';
import * as TRIP_REPLAY_API from '../../../../utils/transmitters/trip-replay-api';
import ERROR_TYPE from '../../../../types/error-types';
import { setBannerError } from '../../activity';
import { updateTripReplayDisplayFilters, updateTrips } from './tripReplayView';
import { getTripReplayFilters } from '../../../selectors/control/tripReplays/filters';
import { getTripReplayRedirected } from '../../../selectors/control/tripReplays/tripReplayView';
import { getPreviousTripReplayFilterValues } from '../../../selectors/control/tripReplays/prevFilterValue';
import { useTripHistory, tripHistoryEnabledFromDate } from '../../../selectors/appSettings';

export const updateTripReplayFilterData = filterData => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_FILTER_DATA,
    payload: { ...filterData },
});

export const updateTripReplaySearchTerm = searchTerm => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_SEARCH_TERM,
    payload: {
        searchTerm,
    },
});

export const resetTripReplaySearchTerm = () => ({
    type: ACTION_TYPE.RESET_CONTROL_TRIP_REPLAYS_SEARCH_TERM,
});

export const updateTripReplaySearchDate = searchDate => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_SEARCH_DATE,
    payload: {
        searchDate,
    },
});

export const updateTripReplayStartTime = startTime => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_START_TIME,
    payload: {
        startTime,
    },
});

export const updateTripReplayEndTime = endTime => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_END_TIME,
    payload: {
        endTime,
    },
});

export const clearDate = () => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_CLEAR_DATE,
    payload: {
        searchDate: '',
        startTime: '',
        endTime: '',
    },
});

export const updateTripReplayTimeType = timeType => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_TIME_TYPE,
    payload: {
        timeType,
    },
});

export const handleSearchDateChange = searchDate => (dispatch) => {
    if (searchDate) {
        dispatch(updateTripReplaySearchDate(moment(searchDate).format('YYYY-MM-DD')));
    } else {
        dispatch(clearDate());
    }
};

export const search = () => (dispatch, getState) => {
    const state = getState();
    let filters;
    dispatch(updateTripReplayDisplayFilters(false));
    if (getTripReplayRedirected(state)) {
        filters = getPreviousTripReplayFilterValues(state);
    } else {
        filters = getTripReplayFilters(state);
    }

    let getTripsHistory = TRIP_REPLAY_API.getTripReplayTrips;
    if (useTripHistory(state)
        && (!tripHistoryEnabledFromDate(state) || moment(filters.searchDate) >= moment(tripHistoryEnabledFromDate(state)))
    ) {
        getTripsHistory = TRIP_REPLAY_API.getTripsHistory;
    }

    return getTripsHistory(filters)
        .then((response) => {
            const { trips, hasMore, totalResults } = response;
            dispatch(updateTrips(trips, hasMore, totalResults));
        })
        .catch(() => {
            if (ERROR_TYPE.fetchTripReplayEnabled) {
                const errorMessage = ERROR_TYPE.fetchTripReplayMessage;
                dispatch(setBannerError(errorMessage));
            }
        });
};
