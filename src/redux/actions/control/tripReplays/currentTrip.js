import { get, find } from 'lodash-es';
import * as tripReplayApi from '../../../../utils/transmitters/trip-replay-api';
import ACTION_TYPE from '../../../action-types';
import ERROR_TYPE from '../../../../types/error-types';
import { setBannerError } from '../../activity';
import { updateTripReplayDisplaySingleTrip } from './tripReplayView';
import { getAllRoutes } from '../../../selectors/static/routes';

const updateTripReplayCurrentTripDetail = detail => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_CURRENT_TRIP_DETAIL,
    payload: {
        detail,
    },
});

const updateLoadingTripReplayState = isLoading => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_LOADING,
    payload: {
        isLoading,
    },
});

export const clearCurrentTrip = () => ({
    type: ACTION_TYPE.CLEAR_CONTROL_TRIP_REPLAY_CURRENT_TRIP,
    payload: {
        isLoading: false,
    },
});

export const selectTrip = trip => (dispatch, getState) => {
    dispatch(updateLoadingTripReplayState(true));
    // update current trip detail with the existing information passed from list
    dispatch(updateTripReplayCurrentTripDetail(trip));
    return tripReplayApi.getTripById(trip.id)
        .then((tripDetail) => {
            const allRoutes = getAllRoutes(getState());
            const routeColor = get(find(allRoutes, { route_short_name: get(tripDetail, 'route.shortName') }), 'route_color');
            const tripDetailWithRouteColor = { ...tripDetail, route: { ...tripDetail.route, routeColor } };
            // enrich current trip detail with data fetched from backend
            dispatch(updateTripReplayCurrentTripDetail(tripDetailWithRouteColor));
            dispatch(updateTripReplayDisplaySingleTrip(true));
        })
        .catch((error) => {
            if (ERROR_TYPE.fetchTripReplayEnabled) {
                const errorMessage = error.code === 500 ? ERROR_TYPE.fetchTripReplayMessage : error.message;
                dispatch(setBannerError(errorMessage));
                dispatch(updateTripReplayDisplaySingleTrip(false));
            }
        }).finally(() => {
            dispatch(updateLoadingTripReplayState(false));
        });
};
