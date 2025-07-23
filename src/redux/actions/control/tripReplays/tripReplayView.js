import ACTION_TYPE from '../../../action-types';

export const updateTripReplayDisplayFilters = isFiltersViewDisplayed => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_DISPLAY_FILTERS,
    payload: {
        isFiltersViewDisplayed,
    },
});

export const updateTripReplayDisplaySingleTrip = isSingleTripDisplayed => ({
    type: ACTION_TYPE.DISPLAY_CONTROL_TRIP_REPLAYS_SINGLE_TRIP,
    payload: {
        isSingleTripDisplayed,
    },
});

export const updateTripReplayRedirected = isRedirected => ({
    type: ACTION_TYPE.REDIRECT_CONTROL_TRIP_REPLAYS,
    payload: {
        isRedirected,
    },
});

export const updateTrips = (trips, hasMore, totalResults) => ({
    type: ACTION_TYPE.FETCH_CONTROL_TRIP_REPLAYS_TRIPS,
    payload: {
        trips,
        hasMore,
        totalResults,
    },
});

export const clearTrips = () => ({
    type: ACTION_TYPE.CLEAR_CONTROL_TRIP_REPLAYS_TRIPS,
    payload: {
        trips: null,
        hasMore: false,
        totalResults: 0,
        isSingleTripDisplayed: false,
    },
});
