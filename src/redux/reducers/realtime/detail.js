import { max, map, isEmpty, filter } from 'lodash-es';
import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    vehicle: {},
    trip: {},
    stop: {},
    address: {},
    route: {},
    isReplace: false,
    selectedSearchResults: {},
    viewDetailKey: '',
};

const handleClearDetail = (state, { payload: { isReplace } }) => ({
    ...state,
    vehicle: {},
    trip: {},
    stop: {},
    address: {},
    route: {},
    isReplace,
    viewDetailKey: '',
});

const handleSelectedVehicle = (state, { payload: { vehicle } }) => ({
    ...state,
    vehicle: {
        ...state.vehicle,
        ...vehicle,
    },
});

const handlePastStopsOfSelectedVehicle = (state, { payload: { pastStops } }) => ({
    ...state,
    vehicle: {
        ...state.vehicle,
        pastStops,
        lastStopSequence: max(map(pastStops, 'stop.stopSequence')) || -1,
    },
});

const handleSelectedStop = (state, { payload: { stop } }) => ({ ...state, stop });

const handleSelectedAddress = (state, { payload: { address } }) => ({ ...state, address });

export const handleUpcomingVehiclesOfSelectedStop = (state, { payload: { upcomingVehicles } }) => ({
    ...state,
    stop: {
        ...state.stop,
        upcomingVehicles,
    },
});

const handlePastVehiclesOfSelectedStop = (state, { payload: { pastVehicles } }) => ({
    ...state,
    stop: {
        ...state.stop,
        pastVehicles,
    },
});

const handlePidMessagesOfSelectedStop = (state, { payload: { pidMessages } }) => ({
    ...state,
    stop: {
        ...state.stop,
        pidMessages,
    },
});

const handlePidInformationOfSelectedStop = (state, { payload: { pidInformation } }) => ({
    ...state,
    stop: {
        ...state.stop,
        pidInformation,
    },
});

export const handleUpcomingStopsOfSelectedVehicle = (state, { payload: { upcomingStops } }) => ({
    ...state,
    vehicle: {
        ...state.vehicle,
        upcomingStops,
    },
});

const handleVehicleFleetInfo = (state, { payload: { vehicleFleetInfo } }) => ({
    ...state,
    vehicle: {
        ...state.vehicle,
        fleetInfo: vehicleFleetInfo,
    },
});

const updateSelectedSearchResults = (selectedSearchResults, entityKey, fieldValues) => (
    selectedSearchResults[entityKey] ? {
        ...selectedSearchResults,
        [entityKey]: { ...selectedSearchResults[entityKey], ...fieldValues },
    } : selectedSearchResults
);

const handleSelectedRoute = (state, { payload: { entityKey, route } }) => ({
    ...state,
    route,
    selectedSearchResults: updateSelectedSearchResults(state.selectedSearchResults, entityKey, route),
});

const handleRoutesByShortName = (state, { payload: { entityKey, routes } }) => ({
    ...state,
    route: {
        ...state.route,
        routes,
    },
    selectedSearchResults: updateSelectedSearchResults(state.selectedSearchResults, entityKey, { routes }),
});

const handleRouteByStop = (state, { payload: { entityKey, routes } }) => ({
    ...state,
    stop: {
        ...state.stop,
        routes,
    },
    selectedSearchResults: updateSelectedSearchResults(state.selectedSearchResults, entityKey, { routes }),
});

const handleDisruptionsByStop = (state, { payload: { entityKey, disruptions } }) => ({
    ...state,
    selectedSearchResults: updateSelectedSearchResults(state.selectedSearchResults, entityKey, { disruptions }),
});

const handleGetTrip = (state, { payload: { entityKey, trip } }) => ({
    ...state,
    vehicle: {
        ...state.vehicle,
        trip: {
            ...state.vehicle.trip,
            ...trip,
        },
    },
    selectedSearchResults: updateSelectedSearchResults(state.selectedSearchResults, entityKey, { trip }),
});

const handleUpdateSearchResultsCheckStatus = (state, { payload: { searchResultsCheckStatus } }) => {
    const selectedSearchResults = { ...state.selectedSearchResults };
    const keys = Object.keys(searchResultsCheckStatus);
    keys.forEach((key) => {
        selectedSearchResults[key].checked = searchResultsCheckStatus[key].checked;
    });

    return {
        ...state,
        selectedSearchResults,
    };
};

const handleUpdateViewDetailKey = (state, { payload: { viewDetailKey } }) => ({ ...state, viewDetailKey });

const handleAddSelectedSearchResult = (state, { payload: { selectedSearchResult } }) => (
    { ...state, selectedSearchResults: { ...state.selectedSearchResults, [selectedSearchResult.key]: selectedSearchResult } });

const handleFetchRouteStops = (state, { payload: { entityKey, stops } }) => ({
    ...state,
    route: {
        ...state.route,
        stops,
    },
    selectedSearchResults: updateSelectedSearchResults(state.selectedSearchResults, entityKey, { stops }),
});

const handleFetchVehicleTripStops = (state, { payload: { entityKey, stops } }) => ({
    ...state,
    vehicle: {
        ...state.vehicle,
        stops,
    },
    selectedSearchResults: updateSelectedSearchResults(state.selectedSearchResults, entityKey, { stops }),
});

const handleFetchStopRoutesStops = (state, { payload: { entityKey, stops } }) => ({
    ...state,
    stop: { ...state.stop, stops },
    selectedSearchResults: updateSelectedSearchResults(state.selectedSearchResults, entityKey, { stops }),
});

