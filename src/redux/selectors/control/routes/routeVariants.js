import _ from 'lodash-es';
import moment from 'moment';
import { createSelector } from 'reselect';

export const getRouteVariantsState = state => _.result(state, 'control.routes.routeVariants');

export const getFiltersState = state => _.result(state, 'control.routes.filters');

export const getServiceDateState = state => _.result(state, 'control.serviceDate');

export const getRouteVariantsLoadingState = createSelector(getRouteVariantsState, routeVariantsState => _.result(routeVariantsState, 'isLoading'));

export const getActiveRouteVariant = createSelector(getRouteVariantsState, (routeVariantsState) => {
    const routeVariants = _.result(routeVariantsState, 'all');
    const activeRouteVariantId = _.result(routeVariantsState, 'active');
    return _.find(routeVariants, ({ routeVariantId }) => activeRouteVariantId && _.startsWith(routeVariantId, activeRouteVariantId));
});

export const getAllRouteVariants = createSelector(getRouteVariantsState, routeVariantsState => _.result(routeVariantsState, 'all'));

export const getAllRouteVariantsTotal = createSelector(getAllRouteVariants, routeVariants => _.values(routeVariants).length);

const filterRouteVariants = (routeVariants, filters, serviceDateState, isForSearch) => {
    const { routeType, agencyId, routeShortName, routeVariantId } = filters;
    const serviceDate = _.get(serviceDateState, 'date');

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

    const filteredByFilters = _.filter(_.values(routeVariants), filterPredicate);
    const filteredByServiceDate = _.filter(
        filteredByFilters,
        route => moment(serviceDate).isSameOrAfter(route.serviceStartDate, 'day') && moment(serviceDate).isSameOrBefore(route.serviceEndDate, 'day'),
    );

    return _.sortBy(filteredByServiceDate, ['routeShortName', 'routeVariantId']);
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
