import { result } from 'lodash-es';
import { createSelector } from 'reselect';
import VIEW_TYPE from '../../../../types/view-types';

export const getRouteFilters = state => result(state, 'control.routes.filters');
export const getAgencyIdRouteFilter = createSelector(getRouteFilters, routeFilters => result(routeFilters, 'agencyId'));
export const getDepotIdsRouteFilter = createSelector(getRouteFilters, routeFilters => result(routeFilters, 'depotIds'));
export const getModeRouteFilter = createSelector(getRouteFilters, routeFilters => result(routeFilters, 'routeType'));
export const getGroupedByRouteFilter = createSelector(getRouteFilters, routeFilters => result(routeFilters, 'isGroupedByRoute'));
export const getGroupedByRouteVariantFilter = createSelector(getRouteFilters, routeFilters => result(routeFilters, 'isGroupedByRouteVariant'));
export const getStartTimeFromFilter = createSelector(getRouteFilters, routeFilters => result(routeFilters, 'startTimeFrom'));
export const getStartTimeToFilter = createSelector(getRouteFilters, routeFilters => result(routeFilters, 'startTimeTo'));
export const getTripStatusFilter = createSelector(getRouteFilters, routeFilters => result(routeFilters, 'tripStatus'));
export const getRouteShortNameFilter = createSelector(getRouteFilters, routeFilters => result(routeFilters, 'routeShortName'));
export const getRouteVariantIdFilter = createSelector(getRouteFilters, routeFilters => result(routeFilters, 'routeVariantId'));
export const getTrackingStatusesFilter = createSelector(getRouteFilters, routeFilters => result(routeFilters, 'trackingStatuses'));
export const getSorting = createSelector(getRouteFilters, routeFilters => result(routeFilters, 'sorting'));
export const getDelayRangeRouteFilter = createSelector(getRouteFilters, routeFilters => result(routeFilters, 'delayRange'));

export const getControlDetailRoutesViewType = createSelector(getRouteFilters, (routeFilters) => {
    const { isGroupedByRoute, isGroupedByRouteVariant } = routeFilters;
    let viewType = '';

    if (isGroupedByRoute) {
        viewType = isGroupedByRouteVariant
            ? VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_ROUTE_VARIANTS_TRIPS
            : VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_TRIPS;
    } else {
        viewType = isGroupedByRouteVariant
            ? VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTE_VARIANTS_TRIPS
            : VIEW_TYPE.CONTROL_DETAIL_ROUTES.TRIPS;
    }
    return viewType;
});
