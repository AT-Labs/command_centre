import { handleActions } from 'redux-actions';
import { filter, concat, includes, isNull, has, unset, difference, pick, keyBy, isEmpty } from 'lodash-es';

import ACTION_TYPE from '../../../action-types';
import { getTripInstanceId, getStopKey, checkIfAllTripsAreSelected } from '../../../../utils/helpers';
import { getAllNotCompletedTrips } from '../../../selectors/control/routes/trip-instances';

export const INIT_STATE = {
    isLoading: false,
    isUpdating: false,
    permissions: [],
    all: {},
    allLastUpdated: null,
    active: [],
    actionResults: [],
    isActionLoading: {},
    total: 0,
    selected: {},
    selectedStops: {},
    areSelectedStopsUpdating: false,
    tripStatusModalOrigin: null,
    lastFilterRequest: null,
    totalTripInstancesCount: 0,
    addTrip: {
        isAddTripEnabled: false,
        activeStep: 0,
        datagridConfig: {
            columns: [],
            page: 0,
            pageSize: 15,
            sortModel: [],
            density: 'standard',
            pinnedColumns: { right: ['actions'] },
        },
        selectedTrip: null,
        isNewTripModalOpen: false,
        action: {
            isRequesting: false,
            result: null,
            resultStatus: null,
            resultMessage: null,
        },
    },
};

const handleTripInstancesUpdate = (state, { payload: { tripInstances, timestamp } }) => {
    const total = Object.keys(tripInstances).length;

    // if update came after the newer update, do not update
    if (timestamp < state.allLastUpdated) {
        return { ...state };
    }

    return {
        ...state,
        all: tripInstances,
        active: state.active.filter(tripInstanceId => tripInstances[tripInstanceId]),
        total,
        allLastUpdated: timestamp,
    };
};

const handleLoadingUpdate = (state, { payload: { isLoading } }) => ({ ...state, isLoading });

const handleUpdatingUpdate = (state, { payload: { isUpdating } }) => ({ ...state, isUpdating });

const handleTripInstancesClear = (state, { payload: { timestamp } }) => ({
    ...state,
    all: {},
    total: 0,
    allLastUpdated: timestamp,
});

const handleTripInstanceEntryUpdate = (state, { payload: { tripInstance } }) => {
    const tripInstanceId = getTripInstanceId(tripInstance);
    const tripInstanceFromState = state.all[tripInstanceId];
    if (tripInstanceFromState) {
        return {
            ...state,
            all: {
                ...state.all,
                [tripInstanceId]: {
                    ...tripInstanceFromState,
                    ...tripInstance,
                },
            },
        };
    }
    return { ...state };
};

const handleTripInstanceEntryCreated = (state, { payload: { tripInstance } }) => {
    const tripInstanceId = `${tripInstance.tripId}-${tripInstance.serviceDate}-${tripInstance.startTime}`;
    return {
        ...state,
        all: {
            ...state.all,
            [tripInstanceId]: {
                ...tripInstance,
            },
        },
    };
};

const handleTripInstancesActionResultSet = (state, { payload: actionResult }) => {
    const { actionResults } = state;
    return {
        ...state,
        actionResults: concat([], actionResults, [actionResult]),
    };
};

const handleTripInstancesActionResultClear = (state, { payload: { id } }) => {
    const { actionResults } = state;
    return {
        ...state,
        actionResults: filter(actionResults, item => item.id !== id),
    };
};

const handleTripInstanceActionLoadingUpdate = (state, { payload: { tripId, isLoading } }) => ({
    ...state,
    isActionLoading: {
        ...state.isActionLoading,
        [tripId]: isLoading,
    },
});

const handleUpdateActiveTripInstance = (state, { payload: { activeTripInstanceId } }) => {
    let active;

    if (activeTripInstanceId) {
        const isExistingActiveTripInstanceId = includes(state.active, activeTripInstanceId);
        active = isExistingActiveTripInstanceId
            ? state.active.filter(activeTripId => activeTripId !== activeTripInstanceId)
            : [
                ...state.active,
                activeTripInstanceId,
            ];
    } else if (isNull(activeTripInstanceId)) {
        active = [];
    }

    return ({
        ...state,
        active,
    });
};

const handleUpdateActiveTripInstances = (state, { payload: { active } }) => ({
    ...state,
    active,
});

const handleSelectSingleTrip = (state, { payload: { trip } }) => {
    const tripKey = Object.keys(trip)[0];
    const selectedClone = { ...state.selected };

    if (has(selectedClone, tripKey)) unset(selectedClone, tripKey);
    else Object.assign(selectedClone, trip);

    return {
        ...state,
        selected: selectedClone,
    };
};

