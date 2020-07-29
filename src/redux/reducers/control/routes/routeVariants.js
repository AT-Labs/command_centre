import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../../action-types';

export const INIT_STATE = {
    isLoading: false,
    all: {},
    active: null,
};

const handleLoadingUpdate = (state, { payload: { isLoading } }) => ({ ...state, isLoading });
const handleRouteVariantsUpdate = (state, { payload: { routeVariants } }) => ({ ...state, all: routeVariants });
const handleRouteVariantsClear = state => ({ ...state, all: {} });
const handleActiveRouteVariantUpdate = (state, { payload: { activeRouteVariantId } }) => ({ ...state, active: activeRouteVariantId });

export default handleActions({
    [ACTION_TYPE.UPDATE_CONTROL_ROUTE_VARIANTS_LOADING]: handleLoadingUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_ROUTE_VARIANTS]: handleRouteVariantsUpdate,
    [ACTION_TYPE.CLEAR_CONTROL_ROUTE_VARIANTS]: handleRouteVariantsClear,
    [ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE_VARIANT]: handleActiveRouteVariantUpdate,
}, INIT_STATE);