const handleUpdateVehicleVehiclePredicate = (state, { payload: { entityKey, vehiclePredicate } }) => ({
    ...state,
    vehicle: { ...state.vehicle, vehiclePredicate },
    selectedSearchResults: updateSelectedSearchResults(state.selectedSearchResults, entityKey, { vehiclePredicate }),
});

const handleUpdateRouteVehiclePredicate = (state, { payload: { entityKey, vehiclePredicate } }) => ({
    ...state,
    route: { ...state.route, vehiclePredicate },
    selectedSearchResults: updateSelectedSearchResults(state.selectedSearchResults, entityKey, { vehiclePredicate }),
});

const handleUpdateStopVehiclePredicate = (state, { payload: { entityKey, vehiclePredicate } }) => ({
    ...state,
    stop: { ...state.stop, vehiclePredicate },
    selectedSearchResults: updateSelectedSearchResults(state.selectedSearchResults, entityKey, { vehiclePredicate }),
});

const handleRemoveSelectedSearchResult = (state, { payload: { selectedSearchResult } }) => {
    const { [selectedSearchResult.key]: removedSearchResult, ...selectedSearchResults } = state.selectedSearchResults;
    return { ...state, selectedSearchResults };
};

const handleClearSelectedSearchResult = state => ({ ...state, selectedSearchResults: {} });

// This handler basically updates the selected vehicle in detail from the vehicle updates received
export const handleVehiclesUpdate = (state, { payload: { vehicles } }) => {
    if (isEmpty(vehicles)) return state;

    const vehicleId = state?.vehicle?.id;
    const possibleUpdates = filter(vehicles, v => v.id === vehicleId);
    if (!vehicleId || isEmpty(possibleUpdates)) return state; // Another early return

    const vehicleToBeUpdated = possibleUpdates.length ? possibleUpdates[0].vehicle : {};
    return {
        ...state,
        vehicle: {
            ...state.vehicle,
            ...vehicleToBeUpdated,
        },
    };
};

export default handleActions({
    [ACTION_TYPE.CLEAR_DETAIL]: handleClearDetail,
    [ACTION_TYPE.UPDATE_SELECTED_ADDRESS]: handleSelectedAddress,
    [ACTION_TYPE.UPDATE_SELECTED_VEHICLE]: handleSelectedVehicle,
    [ACTION_TYPE.FETCH_TRIP]: handleGetTrip,
    [ACTION_TYPE.FETCH_VEHICLE_FLEET_INFO]: handleVehicleFleetInfo,
    [ACTION_TYPE.FETCH_VEHICLE_UPCOMING_STOPS]: handleUpcomingStopsOfSelectedVehicle,
    [ACTION_TYPE.FETCH_VEHICLE_PAST_STOPS]: handlePastStopsOfSelectedVehicle,
    [ACTION_TYPE.UPDATE_SELECTED_STOP]: handleSelectedStop,
    [ACTION_TYPE.FETCH_STOP_ROUTES]: handleRouteByStop,
    [ACTION_TYPE.FETCH_STOP_DISRUPTIONS]: handleDisruptionsByStop,
    [ACTION_TYPE.FETCH_STOP_UPCOMING_VEHICLES]: handleUpcomingVehiclesOfSelectedStop,
    [ACTION_TYPE.FETCH_STOP_PAST_VEHICLES]: handlePastVehiclesOfSelectedStop,
    [ACTION_TYPE.FETCH_STOP_PID_MESSAGES]: handlePidMessagesOfSelectedStop,
    [ACTION_TYPE.FETCH_STOP_PID_INFORMATION]: handlePidInformationOfSelectedStop,
    [ACTION_TYPE.UPDATE_SELECTED_ROUTE]: handleSelectedRoute,
    [ACTION_TYPE.FETCH_ROUTE_TRIPS]: handleRoutesByShortName,
    [ACTION_TYPE.UPDATE_SELECTED_SEARCH_RESULTS_CHECK_STATUS]: handleUpdateSearchResultsCheckStatus,
    [ACTION_TYPE.UPDATE_VIEW_DETAIL_KEY]: handleUpdateViewDetailKey,
    [ACTION_TYPE.ADD_SELECTED_SEARCH_RESULT]: handleAddSelectedSearchResult,
    [ACTION_TYPE.FETCH_ROUTE_STOPS]: handleFetchRouteStops,
    [ACTION_TYPE.FETCH_VEHICLE_TRIP_STOPS]: handleFetchVehicleTripStops,
    [ACTION_TYPE.FETCH_STOP_ROUTES_STOPS]: handleFetchStopRoutesStops,
    [ACTION_TYPE.UPDATE_VEHICLE_VEHICLE_PREDICATE]: handleUpdateVehicleVehiclePredicate,
    [ACTION_TYPE.UPDATE_ROUTE_VEHICLE_PREDICATE]: handleUpdateRouteVehiclePredicate,
    [ACTION_TYPE.UPDATE_STOP_VEHICLE_PREDICATE]: handleUpdateStopVehiclePredicate,
    [ACTION_TYPE.REMOVE_SELECTED_SEARCH_RESULT]: handleRemoveSelectedSearchResult,
    [ACTION_TYPE.CLEAR_SELECTED_SEARCH_RESULT]: handleClearSelectedSearchResult,
    [ACTION_TYPE.FETCH_VEHICLES_REALTIME]: handleVehiclesUpdate,
}, INIT_STATE);
