import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getVehicleReplay = state => _.result(state, 'control.vehicleReplays.vehicleReplay');
export const getVehicleEvents = createSelector(getVehicleReplay, vehicleReplay => _.result(vehicleReplay, 'vehicleEvents'));
export const getVehicleEventsTotalResults = createSelector(getVehicleReplay, vehicleReplay => _.result(vehicleReplay, 'totalEvents'));
export const getVehicleEventsDisplayedTotalResults = createSelector(getVehicleReplay, vehicleReplay => _.result(vehicleReplay, 'totalDisplayedEvents'));
export const getVehicleEventsHasMore = createSelector(getVehicleReplay, vehicleReplay => _.result(vehicleReplay, 'hasMoreVehicleStausAndPositions'));
