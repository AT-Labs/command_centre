/* eslint-disable camelcase */
import _ from 'lodash-es';
import VIEW_TYPE from '../../../../types/view-types';
import * as ccRealtime from '../../../../utils/transmitters/cc-realtime';
import * as ccStatic from '../../../../utils/transmitters/cc-static';
import { getNewTripId } from '../../../../utils/transmitters/gtfs-realtime';
import ACTION_TYPE from '../../../action-types';
import { getAllVehicles } from '../../../selectors/realtime/vehicles';
import { getAllRoutes } from '../../../selectors/static/routes';
import { reportError, updateDataLoading } from '../../activity';
import { updateRealTimeDetailView } from '../../navigation';
import {
    calculateScheduledAndActualTimes, clearDetail, isWithinNextHalfHour, isWithinPastHalfHour, updateViewDetailKey,
} from './common';
import { getAllocations, getVehicleAllocationByTrip, getNumberOfCarsByAllocations } from '../../../selectors/control/blocks';

export const getRoutesByStop = stop => (dispatch) => {
    const stopCode = stop.stop_code;
    const entityKey = stop.key;
    dispatch(updateDataLoading(true));
    ccStatic.getRoutesByStop(stopCode)
        .then((routes) => {
            dispatch({
                type: ACTION_TYPE.FETCH_STOP_ROUTES,
                payload: { entityKey, routes },
            });
            dispatch({
                type: ACTION_TYPE.UPDATE_STOP_VEHICLE_PREDICATE,
                payload: {
                    entityKey,
                    vehiclePredicate: vehicle => (_.indexOf(_.map(routes, 'route_id'), _.result(vehicle, 'vehicle.trip.routeId')) !== -1),
                },
            });
            dispatch(updateDataLoading(false));
        })
        .catch((error) => {
            dispatch(updateDataLoading(false));
            dispatch(reportError({ error: { routesByStop: error } }));
        });
};

export const stopSelected = stop => (dispatch) => {
    dispatch(clearDetail(true));
    dispatch(getRoutesByStop(stop));
    dispatch(updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.STOP));
    dispatch(updateViewDetailKey(stop.key));
    dispatch({
        type: ACTION_TYPE.UPDATE_SELECTED_STOP,
        payload: { stop },
    });
};

export const stopChecked = stop => (dispatch) => {
    dispatch(getRoutesByStop(stop));
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

const mapPidInformation = (movements, allVehicles, isTrainStop) => movements.map(async ({
    route_short_name,
    destinationDisplay,
    arrivalStatus,
    arrivalPlatformName,
    scheduledDepartureTime,
    expectedDepartureTime,
    trip_id,
}) => {
    const newTripId = await getNewTripId(trip_id).then(newTrip => newTrip.trips[0] && newTrip.trips[0].newId);
    const allocations = isTrainStop ? await ccRealtime.getVehiclesByTripId(trip_id) : null;
    const currentVehicle = allVehicles && Object.values(allVehicles).find(v => (v.vehicle.trip ? v.vehicle.trip.tripId === newTripId : null));
    const occupancyStatus = currentVehicle ? currentVehicle.vehicle.occupancyStatus : null;

    return {
        route: route_short_name,
        destinationDisplay,
        arrivalStatus,
        platform: arrivalPlatformName,
        scheduledTime: scheduledDepartureTime,
        dueTime: expectedDepartureTime,
        tripId: newTripId,
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
        .then(pidInformation => _.orderBy(pidInformation, 'scheduledTime'))
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
