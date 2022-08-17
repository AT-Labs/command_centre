import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getVehicleReplay = state => _.result(state, 'control.vehicleReplays.currentVehicleReplay');

export const getEventPosition = createSelector(getVehicleReplay, vehicleReplay => _.result(vehicleReplay, 'events'));
export const getFirstEventPosition = createSelector(getVehicleReplay, vehicleReplay => _.result(vehicleReplay, 'firstEvent'));
