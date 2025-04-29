import { get, keyBy, find, uniqueId, filter, size, findKey, inRange, map, values, findIndex, reduce, findLastIndex, sortBy, isEqual, compact } from 'lodash-es';
import moment from 'moment';

import VIEW_TYPE from '../../../../types/view-types';
import ACTION_TYPE from '../../../action-types';
import * as TRIP_MGT_API from '../../../../utils/transmitters/trip-mgt-api';
import * as BLOCK_MGT_API from '../../../../utils/transmitters/block-mgt-api';
import ErrorType from '../../../../types/error-types';
import { TRAIN_TYPE_ID } from '../../../../types/vehicle-types';
import { ERROR_MESSAGE_TYPE, CONFIRMATION_MESSAGE_TYPE, MESSAGE_ACTION_TYPES } from '../../../../types/message-types';
import { getTripInstanceId } from '../../../../utils/helpers';
import { setBannerError } from '../../activity';
import {
    getTripInstancesActionResults,
    getSelectedStops,
    getSelectedStopsByTripKey,
    getLastFilterRequest,
} from '../../../selectors/control/routes/trip-instances';
import { getLinkStartTime } from '../../../selectors/control/link';
import { getServiceDate } from '../../../selectors/control/serviceDate';
import { getRouteFilters, getControlDetailRoutesViewType } from '../../../selectors/control/routes/filters';
import { SERVICE_DATE_FORMAT } from '../../../../utils/control/routes';
import { BLOCKS_SERVICE_DATE_FORMAT } from '../../../../utils/control/blocks';
import { DATE_FORMAT_DDMMYYYY } from '../../../../utils/dateUtils';
import { StopStatus } from '../../../../components/Control/RoutesView/Types';
import { getFilteredRouteVariants, getActiveRouteVariant } from '../../../selectors/control/routes/routeVariants';
import { getAllRoutesArray, getActiveRoute } from '../../../selectors/control/routes/routes';
import { ACTION_RESULT } from '../../../../types/add-trip-types';
import { captureError } from '../../../../utils/logger';
import { UpdateStopPlatformError } from '../../../../types/exception-types';
import { getRoutesTripsDatagridConfig } from '../../../selectors/datagrid';

const loadTripInstances = (tripInstances, timestamp) => ({
    type: ACTION_TYPE.FETCH_CONTROL_TRIP_INSTANCES,
    payload: {
        tripInstances: keyBy(tripInstances, tripInstance => getTripInstanceId(tripInstance)),
        timestamp,
    },
});

const totalTripInstancesCount = count => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_TOTAL_COUNT,
    payload: {
        totalTripInstancesCount: count,
    },
});

const updateTripInstancesPermissions = permissions => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_PERMISSIONS,
    payload: {
        permissions,
    },
});

