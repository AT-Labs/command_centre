import _ from 'lodash-es';
import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    vehicle: {},
    trip: {},
    stop: {},
    address: {},
    route: {},
};

const handleClearDetail = () => ({ ...INIT_STATE });

const handleGetTrip = (state, { payload: { trip } }) => ({ ...state, trip });

const handleSelectedVehicle = (state, { payload: { vehicle } }) => ({
    ...state,
    vehicle: {
        ...state.vehicle,
        updatedVehicle: vehicle,
    },
});

const handlePastStopsOfSelectedVehicle = (state, { payload: { pastStops } }) => ({
    ...state,
    vehicle: {
        ...state.vehicle,
        pastStops,
        lastStopSequence: _.max(_.map(pastStops, 'stop.stopSequence')) || -1,
    },
});

const handleSelectedStop = (state, { payload: { stop } }) => ({ ...state, stop });

const handleSelectedAddress = (state, { payload: { address } }) => ({ ...state, address });

const handleSelectedRoute = (state, { payload: { route } }) => ({ ...state, route });

const handleRouteByStop = (state, { payload: { routes } }) => ({
    ...state,
    stop: {
        ...state.stop,
        routes,
    },
});

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

const handleRoutesByShortName = (state, { payload: { routes } }) => ({
    ...state,
    route: {
        ...state.route,
        routes,
    },
});

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
    [ACTION_TYPE.FETCH_STOP_UPCOMING_VEHICLES]: handleUpcomingVehiclesOfSelectedStop,
    [ACTION_TYPE.FETCH_STOP_PAST_VEHICLES]: handlePastVehiclesOfSelectedStop,
    [ACTION_TYPE.FETCH_STOP_PID_MESSAGES]: handlePidMessagesOfSelectedStop,
    [ACTION_TYPE.FETCH_STOP_PID_INFORMATION]: handlePidInformationOfSelectedStop,
    [ACTION_TYPE.UPDATE_SELECTED_ROUTE]: handleSelectedRoute,
    [ACTION_TYPE.FETCH_ROUTE_TRIPS]: handleRoutesByShortName,
}, INIT_STATE);
