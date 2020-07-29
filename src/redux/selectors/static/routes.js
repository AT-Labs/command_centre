import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getRoutesState = state => _.result(state, 'static.routes');
export const getAllRoutes = createSelector(getRoutesState, routesState => routesState || {});
export const hasRoutesLoaded = createSelector(getAllRoutes, routes => !_.isEmpty(routes));
export const getRouteSearchTerms = route => _.result(route, 'route_short_name');
