import _ from 'lodash-es';
import moment from 'moment';

import ACTION_TYPE from '../../../action-types';
import * as TRIP_MGT_API from '../../../../utils/transmitters/trip-mgt-api';
import * as BLOCK_MGT_API from '../../../../utils/transmitters/block-mgt-api';
import ErrorType from '../../../../types/error-types';
import { TRAIN_TYPE_ID } from '../../../../types/vehicle-types';
import { ERROR_MESSAGE_TYPE, CONFIRMATION_MESSAGE_TYPE, MESSAGE_ACTION_TYPES } from '../../../../types/message-types';
import { getTripInstanceId } from '../../../../utils/helpers';
import { setBannerError } from '../../activity';
import { getSelectedTripInstances, getTripInstancesActionResults, getSelectedStops, getSelectedStopsByTripKey } from '../../../selectors/control/routes/trip-instances';
import { getLinkStartTime } from '../../../selectors/control/link';
import { getServiceDate } from '../../../selectors/control/serviceDate';
import { getRouteFilters } from '../../../selectors/control/routes/filters';
import { SERVICE_DATE_FORMAT } from '../../../../utils/control/routes';
import { BLOCKS_SERVICE_DATE_FORMAT } from '../../../../utils/control/blocks';
import { DATE_FORMAT_DDMMYYYY } from '../../../../utils/dateUtils';
import { StopStatus } from '../../../../components/Control/RoutesView/Types';

const loadTripInstances = (tripInstances, timestamp) => ({
    type: ACTION_TYPE.FETCH_CONTROL_TRIP_INSTANCES,
    payload: {
        tripInstances: _.keyBy(tripInstances, tripInstance => getTripInstanceId(tripInstance)),
        timestamp,
    },
});

export const setActiveTripInstanceId = activeTripInstanceId => ({
    type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_TRIP_INSTANCE,
    payload: {
        activeTripInstanceId,
    },
});

export const updateActiveTripInstanceId = activeTripInstanceId => (dispatch) => {
    if (activeTripInstanceId) {
        dispatch(setActiveTripInstanceId(activeTripInstanceId));
    }
};

export const clearActiveTripInstanceId = () => (dispatch) => {
    dispatch(setActiveTripInstanceId(null));
};

const updateLoadingState = isLoading => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_LOADING,
    payload: { isLoading },
});

const updateUpdatingState = isUpdating => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_UPDATING,
    payload: { isUpdating },
});

const clearTripInstances = () => ({
    type: ACTION_TYPE.CLEAR_CONTROL_TRIP_INSTANCES,
    payload: {
        timestamp: moment().valueOf(),
    },
});

const assignBlockIdToTrips = async (tripInstances, serviceDate) => {
    const { blocks } = await BLOCK_MGT_API.getOperationalBlockRuns({ serviceDate });
    const operationalBlockIds = blocks.reduce((ac, block) => block.operationalTrips.reduce((innerAC, trip) => ({
        ...innerAC,
        [`${trip.tripId}-${serviceDate}-${trip.startTime}`]: block.operationalBlockId,
    }), ac), {});

    tripInstances.forEach((tripInstance) => {
        Object.assign(tripInstance, { blockId: operationalBlockIds[`${tripInstance.tripId}-${serviceDate}-${tripInstance.startTime}`] });
    });
};

export const fetchTripInstances = (variables, { isUpdate }) => (dispatch, getState) => {
    const state = getState();
    const linkStartTime = getLinkStartTime(state);
    const filters = getRouteFilters(state);
    const serviceDate = moment(getServiceDate(getState())).format(BLOCKS_SERVICE_DATE_FORMAT);

    if (isUpdate) {
        dispatch(updateUpdatingState(true));
    } else {
        dispatch(updateLoadingState(true));
        dispatch(clearTripInstances());
    }

    const timestamp = moment().valueOf();

    TRIP_MGT_API.getTrips(variables)
        .then(async ({ tripInstances }) => {
            if (filters.routeType === TRAIN_TYPE_ID) {
                await assignBlockIdToTrips(tripInstances, serviceDate);
            }
            dispatch(loadTripInstances(tripInstances, timestamp));
            if (linkStartTime) {
                const activeTrip = _.find(tripInstances, { startTime: linkStartTime });
                dispatch(updateActiveTripInstanceId(activeTrip && getTripInstanceId(activeTrip)));
            }
        })
        .catch(() => {
            if (ErrorType.tripsFetch) {
                dispatch(setBannerError(ErrorType.tripsFetch));
            }
        })
        .finally(() => {
            if (isUpdate) {
                dispatch(updateUpdatingState(false));
            } else {
                dispatch(updateLoadingState(false));
            }
        });
};

const updateTripInstance = tripInstance => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCE_ENTRY,
    payload: { tripInstance },
});