const handleSelectTrips = (state, { payload: { tripKeys } }) => {
    const selectedClone = { ...state.selected };
    const selected = tripKeys.reduce((obj, tripKey) => ({
        ...obj,
        [tripKey]: state.all[tripKey] || selectedClone[tripKey],
    }), {});

    return {
        ...state,
        selected,
    };
};

const handleSelectAllTrips = (state) => {
    const notCompletedInstances = getAllNotCompletedTrips(state.all);
    const notCompletedTripsKeys = Object.keys(notCompletedInstances);
    const selectedKeys = Object.keys(state.selected);
    const areAllTripsSelected = checkIfAllTripsAreSelected(notCompletedTripsKeys, selectedKeys);
    const selectedByViewKeys = difference(selectedKeys, notCompletedTripsKeys);
    const selectedByViewInstances = pick(state.selected, selectedByViewKeys);

    return ({
        ...state,
        selected: areAllTripsSelected
            ? selectedByViewInstances
            : {
                ...selectedByViewInstances,
                ...notCompletedInstances,
            },
    });
};

const handleDeselectAllTrips = state => ({
    ...state,
    selected: {},
});

const handleUpdateSelectedTrips = (state, { payload: { selectedTripsUpdate } }) => ({
    ...state,
    selected: keyBy(selectedTripsUpdate, tripInstance => getTripInstanceId(tripInstance)),
});

const handleSelectSingleStop = (state, { payload: { tripKey, stop } }) => {
    const stopKey = getStopKey(stop);
    const selectedStopsClone = { ...state.selectedStops };
    const isTripKeySelected = has(selectedStopsClone, tripKey); // We group stops by trip key. Nothing to do with trip selection.
    const isStopKeyInTrip = has(selectedStopsClone[tripKey], stopKey);
    const stopDataByStopKey = {
        [stopKey]: { ...stop },
    };
    const stopDataByTripId = { [tripKey]: { ...stopDataByStopKey } };
    const handleSelectionIfTripKeyExists = () => (isStopKeyInTrip
        ? unset(selectedStopsClone[tripKey], stopKey)
        : Object.assign(selectedStopsClone[tripKey], stopDataByStopKey));

    if (isTripKeySelected) handleSelectionIfTripKeyExists(); // if trip is selected, assign or unset stop.
    else Object.assign(selectedStopsClone, stopDataByTripId); // if trip doesn't exist, assign it.
    if (isEmpty(selectedStopsClone[tripKey])) unset(selectedStopsClone, tripKey); // if, after the two previous steps, trip is empty unset it.

    return {
        ...state,
        selectedStops: selectedStopsClone,
    };
};

const handleDeselectAllStopsByTrip = (state, { payload: { tripInstance } }) => {
    const selectedStopsClone = { ...state.selectedStops };
    unset(selectedStopsClone, getTripInstanceId(tripInstance));

    return {
        ...state,
        selectedStops: selectedStopsClone,
    };
};

const handleUpdateSelectedStops = (state, { payload: { tripInstance, updatedStops } }) => ({
    ...state,
    selectedStops: {
        ...state.selectedStops,
        [getTripInstanceId(tripInstance)]: updatedStops ? keyBy(updatedStops, stop => getStopKey(stop)) : {},
    },
});

const handleSelectedStopsLoadingUpdate = (state, { payload: { areSelectedStopsUpdating } }) => ({ ...state, areSelectedStopsUpdating });

const handleClearSelectedStops = state => ({ ...state, selectedStops: {} });

const handleSetTripStatusModalOrigin = (state, { payload: { origin } }) => ({ ...state, tripStatusModalOrigin: origin });

const handleLastFilterUpdate = (state, { payload: { lastFilterRequest } }) => ({ ...state, lastFilterRequest });

const handleTotalCountUpdate = (state, { payload: { totalTripInstancesCount } }) => ({ ...state, totalTripInstancesCount });

const handleOpenAddTrip = (state, { payload: { isAddTripEnabled } }) => ({ ...state, addTrip: { ...state.addTrip, isAddTripEnabled } });

const handleUpdateCurrentStep = (state, { payload: { activeStep } }) => ({ ...state, addTrip: { ...state.addTrip, activeStep } });

const handleAddTripDatagridConfig = (state, action) => ({ ...state, addTrip: { ...state.addTrip, datagridConfig: { ...state.addTrip.datagridConfig, ...action.payload } } });

const handleSetSelectedTrip = (state, { payload: { selectedTrip } }) => ({ ...state, addTrip: { ...state.addTrip, selectedTrip } });

