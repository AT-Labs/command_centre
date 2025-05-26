/* eslint-disable camelcase */
import { map, indexOf, result, orderBy } from 'lodash-es';
import VIEW_TYPE from '../../../../types/view-types';
import * as ccRealtime from '../../../../utils/transmitters/cc-realtime';
import * as ccStatic from '../../../../utils/transmitters/cc-static';
import ACTION_TYPE from '../../../action-types';
import { getAllVehicles } from '../../../selectors/realtime/vehicles';
import { getAllRoutes } from '../../../selectors/static/routes';
import { reportError, updateDataLoading } from '../../activity';
import { updateRealTimeDetailView } from '../../navigation';
import {
    calculateScheduledAndActualTimes, clearDetail, isWithinNextHalfHour, isWithinPastHalfHour, updateViewDetailKey,
} from './common';
import { getAllocations, getVehicleAllocationByTrip, getNumberOfCarsByAllocations } from '../../../selectors/control/blocks';
import { useNewMonitoring, useStopBasedDisruptionSearch } from '../../../selectors/appSettings';
import * as disruptionApi from '../../../../utils/transmitters/disruption-mgt-api';

export const getRoutesByStop = stop => (dispatch, getState) => {
    const stopCode = stop.stop_code;
    const entityKey = stop.key;
    const state = getState();
    const allRoutes = getAllRoutes(state);
    dispatch(updateDataLoading(true));
    ccStatic.getRoutesByStop(stopCode)
        .then((routes) => {
            dispatch({
                type: ACTION_TYPE.FETCH_STOP_ROUTES,
                payload: { entityKey, routes: map(routes, route => ({ ...route, ...allRoutes[route.route_id] })) },
            });
            dispatch({
                type: ACTION_TYPE.UPDATE_STOP_VEHICLE_PREDICATE,
                payload: {
                    entityKey,
                    vehiclePredicate: vehicle => (indexOf(map(routes, 'route_id'), result(vehicle, 'vehicle.trip.routeId')) !== -1),
                },
            });
            dispatch(updateDataLoading(false));
        })
        .catch((error) => {
            dispatch(updateDataLoading(false));
            dispatch(reportError({ error: { routesByStop: error } }));
        });
};

export const getDisruptionsByStop = stop => async (dispatch, getState) => {
    const state = getState();
    const entityKey = stop.key;
    const useDisruptionSearch = useStopBasedDisruptionSearch(state);
    if (!useDisruptionSearch) return;
    const stopCode = stop.stop_code;
    dispatch(updateDataLoading(true));
    try {
        const filters = {
            onlyWithStops: true,
            statuses: ['in-progress', 'not-started'],
            stopCode,
        };
        disruptionApi.getDisruptionsByFilters(filters)
            .then((data) => {
                dispatch({
                    type: ACTION_TYPE.FETCH_STOP_DISRUPTIONS,
                    payload: { entityKey, disruptions: data.disruptions },
                });
            });
    } catch (error) {
        dispatch(reportError({ error: { disruptionsByStop: error } }));
    } finally {
        dispatch(updateDataLoading(false));
    }
};

export const stopSelected = stop => (dispatch) => {
    dispatch(clearDetail(true));
    dispatch(getRoutesByStop(stop));
    dispatch(getDisruptionsByStop(stop));
    dispatch(updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.STOP));
    dispatch(updateViewDetailKey(stop.key));
    dispatch({
        type: ACTION_TYPE.UPDATE_SELECTED_STOP,
        payload: { stop },
    });
};

export const stopChecked = stop => (dispatch) => {
    dispatch(getRoutesByStop(stop));
    dispatch(getDisruptionsByStop(stop));
};

export const fetchUpcomingVehicles = stopId => (dispatch, getState) => {
    const state = getState();
    const allRoutes = getAllRoutes(state);
    const vehicleAllocations = getAllocations(state);
    dispatch(updateDataLoading(true));
    const shouldUseNewMonitoring = useNewMonitoring(state);
    return ccRealtime.getUpcomingByStopId(stopId, shouldUseNewMonitoring)
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
        .then(upcomingVehicles => orderBy(upcomingVehicles, 'scheduledTime'))
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
    const shouldUseNewMonitoring = useNewMonitoring(state);
    return ccRealtime.getHistoryByStopId(stopId, shouldUseNewMonitoring)
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
        .then(pastVehicles => orderBy(pastVehicles, 'actualTime', 'desc'))
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

const mapPidInformation = (movements, allVehicles, isTrainStop) => movements.map(async ({
    route_short_name,
    destinationDisplay,
    arrivalStatus,
    arrivalPlatformName,
    scheduledDepartureTime,
    expectedDepartureTime,
    trip_id,
}) => {
    const allocations = isTrainStop ? await ccRealtime.getVehiclesByTripId(trip_id) : null;
    const currentVehicle = allVehicles && Object.values(allVehicles).find(v => (v.vehicle.trip ? v.vehicle.trip.tripId === trip_id : null));
    const occupancyStatus = currentVehicle ? currentVehicle.vehicle.occupancyStatus : null;

    return {
        route: route_short_name,
        destinationDisplay,
        arrivalStatus,
        platform: arrivalPlatformName,
        scheduledTime: scheduledDepartureTime,
        dueTime: expectedDepartureTime,
        tripId: trip_id,
        numberOfCars: allocations ? getNumberOfCarsByAllocations(allocations.response) : null,
        occupancyStatus,
    };
});

export const fetchPidInformation = (stopCode, isTrainStop) => (dispatch, getState) => {
    dispatch(updateDataLoading(true));
    const state = getState();
    const allVehicles = getAllVehicles(state);

    return ccRealtime.getDeparturesByStopCode(stopCode)
        .then((departures) => {
            dispatch({
                type: ACTION_TYPE.FETCH_STOP_PID_MESSAGES,
                payload: {
                    pidMessages: departures.response.extensions.length > 0 ? departures.response.extensions : null,
                },
            });
            const validPidMovements = departures.response.movements.filter((m) => {
                const isDropOffOnly = m.departureBoardingActivity === 'noBoarding' && m.arrivalBoardingActivity === 'alighting';
                return !isDropOffOnly;
            });
            return Promise.all(mapPidInformation(validPidMovements, allVehicles, isTrainStop));
        })
        .then(pidInformation => orderBy(pidInformation, 'scheduledTime'))
        .then((pidInformation) => {
            dispatch({
                type: ACTION_TYPE.FETCH_STOP_PID_INFORMATION,
                payload: {
                    pidInformation,
                },
            });
        })
        .finally(() => {
            dispatch(updateDataLoading(false));
        });
};
