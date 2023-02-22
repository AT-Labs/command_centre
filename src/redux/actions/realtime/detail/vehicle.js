/* eslint-disable camelcase */
import { result, map, uniqBy, flatten, isInteger, orderBy } from 'lodash-es';
import VIEW_TYPE from '../../../../types/view-types';
import * as ccRealtime from '../../../../utils/transmitters/cc-realtime';
import * as ccStatic from '../../../../utils/transmitters/cc-static';
import ACTION_TYPE from '../../../action-types';
import { getCurrentVehicleTripId } from '../../../selectors/realtime/detail';
import { getAllVehicles, getVehicleTrip, getVehicleDirectionId, getVehicleRouteId } from '../../../selectors/realtime/vehicles';
import { updateDataLoading } from '../../activity';
import { updateRealTimeDetailView } from '../../navigation';
import { calculateScheduledAndActualTimes, clearDetail, isWithinNextHalfHour, isWithinPastHalfHour, updateViewDetailKey } from './common';
import { getVehicleAllocationByVehicleId, getAllocations } from '../../../selectors/control/blocks';

export const updateSelectedVehicle = vehicle => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_SELECTED_VEHICLE,
        payload: {
            vehicle,
        },
    });
};

export const updateSelectedVehiclePosition = position => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_SELECTED_VEHICLE_POSITION,
        payload: {
            position,
        },
    });
};

export const updateVehiclePredicate = (entityKey, vehiclePredicate) => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_VEHICLE_VEHICLE_PREDICATE,
        payload: { entityKey, vehiclePredicate },
    });
};

export const updateVehicleTripInfo = (entityKey, trip) => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.FETCH_TRIP,
        payload: { entityKey, trip },
    });
};

export const updateVehicleTripStops = (entityKey, stops) => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.FETCH_VEHICLE_TRIP_STOPS,
        payload: { entityKey, stops },
    });
};

export const getVehicleTripInfo = (tripId, entityKey) => (dispatch) => {
    dispatch(updateDataLoading(true));
    return ccStatic.getTripById(tripId)
        .then((trip) => {
            dispatch(updateVehicleTripInfo(entityKey, trip));
            dispatch(updateVehicleTripStops(entityKey, uniqBy(map(result(trip, 'stopTimes', []), 'stop'))));
            dispatch(updateDataLoading(false));
        });
};

const getTrackingVehicle = (selectedVehicleId, state) => {
    const allTrackingVehicles = getAllVehicles(state);
    const allVehicleAllocations = getAllocations(state);
    const matchingVehicleAllocations = getVehicleAllocationByVehicleId(selectedVehicleId, allVehicleAllocations);
    const matchingVehiclesInStore = flatten(matchingVehicleAllocations).filter(({ vehicleId, tripId, serviceDate, startTime }) => {
        const vehicleInStore = allTrackingVehicles[vehicleId];
        if (!vehicleInStore) return false;
        const vehicleTrip = getVehicleTrip(vehicleInStore);
        return vehicleTrip && vehicleTrip.tripId === tripId
            && vehicleTrip.startDate === serviceDate
            && vehicleTrip.startTime === startTime;
    });
    return (matchingVehiclesInStore.length && allTrackingVehicles[matchingVehiclesInStore[0].vehicleId])
        || allTrackingVehicles[selectedVehicleId];
};

export const vehicleSelected = selectedVehicle => (dispatch, getState) => {
    const selectedVehicleId = selectedVehicle.id;
    const trackingVehicle = getTrackingVehicle(selectedVehicleId, getState());
    dispatch(clearDetail(true));
    dispatch(updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.VEHICLE));
    dispatch(updateViewDetailKey(selectedVehicle.key));
    dispatch(updateVehiclePredicate(selectedVehicle.key, { id: selectedVehicleId }));
    if (trackingVehicle) {
        const selectedDirectionId = getVehicleDirectionId(trackingVehicle);
        const selectedRouteId = getVehicleRouteId(trackingVehicle);
        dispatch(updateSelectedVehicle(
            {
                ...selectedVehicle,
                ...trackingVehicle.vehicle,
                vehiclePredicate: (vehicle) => {
                    if (!selectedRouteId) {
                        return vehicle.id === selectedVehicleId;
                    }

                    const { directionId, routeId } = result(vehicle, 'vehicle.trip') || {};

                    return (selectedRouteId === routeId) && (isInteger(selectedDirectionId) ? selectedDirectionId === directionId : true);
                },
            },
        ));
        const selectedTripId = result(trackingVehicle, 'vehicle.trip.tripId');
        if (selectedTripId) {
            dispatch(getVehicleTripInfo(selectedTripId, selectedVehicle.key));
        }
    } else {
        dispatch(updateSelectedVehicle(selectedVehicle));
    }
};

export const vehicleChecked = ({ id, key }) => (dispatch, getState) => {
    const trackingVehicle = getTrackingVehicle(id, getState());
    const selectedTripId = result(trackingVehicle, 'vehicle.trip.tripId');
    if (selectedTripId) {
        dispatch(getVehicleTripInfo(selectedTripId, key));
    }
    dispatch(updateVehiclePredicate(key, { id }));
};

export const fetchUpcomingStops = vehicleId => (dispatch, getState) => {
    dispatch(updateDataLoading(true));
    const trackingVehicle = getTrackingVehicle(vehicleId, getState());
    return ccRealtime.getUpcomingByVehicleId(result(trackingVehicle, 'id'))
        .then(upcoming => upcoming.map(({ stop, trip }) => {
            const { stopCode, stopName, scheduleRelationship, passed } = stop;
            const { scheduledTime, actualTime } = calculateScheduledAndActualTimes(stop);
            return {
                stop: { stopCode, stopName, scheduleRelationship, passed },
                trip,
                scheduledTime,
                actualTime,
            };
        }))
        .then(stops => stops.filter(({ actualTime, scheduledTime }) => isWithinNextHalfHour(actualTime || scheduledTime)))
        .then(upcomingStops => orderBy(upcomingStops, 'scheduledTime'))
        .then(upcomingStops => dispatch({
            type: ACTION_TYPE.FETCH_VEHICLE_UPCOMING_STOPS,
            payload: {
                upcomingStops,
            },
        }))
        .finally(() => {
            dispatch(updateDataLoading(false));
        });
};

export const fetchPastStops = vehicleId => (dispatch, getState) => {
    dispatch(updateDataLoading(true));
    const trackingVehicle = getTrackingVehicle(vehicleId, getState());
    return ccRealtime.getHistoryByVehicleId(result(trackingVehicle, 'id'))
        .then((history) => {
            const vehicleTripId = getCurrentVehicleTripId(getState());
            return history.filter(({ trip }) => trip.tripId === vehicleTripId)
                .map(({ stop, trip }) => {
                    const { stopCode, stopName, stopSequence, scheduleRelationship, passed } = stop;
                    const { scheduledTime, actualTime } = calculateScheduledAndActualTimes(stop);
                    return {
                        stop: { stopCode, stopSequence, stopName, scheduleRelationship, passed },
                        trip,
                        scheduledTime,
                        actualTime,
                    };
                });
        })
        .then(stops => stops.filter(({ actualTime, scheduledTime }) => isWithinPastHalfHour(actualTime || scheduledTime)))
        .then(pastVehicles => orderBy(pastVehicles, 'stop.stopSequence', 'asc'))
        .then((pastStops) => {
            dispatch({
                type: ACTION_TYPE.FETCH_VEHICLE_PAST_STOPS,
                payload: {
                    pastStops,
                },
            });
        })
        .finally(() => {
            dispatch(updateDataLoading(false));
        });
};
