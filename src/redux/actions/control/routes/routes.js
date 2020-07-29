import _ from 'lodash-es';
import ErrorType from '../../../../types/error-types';
import * as TRIP_MGT_API from '../../../../utils/transmitters/trip-mgt-api';
import ACTION_TYPE from '../../../action-types';
import { getLinkRouteShortName, getLinkRouteVariantId } from '../../../selectors/control/link';
import { setBannerError } from '../../activity';
import {
    clearRouteVariants, updateRouteVariantsFromRoutes, updateRouteVariantsLoadingState,
    updateActiveRouteVariant, clearActiveRouteVariant,
} from './routeVariants';

const updateRoutes = routes => ({
    type: ACTION_TYPE.FETCH_CONTROL_ROUTES,
    payload: {
        routes,
    },
});

export const updateLoadingState = isLoading => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_CONTROL_ROUTES_LOADING,
        payload: {
            isLoading,
        },
    });
    dispatch(updateRouteVariantsLoadingState(isLoading));
};

export const clearRoutes = () => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.CLEAR_CONTROL_ROUTES,
        payload: { },
    });
    dispatch(clearRouteVariants());
};

export const setActiveRoute = activeRouteShortName => ({
    type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE,
    payload: {
        activeRouteShortName,
    },
});

export const updateActiveRoute = activeRouteShortName => (dispatch) => {
    dispatch(setActiveRoute(activeRouteShortName));
    dispatch(clearActiveRouteVariant());
};

export const clearActiveRoute = () => (dispatch) => {
    dispatch(updateActiveRoute(null));
};

const getRouteDescription = (name, variants) => {
    if (!variants || !variants.length) return '';
    if (_.startsWith(name, '0')) return 'School buses';
    if (name === 'SKY') return '';
    return _.get(variants[0], 'routeLongName');
};

export const fetchRoutes = variables => (dispatch, getState) => {
    const state = getState();
    const linkRouteShortName = getLinkRouteShortName(state);
    const linkRouteVariantId = getLinkRouteVariantId(state);

    dispatch(updateLoadingState(true));
    dispatch(clearActiveRoute());
    dispatch(clearRoutes());

    TRIP_MGT_API.getRoutes(variables)
        .then((rawRoutes) => {
            const routes = _.map(_.result(rawRoutes, 'routes'), route => ({
                ...route,
                description: getRouteDescription(route.routeShortName, route.routeVariants) || '—',
            }));
            dispatch(updateRoutes(routes));
            dispatch(updateRouteVariantsFromRoutes(routes));

            if (linkRouteShortName) {
                dispatch(updateActiveRoute(linkRouteShortName));
            }

            if (linkRouteVariantId) {
                dispatch(updateActiveRouteVariant(linkRouteVariantId));
            }
        })
        .catch(() => {
            if (ErrorType.routesFetchEnabled) {
                dispatch(setBannerError(ErrorType.routesFetch));
            }
        })
        .finally(() => {
            dispatch(updateLoadingState(false));
        });
};
