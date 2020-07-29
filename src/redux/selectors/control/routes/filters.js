import _ from 'lodash-es';
import { createSelector } from 'reselect';
import VIEW_TYPE from '../../../../types/view-types';

export const getRouteFilters = state => _.result(state, 'control.routes.filters');
export const getAgencyIdRouteFilter = createSelector(getRouteFilters, routeFilters => _.result(routeFilters, 'agencyId'));
export const getDepotIdsRouteFilter = createSelector(getRouteFilters, routeFilters => _.result(routeFilters, 'depotIds'));
export const getModeRouteFilter = createSelector(getRouteFilters, routeFilters => _.result(routeFilters, 'routeType'));
export const getGroupedByRouteFilter = createSelector(getRouteFilters, routeFilters => _.result(routeFilters, 'isGroupedByRoute'));
export const getGroupedByRouteVariantFilter = createSelector(getRouteFilters, routeFilters => _.result(routeFilters, 'isGroupedByRouteVariant'));
export const getStartTimeFromFilter = createSelector(getRouteFilters, routeFilters => _.result(routeFilters, 'startTimeFrom'));
export const getStartTimeToFilter = createSelector(getRouteFilters, routeFilters => _.result(routeFilters, 'startTimeTo'));
export const getTripStatusFilter = createSelector(getRouteFilters, routeFilters => _.result(routeFilters, 'tripStatus'));
export const getRouteShortNameFilter = createSelector(getRouteFilters, routeFilters => _.result(routeFilters, 'routeShortName'));
export const getRouteVariantIdFilter = createSelector(getRouteFilters, routeFilters => _.result(routeFilters, 'routeVariantId'));
export const getTrackingStatusesFilter = createSelector(getRouteFilters, routeFilters => _.result(routeFilters, 'trackingStatuses'));

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
