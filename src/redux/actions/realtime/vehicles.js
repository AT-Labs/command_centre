import { result, merge, throttle, get, pick } from 'lodash-es';
import * as gtfsRealTime from '../../../utils/transmitters/gtfs-realtime';
import ACTION_TYPE from '../../action-types';
import { getVehicleId, getVehicleLat, getVehicleRouteId, getVehicleTimestamp } from '../../selectors/realtime/vehicles';
import { getAllRoutes } from '../../selectors/static/routes';
import { getFleetState } from '../../selectors/static/fleet';
import { updateDataLoading, reportError } from '../activity';
import { UNSCHEDULED_TAG } from '../../../types/vehicle-types';
import { useDiversion } from '../../selectors/appSettings';

let vehiclesTrackingCache = {};
let tripUpdateCache = {};
let realTimeSnapshotIntervalId = null;

const fetchUnscheduledRouteType = () => ({
    route_id: UNSCHEDULED_TAG,
    route_type: 3,
    extended_route_type: 3,
    route_short_name: UNSCHEDULED_TAG,
    agency_name: '',
    agency_id: '',
    route_color: null,
    route_text_color: null,
    tokens: [],
});

const decorateWithRouteType = (vehicle, routes) => {
    if (vehicle.vehicle.tags?.includes(UNSCHEDULED_TAG)) {
        return merge(vehicle, { vehicle: { route: fetchUnscheduledRouteType() } });
    }

    return merge(vehicle, { vehicle: { route: routes[getVehicleRouteId(vehicle)] } });
};

const throttledRealTimeUpdates = throttle((dispatch, shouldUseDiversion) => {
    dispatch({
        type: ACTION_TYPE.FETCH_VEHICLES_REALTIME,
        payload: {
            vehicles: vehiclesTrackingCache,
            shouldUseDiversion,
        },
    });
    vehiclesTrackingCache = {};
}, 1000);

const throttleTripUpdate = throttle((dispatch) => {
    dispatch({
        type: ACTION_TYPE.FETCH_TRIP_UPDATES_REALTIME,
        payload: {
            tripUpdates: tripUpdateCache,
        },
    });
    tripUpdateCache = {};
}, 1000);

const isValidVehicleUpdate = (vehicle, allFleet) => result(vehicle, 'vehicle') && getVehicleLat(vehicle) && !!allFleet[getVehicleId(vehicle)];
const isValidTripUpdate = (trip, allFleet) => {
    const vehicleId = get(trip, 'tripUpdate.vehicle.id');
    return result(trip, 'tripUpdate') && !!allFleet[vehicleId];
};

const queryRealTimeSnapshot = () => (dispatch, getState) => {
    dispatch(updateDataLoading(true));
    const shouldUseDiversion = useDiversion(getState());
    gtfsRealTime.getTripUpdateRealTimeSnapshot()
        .then((data) => {
            const tripUpdates = data.map(t => t.tripUpdate);
            return dispatch({
                type: ACTION_TYPE.FETCH_TRIP_UPDATES_REALTIME,
                payload: { tripUpdates },
            });
        })
        .catch((error) => {
            dispatch(reportError({ error: { snapshot: error } }));
        });

    return gtfsRealTime.getRealTimeSnapshot()
        .then((data) => {
            let state = getState();
            const routes = getAllRoutes(state);
            const allFleet = getFleetState(state);
            const vehicles = data.filter(vehicle => isValidVehicleUpdate(vehicle, allFleet))
                .map(vehicle => decorateWithRouteType(vehicle, routes));

            dispatch({
                type: ACTION_TYPE.FETCH_VEHICLES_REALTIME,
                payload: { vehicles, isSnapshotUpdate: true, shouldUseDiversion },
            });
            state = null;
        })
        .catch((error) => {
            dispatch(reportError({ error: { snapshot: error } }));
        })
        .finally(() => {
            dispatch(updateDataLoading(false));
        });
};

const updateVehiclePosition = (data, dispatch, state) => {
    const vehicle = pick(data, ['id', 'vehicle']);
    const routes = getAllRoutes(state);
    const cachedVehicle = vehiclesTrackingCache[getVehicleId(vehicle)];
    if (!cachedVehicle || getVehicleTimestamp(cachedVehicle) < getVehicleTimestamp(vehicle)) {
        vehiclesTrackingCache[getVehicleId(vehicle)] = decorateWithRouteType(vehicle, routes);
        return true;
    }
    return false;
};

const updateTripDelay = (data) => {
    const tripUpdate = get(data, 'tripUpdate');
    const vehicleId = get(tripUpdate, 'vehicle.id');
    const cachedVehicle = tripUpdateCache[vehicleId];
    if (!cachedVehicle || getVehicleTimestamp(cachedVehicle) <= tripUpdate.timestamp) {
        tripUpdateCache[vehicleId] = tripUpdate;
        return true;
    }
    return false;
};

export const handleRealTimeUpdate = data => (dispatch, getState) => {
    if (!data) return;
    const state = getState();
    const allFleet = getFleetState(state);

    if (isValidVehicleUpdate(data, allFleet)) {
        const isUpdateNeeded = updateVehiclePosition(data, dispatch, state);
        if (isUpdateNeeded) {
            const shouldUseDiversion = useDiversion(getState());
            throttledRealTimeUpdates(dispatch, shouldUseDiversion);
        }
    }
    if (isValidTripUpdate(data, allFleet)) {
        const isUpdateNeeded = updateTripDelay(data);
        if (isUpdateNeeded) {
            throttleTripUpdate(dispatch);
        }
    }
};

const startRealTimeTracking = () => dispatch => dispatch(queryRealTimeSnapshot())
    .then(() => gtfsRealTime.subscribeRealTimeUpdate({
        onData: (data) => {
            dispatch(handleRealTimeUpdate(data));
            // eslint-disable-next-line no-param-reassign
            data = null;
        },
        onError: error => dispatch(reportError({
            error: { realtime: error },
        })),
    }));

export const startTrackingVehicles = () => (dispatch) => {
    // open websocket connection to get vehicles data
    dispatch(startRealTimeTracking());
    // periodically get the snapshot to remove stale cached vehicles on the map
    realTimeSnapshotIntervalId = window.setInterval(() => dispatch(queryRealTimeSnapshot()), 60 * 1000);

    return {
        stop: () => {
            // close ws connection
            gtfsRealTime.unsubscribeRealTimeUpdate();
            // clear snapshot poller
            if (realTimeSnapshotIntervalId) {
                window.clearInterval(realTimeSnapshotIntervalId);
                realTimeSnapshotIntervalId = null;
            }
        },
    };
};

export const mergeVehicleFilters = filters => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.MERGE_VEHICLE_FILTERS,
        payload: {
            filters,
        },
    });
};
