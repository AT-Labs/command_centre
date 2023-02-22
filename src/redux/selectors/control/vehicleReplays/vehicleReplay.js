import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getVehicleReplay = state => result(state, 'control.vehicleReplays.vehicleReplay');
export const getVehicleEventsAndPositions = createSelector(getVehicleReplay, vehicleReplay => result(vehicleReplay, 'vehicleEventsAndPositions'));
export const getVehicleEventsTotalResults = createSelector(getVehicleReplay, vehicleReplay => result(vehicleReplay, 'totalEvents'));
export const getVehicleEventsDisplayedTotalResults = createSelector(getVehicleReplay, vehicleReplay => result(vehicleReplay, 'totalDisplayedEvents'));
export const getVehicleEventsHasMore = createSelector(getVehicleReplay, vehicleReplay => result(vehicleReplay, 'hasMoreVehicleStausAndPositions'));

export const getVehicleEvents = createSelector(getVehicleReplay, vehicleReplay => result(vehicleReplay, 'vehicleEvents'));
export const getVehiclePositions = createSelector(getVehicleReplay, vehicleReplay => result(vehicleReplay, 'vehiclePositions'));

export const getFirstEventPosition = createSelector(getVehicleReplay, vehicleReplay => result(vehicleReplay, 'firstEvent'));
export const getvehicleViewTabStatus = createSelector(getVehicleReplay, vehicleReplay => result(vehicleReplay, 'vehicleViewTabStatus'));
