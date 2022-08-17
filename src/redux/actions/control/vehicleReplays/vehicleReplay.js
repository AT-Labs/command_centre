import ACTION_TYPE from '../../../action-types';
import ERROR_TYPE from '../../../../types/error-types';
import * as VEHICLE_REPLAY_API from '../../../../utils/transmitters/vehicle-replay-api';
import { getTripReplayFilters } from '../../../selectors/control/tripReplays/filters';
import { setBannerError } from '../../activity';

const vechicleReplays = (trips, totalStatus) => ({
    type: ACTION_TYPE.FETCH_CONTROL_VEHICLE_REPLAYS,
    payload: {
        trips,
        totalStatus,
    },
});

export const searchVehicleReplay = () => (dispatch, getState) => {
    const filters = getTripReplayFilters(getState());
    let totalStatus = 0;
    return VEHICLE_REPLAY_API.getVehicleReplay(filters)
        .then((response) => {
            if (response.length === 0) {
                dispatch(vechicleReplays({}, totalStatus));
            } else {
                response[0].trip.forEach((element) => {
                    totalStatus += element.event.length;
                });
                const tripIdNull = response[0].trip.map(object => object.id).indexOf(null);
                if (tripIdNull !== -1) {
                    const data = response[0].trip[tripIdNull];
                    response[0].trip.splice(tripIdNull, 1);
                    response[0].trip.push(data);
                    dispatch(vechicleReplays(response[0], totalStatus));
                } else {
                    dispatch(vechicleReplays(response[0], totalStatus));
                }
            }
        })
        .catch(() => {
            if (ERROR_TYPE.fetchVehicleReplayMessage) {
                const errorMessage = ERROR_TYPE.fetchVehicleReplayMessage;
                dispatch(setBannerError(errorMessage));
            }
        });
};
