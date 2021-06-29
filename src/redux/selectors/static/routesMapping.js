import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getRoutesMappingState = state => result(state, 'static.routesMappings');
export const getAllRoutesMappings = createSelector(getRoutesMappingState, routesState => routesState || {});