const handleResetAddTripStep = state => ({ ...state, addTrip: { ...state.addTrip, activeStep: 0 } });

const handleTripInstancesPermissionsUpdate = (state, { payload: { permissions } }) => ({ ...state, permissions });

const handleAddTripModal = (state, { payload: { type, isOpen } }) => ({
    ...state,
    addTrip: {
        ...state.addTrip,
        [type]: isOpen,
    },
});

const handleAddTripRequestingUpdate = (state, { payload: { isRequesting } }) => ({
    ...state,
    addTrip: {
        ...state.addTrip,
        action: {
            ...state.addTrip.action,
            isRequesting,
        },
    },
});

const handleAddTripResultUpdate = (state, { payload: { result, resultStatus, resultMessage } }) => ({
    ...state,
    addTrip: {
        ...state.addTrip,
        action: {
            ...state.addTrip.action,
            result,
            resultStatus,
            resultMessage,
        },
    },
});

export default handleActions({
    [ACTION_TYPE.FETCH_CONTROL_TRIP_INSTANCES]: handleTripInstancesUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_LOADING]: handleLoadingUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_UPDATING]: handleUpdatingUpdate,
    [ACTION_TYPE.CLEAR_CONTROL_TRIP_INSTANCES]: handleTripInstancesClear,
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCE_ENTRY]: handleTripInstanceEntryUpdate,
    [ACTION_TYPE.SET_TRIP_INSTANCE_ACTION_RESULT]: handleTripInstancesActionResultSet,
    [ACTION_TYPE.CLEAR_TRIP_INSTANCE_ACTION_RESULT]: handleTripInstancesActionResultClear,
    [ACTION_TYPE.UPDATE_TRIP_INSTANCE_ACTION_LOADING]: handleTripInstanceActionLoadingUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_ACTIVE_TRIP_INSTANCE]: handleUpdateActiveTripInstance,
    [ACTION_TYPE.UPDATE_CONTROL_ACTIVE_TRIP_INSTANCES]: handleUpdateActiveTripInstances,
    [ACTION_TYPE.ADD_CONTROL_TRIP_INSTANCE_ENTRY]: handleTripInstanceEntryCreated,
    [ACTION_TYPE.SELECT_CONTROL_SINGLE_TRIP]: handleSelectSingleTrip,
    [ACTION_TYPE.SELECT_CONTROL_TRIPS]: handleSelectTrips,
    [ACTION_TYPE.SELECT_CONTROL_ALL_TRIPS]: handleSelectAllTrips,
    [ACTION_TYPE.DESELECT_CONTROL_ALL_TRIPS]: handleDeselectAllTrips,
    [ACTION_TYPE.UPDATE_CONTROL_SELECTED_TRIPS]: handleUpdateSelectedTrips,
    [ACTION_TYPE.SELECT_CONTROL_SINGLE_STOP]: handleSelectSingleStop,
    [ACTION_TYPE.DESELECT_CONTROL_ALL_STOPS_BY_TRIP]: handleDeselectAllStopsByTrip,
    [ACTION_TYPE.UPDATE_CONTROL_SELECTED_STOPS_BY_TRIP]: handleUpdateSelectedStops,
    [ACTION_TYPE.UPDATE_CONTROL_SELECTED_STOPS_UPDATING]: handleSelectedStopsLoadingUpdate,
    [ACTION_TYPE.CLEAR_CONTROL_SELECTED_STOPS]: handleClearSelectedStops,
    [ACTION_TYPE.SET_TRIP_STATUS_MODAL_ORIGIN]: handleSetTripStatusModalOrigin,
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_LAST_FILTER]: handleLastFilterUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_TOTAL_COUNT]: handleTotalCountUpdate,
    [ACTION_TYPE.OPEN_ADD_TRIP_MODAL]: handleOpenAddTrip,
    [ACTION_TYPE.UPDATE_CURRENT_STEP]: handleUpdateCurrentStep,
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_ADD_TRIP_DATAGRID_CONFIG]: handleAddTripDatagridConfig,
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_SELECTED_ADD_TRIP]: handleSetSelectedTrip,
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_RESET_ADD_TRIP_STATE]: handleResetAddTripStep,
    [ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_PERMISSIONS]: handleTripInstancesPermissionsUpdate,
    [ACTION_TYPE.SET_ADD_TRIP_MODAL_STATUS]: handleAddTripModal,
    [ACTION_TYPE.UPDATE_ADD_TRIP_ACTION_REQUESTING]: handleAddTripRequestingUpdate,
    [ACTION_TYPE.UPDATE_ADD_TRIP_ACTION_RESULT]: handleAddTripResultUpdate,
}, INIT_STATE);