const updateLastFilterRequest = filterObject => ({
    type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_LAST_FILTER,
    payload: {
        lastFilterRequest: filterObject,
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

export const updateActiveTripInstances = active => ({
    type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_TRIP_INSTANCES,
    payload: {
        active,
    },
});

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
        .then(async ({ tripInstances, totalCount, _links: { permissions } }) => {
            if (filters.routeType === TRAIN_TYPE_ID) {
                await assignBlockIdToTrips(tripInstances, serviceDate);
            }
            dispatch(loadTripInstances(tripInstances, timestamp));
            dispatch(totalTripInstancesCount(totalCount));
            dispatch(updateTripInstancesPermissions(permissions));
            if (linkStartTime) {
                const activeTrip = find(tripInstances, { startTime: linkStartTime });
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
        id: uniqueId('actionResult'), body, type, tripId, actionType,
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
    const sortedStops = sortBy(get(tripInstance, 'stops'), 'stopSequence');
    const currentStopIndex = findLastIndex(sortedStops, { status: StopStatus.passed });

    try {
        const updatedSelectedStops = reduce(selectedStopsByTrip, (filteredStops, selectedStop) => {
            const stopIndex = findIndex(tripInstance.stops, stop => stop.stopId === selectedStop.stopId);
            if (stopIndex > currentStopIndex) {
                filteredStops.push(sortedStops[stopIndex]);
            }
            return filteredStops;
        }, []);

        dispatch(updateSelectedStops(tripInstance, updatedSelectedStops));
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error processing selected stops:', e);
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

export const updateTripInstanceStatus = (options, successMessage, actionType, errorMessage) => dispatch => handleTripInstanceUpdate(
    () => TRIP_MGT_API.recurringUpdateTripStatus(options),
    { ...options, successMessage, actionType, errorMessage },
    dispatch,
);

export const updateTripInstanceDisplay = (options, successMessage, actionType, errorMessage) => dispatch => handleTripInstanceUpdate(
    () => TRIP_MGT_API.updateTripDisplay(options),
    { ...options, successMessage, actionType, errorMessage },
    dispatch,
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
    if (options.stopId) {
        handleTripInstanceUpdate(
            () => TRIP_MGT_API.updateStopId(options),
            { ...options, successMessage, actionType: MESSAGE_ACTION_TYPES.stopPlatformUpdate },
            dispatch,
        );
    } else {
        captureError(
            new UpdateStopPlatformError('Failed to update stop platform as the new platform is not valid.'),
            options,
        );
        const tripInstanceId = getTripInstanceId(options);
        dispatch(setTripInstanceActionResult(
            'Failed to update the stop platform.',
            ERROR_MESSAGE_TYPE,
            tripInstanceId,
            MESSAGE_ACTION_TYPES.stopPlatformUpdate,
        ));
    }
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

export const selectTrips = tripKeys => ({
    type: ACTION_TYPE.SELECT_CONTROL_TRIPS,
    payload: { tripKeys },
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
        tripIds: map(selectedTripInstances, trip => trip.tripId),
    };
    const startTimeOfSelectedTrips = map(selectedTripInstances, trip => `${trip.tripId}-${trip.startTime}`);
    TRIP_MGT_API.getTrips(tripsArgs)
        .then(({ tripInstances }) => tripInstances.filter(tripInstance => startTimeOfSelectedTrips.includes(`${tripInstance.tripId}-${tripInstance.startTime}`)))
        .then(tripInstances => dispatch(updateSelectedTrips(tripInstances)))
        .catch(() => ErrorType.tripsFetch && dispatch(setBannerError(ErrorType.tripsFetch)));
};

const bulkTripInstanceActions = (operateTrips, action, selectedTrips) => async (dispatch) => {
    const tripUpdateCalls = map(operateTrips, trip => dispatch(action(trip)));
    await Promise.all(tripUpdateCalls);
    if (values(selectedTrips).length > 0) {
        await dispatch(fetchAndUpdateSelectedTrips(selectedTrips));
    }
};

export const collectTripsDataAndUpdateTripsStatus = (operateTrips, tripStatus, successMessage, errorMessage, recurrenceSetting, selectedTrips) => async (dispatch) => {
    const action = trip => updateTripInstanceStatus(
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
            display: recurrenceSetting.display,
            agencyId: trip.agencyId,
            routeShortName: trip.routeShortName,
        },
        successMessage,
        MESSAGE_ACTION_TYPES.bulkStatusUpdate,
        errorMessage,
    );
    await dispatch(bulkTripInstanceActions(operateTrips, action, selectedTrips));
};

export const bulkUpdateTripsDisplay = (operateTrips, successMessage, errorMessage, selectedTrips) => async (dispatch) => {
    const action = trip => updateTripInstanceDisplay(
        {
            display: false,
            tripId: trip.tripId,
            startTime: trip.startTime,
            serviceDate: trip.serviceDate,
        },
        successMessage,
        MESSAGE_ACTION_TYPES.bulkStatusUpdate,
        errorMessage,
    );
    await dispatch(bulkTripInstanceActions(operateTrips, action, selectedTrips));
};

export const removeBulkUpdateMessages = type => (dispatch, getState) => {
    const actionResult = getTripInstancesActionResults(getState());

    actionResult.forEach((action) => {
        if (action.type === type) {
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
        const updatedStops = map(selectedStopsByTrip, selectedStop => tripInstances[0].stops.filter(stop => stop.stopId === selectedStop.stopId)[0]);
        dispatch(updateSelectedStops(tripInstance, updatedStops));
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error processing selected stops:', e);
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

export const updateSelectedStopsStatus = (tripInstance, selectedStops, stopStatus, display, successMessage, errorMessage) => async (dispatch) => {
    dispatch(updateSelectedStopsUpdatingState(true));
    await dispatch(updateTripInstanceStopStatus(
        {
            stopStatus,
            display,
            tripId: tripInstance.tripId,
            stopSequences: compact(map(selectedStops, stop => (stop.status !== StopStatus.passed ? stop.stopSequence : undefined))),
            startTime: tripInstance.startTime,
            serviceDate: tripInstance.serviceDate,
        },
        successMessage,
        MESSAGE_ACTION_TYPES.bulkStopStatusUpdate,
        errorMessage,
    ));
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

export const updateDestination = (options, successMessage, tripInstance) => (dispatch) => {
    handleTripInstanceUpdate(
        () => TRIP_MGT_API.updateHeadsign(options),
        { ...options, successMessage, actionType: MESSAGE_ACTION_TYPES.updateDestination },
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
    const isThereJustOneStopSelected = selectedStopsByTrip && size(selectedStopsByTrip) === 1;
    const onlySelectedStop = isThereJustOneStopSelected && selectedStopsByTrip[findKey(selectedStopsByTrip)];
    const isRangeSelection = isThereJustOneStopSelected && onlySelectedStop.stopId !== stop.stopId;

    if (isRangeSelection) {
        const stopToKeep = stop.stopSequence < onlySelectedStop.stopSequence ? onlySelectedStop : stop;
        const stopsInBetween = filter(allStopsInTrip, unselectedStop => inRange(
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

const removeNonNullableFilters = model => model
    ?.items
    ?.map(item => ({
        ...item,
        value: item.value ?? ' ', // type can be undefined, so we replace it with single space so its not filtered. Its trim() later
    }))
    ?.filter(item => !!item.value && (!Array.isArray(item.value) || item.value.length > 0));

export const getFilters = (model, state) => {
    let filters = removeNonNullableFilters(model);

    // console.log('-------------models--', model);

    filters = filters.reduce((result, item) => ({
        ...result,
        [item.columnField]: item.value,
        ...(item.columnField === 'tripId' && { tripIds: item.value }),
        ...(item.columnField === 'startTime' && item.operatorValue === 'onOrAfter' && { startTimeFrom: item.value }),
        ...(item.columnField === 'startTime' && item.operatorValue === 'onOrBefore' && { startTimeTo: item.value }),
        ...(item.columnField === 'endTime' && item.operatorValue === 'onOrAfter' && { endTimeFrom: item.value }),
        ...(item.columnField === 'endTime' && item.operatorValue === 'onOrBefore' && { endTimeTo: item.value }),
        ...(item.columnField === 'type' && item.operatorValue === 'is' && { type: undefined, notType: undefined, isType: item.value.trim() }), // here we trip ' ' added above
        ...(item.columnField === 'type' && item.operatorValue === 'not' && { type: undefined, isType: undefined, notType: item.value.trim() }), // here we trip ' ' added above
        ...(item.columnField === 'status' && { tripStatus: item.value }),
        ...(item.columnField === 'vehicleLabel' && { vehicleLabels: item.value }),
        ...(item.columnField === 'referenceId' && { referenceIds: item.value }),
        ...(item.columnField === 'trackingStatus' && { trackingStatuses: item.value }),
        ...(item.columnField === 'firstStopCode' && { firstStopCode: item.value.data.stop_code }),
        ...(item.columnField === 'lastStopCode' && { lastStopCode: item.value.data.stop_code }),
    }), {});

    // console.log('------------reduced filter:', filters);

    const routeFilters = getRouteFilters(state);
    filters.routeType = routeFilters.routeType;
    filters.delayRange = routeFilters.delayRange;
    filters.agencyId = routeFilters.agencyId;
    filters.depotIds = routeFilters.depotIds;
    filters.tripStatus = routeFilters.tripStatus;

    filters = {
        ...filters,
        ...(!filters.startTimeFrom && { startTimeFrom: routeFilters.startTimeFrom }),
        ...(!filters.startTimeTo && { startTimeTo: routeFilters.startTimeTo }),
    };

    const { routeShortName, routeVariantId } = routeFilters;
    if (routeVariantId) {
        filters.routeVariantIds = [routeVariantId];
    } else if (routeShortName) {
        filters.routeVariantIds = getAllRoutesArray(state).filter(route => route.agencyAgnostic && routeShortName === route.routeShortName)
            .map(route => route.routeVariants).flat()
            .map(item => item.routeVariantId);
    }

    // console.log('------------filters:', filters);
    return filters;
};

const parseSortModel = sortModel => sortModel.map(model => ({ sortBy: model.field, order: model.sort }))[0];

export const filterTripInstances = forceLoad => (dispatch, getState) => {
    const state = getState();
    const routesTripsDatagridConfig = getRoutesTripsDatagridConfig(state);
    const lastFilterRequest = getLastFilterRequest(state);
    const filters = getFilters(routesTripsDatagridConfig.filterModel, state);
    const filterRequest = {
        ...filters,
        serviceDate: moment(getServiceDate(state)).format(SERVICE_DATE_FORMAT),
        page: routesTripsDatagridConfig.page + 1,
        limit: routesTripsDatagridConfig.pageSize,
        sorting: parseSortModel(routesTripsDatagridConfig.sortModel),
    };

    if (filters.disruptionId?.id) filterRequest.disruptionId = parseInt(filters.disruptionId.id, 10);
    // console.log('-------filters:', filters);
    const viewType = getControlDetailRoutesViewType(state);
    if (viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_ROUTE_VARIANTS_TRIPS
        || viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTE_VARIANTS_TRIPS) {
        filterRequest.routeVariantIds = [get(getActiveRouteVariant(state), 'routeVariantId')];
    }
    if (viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_TRIPS) {
        const routeVariants = filter(getFilteredRouteVariants(state), { routeShortName: get(getActiveRoute(state), 'routeShortName') });
        filterRequest.routeVariantIds = map(routeVariants, item => item.routeVariantId);
    }

    if (forceLoad || !lastFilterRequest || !isEqual(filterRequest, lastFilterRequest)) {
        dispatch(fetchTripInstances(filterRequest, { isUpdate: true }));
        dispatch(updateLastFilterRequest(filterRequest));
    }
};

export const updateEnabledAddTripModal = isAddTripEnabled => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.OPEN_ADD_TRIP_MODAL,
        payload: {
            isAddTripEnabled,
        },
    });
};

export const updateCurrentStepHandler = activeStep => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_CURRENT_STEP,
        payload: {
            activeStep,
        },
    });
};

export const updateAddTripDatagridConfig = dataGridConfig => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_ADD_TRIP_DATAGRID_CONFIG,
        payload: dataGridConfig,
    });
};

export const updateSelectedAddTrip = selectedTrip => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_SELECTED_ADD_TRIP,
        payload: {
            selectedTrip,
        },
    });
};

export const resetAddTripStep = () => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_RESET_ADD_TRIP_STATE,
    });
};

export const clearAddTripActionResult = () => ({
    type: ACTION_TYPE.UPDATE_ADD_TRIP_ACTION_RESULT,
    payload: {
        result: null,
        resultStatus: null,
        resultMessage: null,
    },
});

export const updateRequestingAddTripActionResult = isRequesting => ({
    type: ACTION_TYPE.UPDATE_ADD_TRIP_ACTION_REQUESTING,
    payload: {
        isRequesting,
    },
});

export const updateAddTripActionResult = (result, { resultStatus, resultMessage }) => ({
    type: ACTION_TYPE.UPDATE_ADD_TRIP_ACTION_RESULT,
    payload: {
        result,
        resultStatus,
        resultMessage,
    },
});

const handleAddTrip = (action, dispatch) => {
    dispatch(updateRequestingAddTripActionResult(true));
    action()
        .then((response) => {
            dispatch(updateAddTripActionResult(response.data.addNewTrips, ACTION_RESULT.SUCCESS()));
        })
        .catch((error) => {
            const result = ACTION_RESULT.ERROR();
            result.resultMessage = error.networkError?.result?.message || result.resultMessage;
            dispatch(updateAddTripActionResult(null, result));
        })
        .finally(() => dispatch(updateRequestingAddTripActionResult(false)));
};

export const addTrips = options => (dispatch) => {
    handleAddTrip(
        () => TRIP_MGT_API.addTrips(options),
        dispatch,
    );
};

export const toggleAddTripModals = (type, isOpen) => ({
    type: ACTION_TYPE.SET_ADD_TRIP_MODAL_STATUS,
    payload: {
        type,
        isOpen,
    },
});
