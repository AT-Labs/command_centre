import { result, pick, isEmpty, map } from 'lodash-es';
import { createSelector } from 'reselect';

export const getRoutesState = state => result(state, 'static.routes');
export const getAllRoutes = createSelector(getRoutesState, routesState => routesState || {});
export const getMinimalRoutes = createSelector(getAllRoutes, routes => map(routes, route => pick(route, ['route_id', 'route_short_name', 'route_type'])));
export const hasRoutesLoaded = createSelector(getAllRoutes, routes => !isEmpty(routes));
export const getRouteSearchTerms = route => result(route, 'route_short_name');
