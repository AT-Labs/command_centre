import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../../action-types';

export const INIT_STATE = {
    isLoading: false,
    all: [],
    active: null,
};

const handleLoadingUpdate = (state, { payload: { isLoading } }) => ({ ...state, isLoading });
const handleRoutesUpdate = (state, { payload: { routes } }) => ({ ...state, all: routes });
const handleRoutesClear = state => ({ ...state, all: [] });
const handleActiveRouteUpdate = (state, { payload: { activeRouteShortName } }) => ({ ...state, active: activeRouteShortName });

export default handleActions({
    [ACTION_TYPE.UPDATE_CONTROL_ROUTES_LOADING]: handleLoadingUpdate,
    [ACTION_TYPE.FETCH_CONTROL_ROUTES]: handleRoutesUpdate,
    [ACTION_TYPE.CLEAR_CONTROL_ROUTES]: handleRoutesClear,
    [ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE]: handleActiveRouteUpdate,
}, INIT_STATE);
