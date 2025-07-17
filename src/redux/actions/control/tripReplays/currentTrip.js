import moment from 'moment';
import { get, find } from 'lodash-es';
import * as tripReplayApi from '../../../../utils/transmitters/trip-replay-api';
import ACTION_TYPE from '../../../action-types';
import ERROR_TYPE from '../../../../types/error-types';
import { setBannerError } from '../../activity';
import { updateTripReplayDisplaySingleTrip } from './tripReplayView';
import { updatePrevTripValue } from './prevFilterValue';
import { getAllRoutes } from '../../../selectors/static/routes';
import { vehicleReplayEvents } from '../vehicleReplays/vehicleReplay';
import { useTripHistory, tripHistoryEnabledFromDate } from '../../../selectors/appSettings';
import { getTripReplayTrips } from '../../../selectors/control/tripReplays/tripReplayView';

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
    const state = getState();
    dispatch(vehicleReplayEvents(null, null, 0, false));
    dispatch(updatePrevTripValue(trip));
    dispatch(updateLoadingTripReplayState(true));
    // update current trip detail with the existing information passed from list
    dispatch(updateTripReplayCurrentTripDetail(trip));

    if (useTripHistory(state)
        && (!tripHistoryEnabledFromDate(state) || moment(trip.serviceDate) >= moment(tripHistoryEnabledFromDate(state)))
    ) {
        const tripDetail = getTripReplayTrips(state).find(tripReplayTrip => tripReplayTrip.id === trip.id);
        const allRoutes = getAllRoutes(state);
        const routeColor = get(find(allRoutes, { route_short_name: get(tripDetail, 'routeShortName') }), 'route_color');
        const tripDetailWithRouteColor = { ...tripDetail, route: { ...tripDetail.route, routeColor } };
        dispatch(updateTripReplayCurrentTripDetail(tripDetailWithRouteColor));
        dispatch(updateTripReplayDisplaySingleTrip(true));
        dispatch(updateLoadingTripReplayState(false));
        return;
    }

    tripReplayApi.getTripById(trip.id)
        .then((tripDetail) => {
            const allRoutes = getAllRoutes(state);
            const routeColor = get(find(allRoutes, { route_short_name: get(tripDetail, 'routeShortName') }), 'route_color');
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