const addTripInstance = tripInstance => ({
    type: ACTION_TYPE.ADD_CONTROL_TRIP_INSTANCE_ENTRY,
    payload: { tripInstance },
});

const setTripInstanceActionResult = (body, type, tripId, actionType) => ({
    type: ACTION_TYPE.SET_TRIP_INSTANCE_ACTION_RESULT,
    payload: {
        id: _.uniqueId('actionResult'), body, type, tripId, actionType,
    },
});

export const clearTripInstanceActionResult = id => ({
    type: ACTION_TYPE.CLEAR_TRIP_INSTANCE_ACTION_RESULT,
    payload: { id },
});

const setTripInstanceActionLoading = (tripId, isLoading) => ({
    type: ACTION_TYPE.UPDATE_TRIP_INSTANCE_ACTION_LOADING,
    payload: { tripId, isLoading },
});

export const updateSelectedStops = (tripInstance, updatedStops) => ({
    type: ACTION_TYPE.UPDATE_CONTROL_SELECTED_STOPS_BY_TRIP,
    payload: {
        tripInstance,
        updatedStops,
    },
});

export const updateSelectedStopsByTrip = tripInstance => async (dispatch, getState) => {
    const selectedStops = getSelectedStops(getState());
    const selectedStopsByTrip = getSelectedStopsByTripKey(selectedStops, tripInstance);
    const sortedStops = _.sortBy(_.get(tripInstance, 'stops'), 'stopSequence');
    const currentStopIndex = _.findLastIndex(sortedStops, { status: StopStatus.passed });

    try {
        const updatedSelectedStops = _.reduce(selectedStopsByTrip, (filteredStops, selectedStop) => {
            const stopIndex = _.findIndex(tripInstance.stops, stop => stop.stopId === selectedStop.stopId);
            if (stopIndex > currentStopIndex) {
                filteredStops.push(sortedStops[stopIndex]);
            }
            return filteredStops;
        }, []);

        dispatch(updateSelectedStops(tripInstance, updatedSelectedStops));
    } catch (e) {
        return ErrorType.tripsFetch && dispatch(setBannerError(ErrorType.tripsFetch));
    }

    return null;
};

const handleTripInstanceUpdate = (action, data, dispatch) => {
    const { tripId, successMessage, actionType, errorMessage } = data;
    const tripInstanceId = getTripInstanceId(data);

    dispatch(setTripInstanceActionLoading(tripInstanceId, true));
    return action()
        .then((updatedTripInstance) => {
            dispatch(updateTripInstance(updatedTripInstance));
            dispatch(setTripInstanceActionResult(successMessage, CONFIRMATION_MESSAGE_TYPE, tripInstanceId, actionType));
        })
        .catch(() => dispatch(setTripInstanceActionResult(
            errorMessage || ErrorType.tripUpdateFailed(tripId),
            ERROR_MESSAGE_TYPE,
            tripInstanceId,
            actionType,
        )))
        .finally(() => dispatch(setTripInstanceActionLoading(tripInstanceId, false)));
};

const handleTripInstanceCreated = (action, dispatch, data) => {
    const { tripId, successMessage } = data;
    const tripInstanceId = getTripInstanceId(data);
    dispatch(setTripInstanceActionLoading(tripInstanceId, true));
    action()
        .then((createdTripInstance) => {
            dispatch(addTripInstance(createdTripInstance.data.copyTrip));
            dispatch(setTripInstanceActionResult(successMessage, CONFIRMATION_MESSAGE_TYPE, tripInstanceId));
        })
        .catch((error) => {
            const errorMessage = error.networkError && error.networkError.result
                ? error.networkError.result.message
                : ErrorType.tripUpdateFailed(tripId);

            dispatch(setTripInstanceActionResult(errorMessage, ERROR_MESSAGE_TYPE, tripInstanceId));
        })
        .finally(() => dispatch(setTripInstanceActionLoading(tripInstanceId, false)));
};

export const updateTripInstanceStatus = (options, successMessage, actionType, errorMessage) => (dispatch, getState) => handleTripInstanceUpdate(
    () => TRIP_MGT_API.recurringUpdateTripStatus(options),
    { ...options, successMessage, actionType, errorMessage },
    dispatch,
    getState,
);

export const updateTripInstanceDelay = (options, successMessage) => (dispatch) => {
    handleTripInstanceUpdate(
        () => TRIP_MGT_API.updateTripDelay(options),
        { ...options, successMessage, actionType: MESSAGE_ACTION_TYPES.tripDelayUpdate },
        dispatch,
    );
};

export const updateTripInstanceStopStatus = (options, successMessage, actionType, errorMessage) => dispatch => handleTripInstanceUpdate(
    () => TRIP_MGT_API.updateStopStatus(options),
    { ...options, successMessage, actionType, errorMessage },
    dispatch,
);

