import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {};

const handleGetRoutesMappings = (state, { payload: { routesMappings } }) => ({ ...routesMappings });

export default handleActions({
    [ACTION_TYPE.FETCH_ROUTES_MAPPINGS]: handleGetRoutesMappings,
}, INIT_STATE);
