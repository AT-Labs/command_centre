import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getRoutesState = state => _.result(state, 'control.routes.routes');

export const getRouteVariantsState = state => _.result(state, 'control.routes.routeVariants');

export const getFiltersState = state => _.result(state, 'control.routes.filters');

export const getRoutesLoadingState = createSelector(getRoutesState, routesState => _.result(routesState, 'isLoading'));

export const getActiveRoute = createSelector(getRoutesState, (routesState) => {
    const routes = _.result(routesState, 'all');
    const activeShortName = _.result(routesState, 'active');
    return _.find(routes, { routeShortName: activeShortName });
});

export const getAllRoutesArray = createSelector(getRoutesState, routesState => _.result(routesState, 'all'));
export const getAllRoutes = createSelector(getAllRoutesArray, routesState => _.keyBy(routesState, 'routeShortName'));

export const getAllRoutesTotal = createSelector(getAllRoutes, routes => _.values(routes).length);

const filterRoutes = (routes, routeVariants, filters, isForSearch) => {
    const { routeType, agencyId, routeShortName, routeVariantId } = filters;
    const filterPredicate = {};
    if (routeType) { filterPredicate.routeType = routeType; }
    if (agencyId) {
        filterPredicate.agencyId = agencyId;
    } else {
        filterPredicate.agencyAgnostic = true;
    }

    if (!isForSearch) {
        if (routeVariantId) {
            const shortName = _.get(routeVariants, `all.${routeVariantId}.routeShortName`, null);
            if (shortName) {
                filterPredicate.routeShortName = shortName;
            }
        } else if (routeShortName) {
            filterPredicate.routeShortName = routeShortName;
        }
    }

    return _.sortBy(_.filter(routes, filterPredicate), 'routeShortName');
};

export const getFilteredRoutes = createSelector(
    getAllRoutesArray, getRouteVariantsState, getFiltersState,
    (routes, routeVariants, filters) => filterRoutes(routes, routeVariants, filters, false),
);

export const getFilteredRoutesTotal = createSelector(getFilteredRoutes, routes => routes.length);

export const getRoutesForSearch = createSelector(
    getAllRoutesArray, getRouteVariantsState, getFiltersState,
    (routes, routeVariants, filters) => filterRoutes(routes, routeVariants, filters, true),
);
