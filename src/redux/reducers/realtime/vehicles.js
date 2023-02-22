import { result, isEqual, keyBy, map, filter, has } from 'lodash-es';
import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../action-types';
import { getVehiclePosition } from '../../selectors/realtime/vehicles';

const vehicleKeyedById = 'vehicle.vehicle.id';

export const INIT_STATE = {
    all: {},
    filters: {
        predicate: null,
        routeType: null,
        agencyIds: null,
        isShowingDirectionInbound: true,
        isShowingDirectionOutbound: true,
        isShowingSchoolBus: false,
        isShowingNIS: false,
        showingDelay: {},
        showingOccupancyLevels: [],
        showingTags: [],
    },
};

const hasPositionChanged = (existingVehicle, vehicleUpdate) => {
    if (!existingVehicle) { return true; }

    const existingVehiclePosition = getVehiclePosition(existingVehicle);
    const updatedPosition = getVehiclePosition(vehicleUpdate);

    return !isEqual(existingVehiclePosition, updatedPosition);
};

const isValidVehicleUpdate = (existingVehicle, vehicleUpdate) => result(existingVehicle, 'vehicle.timestamp', 0) < vehicleUpdate.vehicle.timestamp;

const handleVehiclesUpdate = (state, action) => {
    const { payload: { isSnapshotUpdate, vehicles } } = action;
    let allVehicles = [];
    if (isSnapshotUpdate) {
        allVehicles = keyBy(
            map(vehicles, (vehicleUpdate, key) => {
                const existingVehicle = state.all[key];
                return isValidVehicleUpdate(existingVehicle, vehicleUpdate) ? vehicleUpdate : existingVehicle;
            }),
            vehicleKeyedById,
        );
    } else {
        let updatedVehicles = keyBy(filter(vehicles, (vehicleUpdate, key) => {
            const existingVehicle = state.all[key];
            return isValidVehicleUpdate(existingVehicle, vehicleUpdate)
                && hasPositionChanged(existingVehicle, vehicleUpdate);
        }), vehicleKeyedById);
        allVehicles = { ...state.all, ...updatedVehicles };
        updatedVehicles = null;
    }

    return {
        ...state,
        all: allVehicles,
    };
};

export const handleVehicleFiltersMerge = (state, { payload: { filters } }) => {
    // when switching between route types, should reset all filters except the predicate
    const newFilters = has(filters, 'routeType') && filters.routeType !== state.filters.routeType ? {
        ...INIT_STATE.filters,
        ...filters,
        predicate: state.filters.predicate,
    } : {
        ...state.filters,
        ...filters,
    };
    return {
        ...state,
        filters: newFilters,
    };
};

export default handleActions({
    [ACTION_TYPE.FETCH_VEHICLES_REALTIME]: handleVehiclesUpdate,
    [ACTION_TYPE.MERGE_VEHICLE_FILTERS]: handleVehicleFiltersMerge,
}, INIT_STATE);
