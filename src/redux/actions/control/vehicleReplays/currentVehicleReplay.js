import ACTION_TYPE from '../../../action-types';
import ERROR_TYPE from '../../../../types/error-types';
import * as VEHICLE_REPLAY_API from '../../../../utils/transmitters/vehicle-replay-api';
import { getTripReplayFilters } from '../../../selectors/control/tripReplays/filters';
import { setBannerError } from '../../activity';

export const clearVehicleReplayCurrentReplayDetail = () => ({
    type: ACTION_TYPE.CLEAR_CONTROL_VEHICLE_REPLAYS_CURRENT_REPLAY_DETAIL,
    payload: {
        events: null,
    },
});

const updateVehicleReplayevents = events => ({
    type: ACTION_TYPE.UPDATE_CONTROL_VEHICLE_REPLAYS_EVENTS,
    payload: {
        events,
    },
});

const updateVehicleReplayFirstEvents = firstEvent => ({
    type: ACTION_TYPE.UPDATE_CONTROL_VEHICLE_FIRST_REPLAY_EVENT,
    payload: {
        firstEvent,
    },
});

export const getAllVehicleReplayEvents = () => (dispatch, getState) => {
    const filters = getTripReplayFilters(getState());
    return VEHICLE_REPLAY_API.getVehicleReplay(filters)
        .then((response) => {
            if (response.length === 0) {
                return;
            }
            const trips = response[0].trip;
            const events = [];
            trips.forEach((trip) => {
                const eventWithTripId = trip.event.map(vehicleEvent => ({ ...vehicleEvent, tripId: trip.id }));
                events.push(...eventWithTripId);
            });
            const firstEvent = [];
            events.forEach((element) => {
                if (element.tripId !== null) {
                    firstEvent.push(element);
                }
            });
            const firstEventWithLocation = firstEvent.filter(event => event.position.latitude !== null);
            dispatch(updateVehicleReplayevents(events));
            dispatch(updateVehicleReplayFirstEvents(firstEventWithLocation[0]));
        })
        .catch(() => {
            if (ERROR_TYPE.fetchVehicleReplayMessage) {
                const errorMessage = ERROR_TYPE.fetchVehicleReplayMessage;
                dispatch(setBannerError(errorMessage));
            }
        });
};
