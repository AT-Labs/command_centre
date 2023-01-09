import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getVehicleReplay = state => _.result(state, 'control.vehicleReplays.vehicleReplay');
export const getVehicleEventsAndPositions = createSelector(getVehicleReplay, vehicleReplay => _.result(vehicleReplay, 'vehicleEventsAndPositions'));
export const getVehicleEventsTotalResults = createSelector(getVehicleReplay, vehicleReplay => _.result(vehicleReplay, 'totalEvents'));
export const getVehicleEventsDisplayedTotalResults = createSelector(getVehicleReplay, vehicleReplay => _.result(vehicleReplay, 'totalDisplayedEvents'));
export const getVehicleEventsHasMore = createSelector(getVehicleReplay, vehicleReplay => _.result(vehicleReplay, 'hasMoreVehicleStausAndPositions'));

export const getVehicleEvents = createSelector(getVehicleReplay, vehicleReplay => _.result(vehicleReplay, 'vehicleEvents'));
export const getVehiclePositions = createSelector(getVehicleReplay, vehicleReplay => _.result(vehicleReplay, 'vehiclePositions'));

export const getFirstEventPosition = createSelector(getVehicleReplay, vehicleReplay => _.result(vehicleReplay, 'firstEvent'));
export const getvehicleViewTabStatus = createSelector(getVehicleReplay, vehicleReplay => _.result(vehicleReplay, 'vehicleViewTabStatus'));