export const updateTripInstanceStopPlatform = (options, successMessage) => (dispatch) => {
    handleTripInstanceUpdate(
        () => TRIP_MGT_API.updateStopId(options),
        { ...options, successMessage, actionType: MESSAGE_ACTION_TYPES.stopPlatformUpdate },
        dispatch,
    );
};

export const copyTrip = (options, successMessage) => (dispatch) => {
    const { tripId, serviceDate, startTime } = options;

    handleTripInstanceCreated(
        () => TRIP_MGT_API.copyTrip(options),
        dispatch,
        { tripId, serviceDate, startTime, successMessage },
    );
};

export const selectSingleTrip = trip => ({
    type: ACTION_TYPE.SELECT_CONTROL_SINGLE_TRIP,
    payload: { trip },
});

export const selectAllTrips = () => ({ type: ACTION_TYPE.SELECT_CONTROL_ALL_TRIPS });

export const deselectAllTrips = () => ({ type: ACTION_TYPE.DESELECT_CONTROL_ALL_TRIPS });

const updateSelectedTrips = selectedTripsUpdate => ({
    type: ACTION_TYPE.UPDATE_CONTROL_SELECTED_TRIPS,
    payload: { selectedTripsUpdate },
});

export const fetchAndUpdateSelectedTrips = selectedTripInstances => (dispatch, getState) => {
    const state = getState();
    const tripsArgs = {
        serviceDate: moment(getServiceDate(state)).format(SERVICE_DATE_FORMAT),
        tripIds: _.map(selectedTripInstances, trip => trip.tripId),
    };
    const startTimeOfSelectedTrips = _.map(selectedTripInstances, trip => `${trip.tripId}-${trip.startTime}`);
    TRIP_MGT_API.getTrips(tripsArgs)
        .then(({ tripInstances }) => tripInstances.filter(tripInstance => startTimeOfSelectedTrips.includes(`${tripInstance.tripId}-${tripInstance.startTime}`)))
        .then(tripInstances => dispatch(updateSelectedTrips(tripInstances)))
        .catch(() => ErrorType.tripsFetch && dispatch(setBannerError(ErrorType.tripsFetch)));
};

export const collectTripsDataAndUpdateTripsStatus = (operateTrips, tripStatus, successMessage, errorMessage, recurrenceSetting, selectedTrips) => async (dispatch) => {
    const tripUpdateCalls = _.map(operateTrips, trip => dispatch(updateTripInstanceStatus(
        {
            tripStatus,
            tripId: trip.tripId,
            routeType: trip.routeType,
            startTime: trip.startTime,
            serviceDate: trip.serviceDate,
            routeVariantId: trip.routeVariantId,
            cancelFrom: moment(recurrenceSetting.startDate, DATE_FORMAT_DDMMYYYY),
            cancelTo: recurrenceSetting.endDate ? moment(recurrenceSetting.endDate, DATE_FORMAT_DDMMYYYY) : undefined,
            dayPattern: JSON.stringify(recurrenceSetting.selectedWeekdays),
            isRecurringOperation: recurrenceSetting.isRecurringOperation,
            agencyId: trip.agencyId,
            routeShortName: trip.routeShortName,
        },
        successMessage,
        MESSAGE_ACTION_TYPES.bulkStatusUpdate,
        errorMessage,
    )));
    await Promise.all(tripUpdateCalls);
    if (_.values(selectedTrips).length > 0) {
        await dispatch(fetchAndUpdateSelectedTrips(selectedTrips));
    }
};

export const removeBulkUpdateMessages = type => (dispatch, getState) => {
    const selected = getSelectedTripInstances(getState());
    const actionResult = getTripInstancesActionResults(getState());

    actionResult.forEach((action) => {
        if (action.type === type && !_.isEmpty(selected[action.tripId])) {
            dispatch(clearTripInstanceActionResult(action.id));
        }
    });
};

const updateSelectedStopsUpdatingState = areSelectedStopsUpdating => ({
    type: ACTION_TYPE.UPDATE_CONTROL_SELECTED_STOPS_UPDATING,
    payload: { areSelectedStopsUpdating },
});

export const selectSingleStop = (tripKey, stop) => ({
    type: ACTION_TYPE.SELECT_CONTROL_SINGLE_STOP,
    payload: { tripKey, stop },
});

export const deselectAllStopsByTrip = tripInstance => ({
    type: ACTION_TYPE.DESELECT_CONTROL_ALL_STOPS_BY_TRIP,
    payload: { tripInstance },
});

