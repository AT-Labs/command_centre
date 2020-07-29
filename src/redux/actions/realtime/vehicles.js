import _ from 'lodash-es';
import * as gtfsRealTime from '../../../utils/transmitters/gtfs-realtime';
import ACTION_TYPE from '../../action-types';
import { getVehicleId, getVehicleLat, getVehicleRouteId, getVehicleTimestamp } from '../../selectors/realtime/vehicles';
import { getAllRoutes } from '../../selectors/static/routes';
import { getFleetState } from '../../selectors/static/fleet';
import { updateDataLoading, reportError } from '../activity';

let vehiclesTrackingCache = {};
let realTimeSnapshotIntervalId = null;

const decorateWithRouteType = (vehicle, routes) => _.merge(
    vehicle,
    { vehicle: { route: routes[getVehicleRouteId(vehicle)] } },
);

const throttledRealTimeUpdates = _.throttle((dispatch) => {
    dispatch({
        type: ACTION_TYPE.FETCH_VEHICLES_REALTIME,
        payload: {
            vehicles: vehiclesTrackingCache,
        },
    });
    vehiclesTrackingCache = {};
}, 1000);

const isValidVehicleUpdate = (vehicle, allFleet) => _.result(vehicle, 'vehicle') && getVehicleLat(vehicle) && !!allFleet[getVehicleId(vehicle)];

const queryRealTimeSnapshot = () => (dispatch, getState) => {
    dispatch(updateDataLoading(true));
    return gtfsRealTime.getRealTimeSnapshot()
        .then((data) => {
            let state = getState();
            const routes = getAllRoutes(state);
            const allFleet = getFleetState(state);
            const vehicles = data.filter(vehicle => isValidVehicleUpdate(vehicle, allFleet))
                .map(vehicle => decorateWithRouteType(vehicle, routes));
            dispatch({
                type: ACTION_TYPE.FETCH_VEHICLES_REALTIME,
                payload: { vehicles, isSnapshotUpdate: true },
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

export const handleRealTimeUpdate = data => (dispatch, getState) => {
    if (!data) return;
    const state = getState();
    const allFleet = getFleetState(state);

    let isUpdateNeeded = false;
    if (isValidVehicleUpdate(data, allFleet)) {
        const vehicle = _.pick(data, ['id', 'vehicle']);
        const routes = getAllRoutes(state);
        const cachedVehicle = vehiclesTrackingCache[getVehicleId(vehicle)];
        if (!cachedVehicle || getVehicleTimestamp(cachedVehicle) < getVehicleTimestamp(vehicle)) {
            vehiclesTrackingCache[getVehicleId(vehicle)] = decorateWithRouteType(vehicle, routes);
            isUpdateNeeded = true;
        }
    }
    if (isUpdateNeeded) {
        throttledRealTimeUpdates(dispatch);
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
