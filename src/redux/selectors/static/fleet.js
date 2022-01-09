import { groupBy, result, values } from 'lodash-es';
import { createSelector } from 'reselect';

export const getFleetState = state => result(state, 'static.fleet');
export const getFleetByType = createSelector(getFleetState, fleetState => groupBy(values(fleetState), 'type.type'));
export const getAllFleetTrains = createSelector(getFleetByType, fleetByType => result(fleetByType, 'Train', []));
export const getAllFleetBuses = createSelector(getFleetByType, fleetByType => result(fleetByType, 'Bus', []));
export const getAllFleetFerries = createSelector(getFleetByType, fleetByType => result(fleetByType, 'Ferry', []));
export const hasFleetLoaded = createSelector(
    getAllFleetTrains,
    getAllFleetBuses,
    getAllFleetFerries,
    (trains, buses, ferries) => !!trains.length && !!buses.length && !!ferries.length,
);

export const getFleetVehicleAgencyName = fleetInfo => result(fleetInfo, 'agency.agencyName');
export const getFleetVehicleAgencyId = fleetInfo => result(fleetInfo, 'agency.agencyId');
export const getFleetVehicleCapacity = fleetInfo => result(fleetInfo, 'capacity');
export const getFleetVehicleType = fleetInfo => result(fleetInfo, 'type.type');
export const getFleetVehicleLabel = fleetInfo => result(fleetInfo, 'label');