export const fetchAndUpdateSelectedStops = tripInstance => async (dispatch, getState) => {
    const selectedStops = getSelectedStops(getState());
    const selectedStopsByTrip = getSelectedStopsByTripKey(selectedStops, tripInstance);
    const tripsArgs = {
        tripIds: [tripInstance.tripId],
        serviceDate: moment(getServiceDate(getState)).format(SERVICE_DATE_FORMAT),
    };

    try {
        const { tripInstances } = await TRIP_MGT_API.getTrips(tripsArgs);
        const updatedStops = _.map(selectedStopsByTrip, selectedStop => tripInstances[0].stops.filter(stop => stop.stopId === selectedStop.stopId)[0]);
        dispatch(updateSelectedStops(tripInstance, updatedStops));
    } catch (e) {
        return ErrorType.tripsFetch && dispatch(setBannerError(ErrorType.tripsFetch));
    }

    return null;
};

export const removeBulkStopsUpdateMessages = tripInstance => (dispatch, getState) => {
    const actionResult = getTripInstancesActionResults(getState());
    const tripInstanceId = getTripInstanceId(tripInstance);

    actionResult.forEach((action) => {
        if (action.actionType === MESSAGE_ACTION_TYPES.bulkStopStatusUpdate && action.tripId === tripInstanceId) {
            dispatch(clearTripInstanceActionResult(action.id));
        }
    });
};

export const updateSelectedStopsStatus = (tripInstance, selectedStops, stopStatus, successMessage, errorMessage) => async (dispatch) => {
    dispatch(updateSelectedStopsUpdatingState(true));
    const stopUpdateCalls = _.map(selectedStops, stop => stop.status !== StopStatus.passed && dispatch(updateTripInstanceStopStatus(
        {
            stopStatus,
            tripId: tripInstance.tripId,
            stopSequence: stop.stopSequence,
            startTime: tripInstance.startTime,
            serviceDate: tripInstance.serviceDate,
        },
        successMessage,
        MESSAGE_ACTION_TYPES.bulkStopStatusUpdate,
        errorMessage,
    )));

    await Promise.all(stopUpdateCalls);
    dispatch(updateSelectedStopsUpdatingState(false));
    // Regarding the next two lines, refer to selectors/trip-instances.js -> ABOUT REMOVING SELECTED STOPS AFTER UPDATE
    // dispatch(fetchAndUpdateSelectedStops(tripInstance));
    dispatch(deselectAllStopsByTrip(tripInstance));
};

export const moveTripToStop = (options, successMessage, tripInstance) => (dispatch) => {
    handleTripInstanceUpdate(
        () => TRIP_MGT_API.moveTotStop(options),
        { ...options, successMessage, actionType: MESSAGE_ACTION_TYPES.moveTripStop },
        dispatch,
    );
    dispatch(deselectAllStopsByTrip(tripInstance));
};

export const moveTripToNextStop = (options, successMessage) => (dispatch) => {
    handleTripInstanceUpdate(
        () => TRIP_MGT_API.moveToNextStop(options),
        { ...options, successMessage, actionType: MESSAGE_ACTION_TYPES.moveTripNextStop },
        dispatch,
    );
};

export const selectStops = (tripInstance, stop) => (dispatch, getState) => {
    const allStopsInTrip = tripInstance.stops;
    const tripInstanceId = getTripInstanceId(tripInstance);
    const allSelectedStops = getSelectedStops(getState());
    const selectedStopsByTrip = getSelectedStopsByTripKey(allSelectedStops, tripInstance);
    const isThereJustOneStopSelected = selectedStopsByTrip && _.size(selectedStopsByTrip) === 1;
    const onlySelectedStop = isThereJustOneStopSelected && selectedStopsByTrip[_.findKey(selectedStopsByTrip)];
    const isRangeSelection = isThereJustOneStopSelected && onlySelectedStop.stopId !== stop.stopId;

    if (isRangeSelection) {
        const stopToKeep = stop.stopSequence < onlySelectedStop.stopSequence ? onlySelectedStop : stop;
        const stopsInBetween = _.filter(allStopsInTrip, unselectedStop => unselectedStop.status !== StopStatus.nonStopping && _.inRange(
            unselectedStop.stopSequence,
            stop.stopSequence,
            onlySelectedStop.stopSequence,
        ));

        return [...stopsInBetween, stopToKeep]
            .forEach(stopInBetween => onlySelectedStop.stopId !== stopInBetween.stopId && dispatch(selectSingleStop(tripInstanceId, stopInBetween)));
    }

    return dispatch(selectSingleStop(tripInstanceId, stop));
};

export const clearSelectedStops = () => ({
    type: ACTION_TYPE.CLEAR_CONTROL_SELECTED_STOPS,
});

export const setTripStatusModalOrigin = origin => ({
    type: ACTION_TYPE.SET_TRIP_STATUS_MODAL_ORIGIN,
    payload: { origin },
});
