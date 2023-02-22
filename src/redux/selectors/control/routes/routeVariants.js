import { result, find, startsWith, get, values, sortBy, filter } from 'lodash-es';
import moment from 'moment';
import { createSelector } from 'reselect';

export const getRouteVariantsState = state => result(state, 'control.routes.routeVariants');

export const getFiltersState = state => result(state, 'control.routes.filters');

export const getServiceDateState = state => result(state, 'control.serviceDate');

export const getRouteVariantsLoadingState = createSelector(getRouteVariantsState, routeVariantsState => result(routeVariantsState, 'isLoading'));

export const getActiveRouteVariant = createSelector(getRouteVariantsState, (routeVariantsState) => {
    const routeVariants = result(routeVariantsState, 'all');
    const activeRouteVariantId = result(routeVariantsState, 'active');
    return find(routeVariants, ({ routeVariantId }) => activeRouteVariantId && startsWith(routeVariantId, activeRouteVariantId));
});

export const getAllRouteVariants = createSelector(getRouteVariantsState, routeVariantsState => result(routeVariantsState, 'all'));

export const getAllRouteVariantsTotal = createSelector(getAllRouteVariants, routeVariants => values(routeVariants).length);

const filterRouteVariants = (routeVariants, filters, serviceDateState, isForSearch) => {
    const { routeType, agencyId, routeShortName, routeVariantId } = filters;
    const serviceDate = get(serviceDateState, 'date');

    const filterPredicate = {};
    if (routeType) { filterPredicate.routeType = routeType; }
    if (agencyId) { filterPredicate.agencyId = agencyId; }

    if (!isForSearch) {
        if (routeVariantId) {
            filterPredicate.routeVariantId = routeVariantId;
        } else if (routeShortName) {
            filterPredicate.routeShortName = routeShortName;
        }
    }

    const filteredByFilters = filter(values(routeVariants), filterPredicate);
    const filteredByServiceDate = filter(
        filteredByFilters,
        route => moment(serviceDate).isSameOrAfter(route.serviceStartDate, 'day') && moment(serviceDate).isSameOrBefore(route.serviceEndDate, 'day'),
    );

    return sortBy(filteredByServiceDate, ['routeShortName', 'routeVariantId']);
};

export const getFilteredRouteVariants = createSelector(
    getAllRouteVariants,
    getFiltersState,
    getServiceDateState,
    (routeVariants, filters, serviceDateState) => filterRouteVariants(routeVariants, filters, serviceDateState, false),
);

export const getFilteredRouteVariantsTotal = createSelector(getFilteredRouteVariants, variants => variants.length);

export const getRouteVariantsForSearch = createSelector(
    getAllRouteVariants,
    getFiltersState,
    getServiceDateState,
    (routeVariants, filters, serviceDateState) => filterRouteVariants(routeVariants, filters, serviceDateState, true),
);
