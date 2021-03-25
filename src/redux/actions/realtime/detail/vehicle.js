/* eslint-disable camelcase */
import _ from 'lodash-es';
import VIEW_TYPE from '../../../../types/view-types';
import * as ccRealtime from '../../../../utils/transmitters/cc-realtime';
import * as ccStatic from '../../../../utils/transmitters/cc-static';
import ACTION_TYPE from '../../../action-types';
import { getTripStops, getVehicleTripId } from '../../../selectors/realtime/detail';
import { getAllVehicles, getVehicleRouteId, getVehicleDirectionId, getVehicleTrip } from '../../../selectors/realtime/vehicles';
import { updateDataLoading } from '../../activity';
import { updateRealTimeDetailView } from '../../navigation';
import { updateVisibleStops } from '../../static/stops';
import { mergeVehicleFilters } from '../vehicles';
import { calculateScheduledAndActualTimes, clearDetail, isWithinNextHalfHour, isWithinPastHalfHour } from './common';
import { getVehicleAllocationByVehicleId, getAllocations } from '../../../selectors/control/blocks';

export const getTrip = tripId => (dispatch, getState) => {
    dispatch(updateDataLoading(true));
    return ccStatic.getTripById(tripId)
        .then((trip) => {
            dispatch({
                type: ACTION_TYPE.FETCH_TRIP,
                payload: { trip },
            });
            dispatch(updateVisibleStops(getTripStops(getState())));
            dispatch(updateDataLoading(false));
        });
};

const getTrackingVehicle = (selectedVehicleId, allVehicleAllocations, allTrackingVehicles) => {
    const matchingVehicleAllocations = getVehicleAllocationByVehicleId(selectedVehicleId, allVehicleAllocations);

    const matchingVehiclesInStore = _.flatten(matchingVehicleAllocations).filter(({ vehicleId, tripId, serviceDate, startTime }) => {
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
    const state = getState();
    const allVehicles = getAllVehicles(state);
    const allVehicleAllocations = getAllocations(state);
    const trackingVehicle = getTrackingVehicle(selectedVehicleId, allVehicleAllocations, allVehicles);
    dispatch(clearDetail(true));
    dispatch(updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.VEHICLE));

    if (!trackingVehicle) {
        // Could not find a vehicle in the vehicle positions store
        const vehicle = { id: selectedVehicleId };

        dispatch({
            type: ACTION_TYPE.UPDATE_SELECTED_VEHICLE,
            payload: { vehicle },
        });

        dispatch(mergeVehicleFilters({
            predicate: vehicle,
        }));
    } else {
        const selectedDirectionId = getVehicleDirectionId(trackingVehicle);
        const selectedRouteId = getVehicleRouteId(trackingVehicle);
        const selectedTripId = _.result(trackingVehicle, 'vehicle.trip.tripId');

        if (selectedTripId) {
            dispatch(getTrip(selectedTripId));
        }

        dispatch(mergeVehicleFilters({
            predicate: (vehicle) => {
                if (!selectedRouteId) {
                    return vehicle.id === selectedVehicleId;
                }

                const { directionId, routeId } = _.result(vehicle, 'vehicle.trip') || {};
                return (selectedRouteId === routeId) && (_.isInteger(selectedDirectionId) ? selectedDirectionId === directionId : true);
            },
        }));

        dispatch({
            type: ACTION_TYPE.UPDATE_SELECTED_VEHICLE,
            payload: {
                vehicle: trackingVehicle,
            },
        });
    }
};

export const updateVehicleSelected = vehicle => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_SELECTED_VEHICLE,
        payload: {
            vehicle,
        },
    });
};

export const fetchUpcomingStops = vehicleId => (dispatch) => {
    dispatch(updateDataLoading(true));
    return ccRealtime.getUpcomingByVehicleId(vehicleId)
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
        .then(upcomingStops => _.orderBy(upcomingStops, 'scheduledTime'))
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
    return ccRealtime.getHistoryByVehicleId(vehicleId)
        .then((history) => {
            const vehicleTripId = getVehicleTripId(getState());
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
        .then(pastVehicles => _.orderBy(pastVehicles, 'stop.stopSequence', 'asc'))
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
