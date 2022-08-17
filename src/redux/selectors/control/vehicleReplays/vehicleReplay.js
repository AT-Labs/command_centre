import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getVehicleReplay = state => _.result(state, 'control.vehicleReplays.vehicleReplay');
export const getVehicleReplays = createSelector(getVehicleReplay, vehicleReplay => _.result(vehicleReplay, 'trips'));
export const getVehicleReplaysTotalResults = createSelector(getVehicleReplay, vehicleReplay => _.result(vehicleReplay, 'totalStatus'));
