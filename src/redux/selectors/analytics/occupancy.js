import { result, countBy, orderBy, map } from 'lodash-es';
import { createSelector } from 'reselect';

export const getAnalyticsState = state => result(state, 'analytics');
export const getOccupancyState = createSelector(getAnalyticsState, analyticsState => result(analyticsState, 'occupancy'));
export const getTopRoutes = createSelector(
    getOccupancyState,
    occupancyState => orderBy(map(countBy(occupancyState, 'route_id'), (key, val) => ({ route_id: val, total: key })), 'total', 'desc'),
);
export const getRoutesIdMappings = createSelector(getAnalyticsState, analyticsState => result(analyticsState, 'routeIdMappings'));
export const getOccupancyFilters = createSelector(getAnalyticsState, analyticsState => result(analyticsState, 'occupancyFilters'));
export const getAgencyFilters = createSelector(getAnalyticsState, analyticsState => result(analyticsState, 'agencyFilter'));
export const getRoutesFilters = createSelector(getAnalyticsState, analyticsState => result(analyticsState, 'routesFilters'));
export const getIsLoadingChart = createSelector(getAnalyticsState, analyticsState => result(analyticsState, 'isLoading'));
