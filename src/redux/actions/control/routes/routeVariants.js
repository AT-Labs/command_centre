import { keyBy, each, get, concat } from 'lodash-es';

import ACTION_TYPE from '../../../action-types';

const updateRouteVariants = routeVariants => ({
    type: ACTION_TYPE.UPDATE_CONTROL_ROUTE_VARIANTS,
    payload: {
        routeVariants: keyBy(routeVariants, 'routeVariantId'),
    },
});

export const clearRouteVariants = () => ({
    type: ACTION_TYPE.CLEAR_CONTROL_ROUTE_VARIANTS,
    payload: {},
});

export const updateRouteVariantsFromRoutes = routes => (dispatch) => {
    let routeVariants = [];
    each(routes, (route) => {
        const variants = get(route, 'routeVariants', []);
        routeVariants = concat(routeVariants, variants);
    });
    dispatch(updateRouteVariants(routeVariants));
};

export const setActiveRouteVariant = activeRouteVariantId => ({
    type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE_VARIANT,
    payload: {
        activeRouteVariantId,
    },
});

export const updateRouteVariantsLoadingState = isLoading => ({
    type: ACTION_TYPE.UPDATE_CONTROL_ROUTE_VARIANTS_LOADING,
    payload: {
        isLoading,
    },
});

export const updateActiveRouteVariant = activeRouteVariantId => (dispatch) => {
    dispatch(setActiveRouteVariant(activeRouteVariantId));
};

export const clearActiveRouteVariant = () => (dispatch) => {
    dispatch(setActiveRouteVariant(null));
};
