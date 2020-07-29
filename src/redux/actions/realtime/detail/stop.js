/* eslint-disable camelcase */
import _ from 'lodash-es';
import VIEW_TYPE from '../../../../types/view-types';
import * as ccRealtime from '../../../../utils/transmitters/cc-realtime';
import * as ccStatic from '../../../../utils/transmitters/cc-static';
import ACTION_TYPE from '../../../action-types';
import { getAllRoutes } from '../../../selectors/static/routes';
import { reportError, updateDataLoading } from '../../activity';
import { updateVisibleStops } from '../../static/stops';
import { mergeVehicleFilters } from '../vehicles';
import { updateRealTimeDetailView } from '../../navigation';
import {
    calculateScheduledAndActualTimes, clearDetail, isWithinNextHalfHour, isWithinPastHalfHour,
} from './common';
import { updateSearchTerms } from '../../search';
import { getStopSearchTerms } from '../../../selectors/static/stops';
import { getAllocations, getVehicleAllocationByTrip } from '../../../selectors/control/blocks';

export const getRoutesByStop = stopCode => (dispatch) => {
    dispatch(updateDataLoading(true));
    ccStatic.getRoutesByStop(stopCode)
        .then((routes) => {
            dispatch(mergeVehicleFilters(
                { predicate: vehicle => (_.indexOf(_.map(routes, 'route_id'), _.result(vehicle, 'vehicle.trip.routeId')) !== -1) },
            ));
            dispatch({
                type: ACTION_TYPE.FETCH_STOP_ROUTES,
                payload: { routes },
            });
            dispatch(updateDataLoading(false));
        })
        .catch((error) => {
            dispatch(updateDataLoading(false));
            dispatch(reportError({ error: { routesByStop: error } }));
        });
};

export const stopSelected = stop => (dispatch) => {
    dispatch(clearDetail());
    dispatch(getRoutesByStop(stop.stop_code));
    dispatch(updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.STOP));
    dispatch(updateVisibleStops([stop]));
    dispatch({
        type: ACTION_TYPE.UPDATE_SELECTED_STOP,
        payload: {
            stop,
        },
    });
    dispatch(updateSearchTerms(getStopSearchTerms(stop)));
};

export const fetchUpcomingVehicles = stopId => (dispatch, getState) => {
    const state = getState();
    const allRoutes = getAllRoutes(state);
    const vehicleAllocations = getAllocations(state);
    dispatch(updateDataLoading(true));
    return ccRealtime.getUpcomingByStopId(stopId)
        .then(upcoming => upcoming.filter(({ stop }) => !!stop.departure)
            .map(({ vehicle, trip, stop }) => {
                const { scheduledTime, actualTime } = calculateScheduledAndActualTimes(stop);
                return {
                    trip,
                    vehicle,
                    allocation: getVehicleAllocationByTrip(trip, vehicleAllocations),
                    stop,
                    route: allRoutes[trip.routeId],
                    scheduledTime,
                    actualTime,
                    scheduleRelationship: stop.scheduleRelationship,
                };
            }))
        .then(vehicles => vehicles.filter(({ actualTime, scheduledTime }) => isWithinNextHalfHour(actualTime || scheduledTime)))
        .then(upcomingVehicles => _.orderBy(upcomingVehicles, 'scheduledTime'))
        .then(upcomingVehicles => dispatch({
            type: ACTION_TYPE.FETCH_STOP_UPCOMING_VEHICLES,
            payload: {
                upcomingVehicles,
            },
        }))
        .finally(() => {
            dispatch(updateDataLoading(false));
        });
};


export const fetchPastVehicles = stopId => (dispatch, getState) => {
    const state = getState();
    const allRoutes = getAllRoutes(state);
    const vehicleAllocations = getAllocations(state);
    dispatch(updateDataLoading(true));
    return ccRealtime.getHistoryByStopId(stopId)
        .then(history => history.map(({ vehicle, trip, stop }) => {
            const { scheduledTime, actualTime } = calculateScheduledAndActualTimes(stop);
            return {
                trip,
                vehicle,
                allocation: getVehicleAllocationByTrip(trip, vehicleAllocations),
                stop,
                route: allRoutes[trip.routeId],
                scheduledTime,
                actualTime,
            };
        }))
        .then(vehicles => vehicles.filter(({ actualTime, scheduledTime }) => isWithinPastHalfHour(actualTime || scheduledTime)))
        .then(pastVehicles => _.orderBy(pastVehicles, 'actualTime', 'desc'))
        .then((pastVehicles) => {
            dispatch({
                type: ACTION_TYPE.FETCH_STOP_PAST_VEHICLES,
                payload: {
                    pastVehicles,
                },
            });
        })
        .finally(() => {
            dispatch(updateDataLoading(false));
        });
};
