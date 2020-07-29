import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {};

const handleGetRoutes = (state, { payload: { routes } }) => ({ ...routes });

export default handleActions({
    [ACTION_TYPE.FETCH_ROUTES]: handleGetRoutes,
}, INIT_STATE);
