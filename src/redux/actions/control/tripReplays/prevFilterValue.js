import ACTION_TYPE from '../../../action-types';
import { updateTripReplayDisplaySingleTrip, updateTripReplayRedirected, updateTripReplayDisplayFilters } from './tripReplayView';
import { updateTripReplaySearchTerm, handleSearchDateChange, search } from './filters';
import { getVehicleReplayStatusAndPosition } from '../vehicleReplays/vehicleReplay';
import { getFleetByVehicleId } from '../../../selectors/control/tripReplays/currentTrip';
import { getTripReplayFilters } from '../../../selectors/control/tripReplays/filters';

export const updatePrevFilterValue = filterValues => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_PREVIOUS_FILTER_VALUES,
    payload: {
        filterValues,
    },
});

export const updatePrevTripValue = trip => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_PREVIOUS_TRIP_DETAIL,
    payload: {
        trip,
    },
});

// create a function to retain the previous values
const retainPrevFilterValue = () => (dispatch, getState) => {
    const filters = getTripReplayFilters(getState());
    dispatch(updatePrevFilterValue(filters));
};

export const navigateToVehicleTab = summary => (dispatch, getState) => {
    dispatch(retainPrevFilterValue());
    dispatch(updateTripReplayRedirected(true));
    dispatch(updateTripReplayDisplaySingleTrip(false));
    const vehicleFleet = getFleetByVehicleId(getState());
    const searchTermObj = {
        type: vehicleFleet.type.type.toLowerCase(),
        id: summary.vehicleId,
        label: summary.vehicleLabel,
    };
    dispatch(updateTripReplaySearchTerm(searchTermObj));
    dispatch(handleSearchDateChange(summary.serviceDate));
    dispatch(search());
    dispatch(getVehicleReplayStatusAndPosition());
    dispatch(updateTripReplayDisplayFilters(false));
};
