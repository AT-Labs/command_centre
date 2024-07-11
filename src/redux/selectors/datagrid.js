import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getDatagridState = state => result(state, 'datagridConfig');
export const getRoutesTripsDatagridConfig = createSelector(getDatagridState, datagridState => result(datagridState, 'routesTripsDatagridConfig'));
export const getDefaultRoutesTripsDatagridConfig = createSelector(getDatagridState, datagridState => result(datagridState, 'defaultRoutesTripsDatagridConfig'));
