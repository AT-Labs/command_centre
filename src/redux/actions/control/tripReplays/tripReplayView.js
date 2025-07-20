import ACTION_TYPE from '../../../action-types';
import { getFleetState } from '../../../selectors/static/fleet';

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

export const updateTrips = (trips, hasMore, totalResults) => (dispatch, getState) => {
    const state = getState();
    const fleetState = getFleetState(state);

    const enrichedTrips = trips.map((trip) => {
        const { vehicleId } = trip;
        const fleetInfo = fleetState[vehicleId];
        const depotName = fleetInfo ? fleetInfo.agency?.depot?.name : null;

        return {
            ...trip,
            depotName,
        };
    });

    dispatch({
        type: ACTION_TYPE.FETCH_CONTROL_TRIP_REPLAYS_TRIPS,
        payload: {
            trips: enrichedTrips,
            hasMore,
            totalResults,
        },
    });
};

export const clearTrips = () => ({
    type: ACTION_TYPE.CLEAR_CONTROL_TRIP_REPLAYS_TRIPS,
    payload: {
        trips: null,
        hasMore: false,
        totalResults: 0,
        isSingleTripDisplayed: false,
    },
});
