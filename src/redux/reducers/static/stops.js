import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    all: {},
    visible: [],
};

const handleGetAllStops = (state, { payload: { all } }) => ({ ...state, all });
const handleUpdateVisibleStops = (state, { payload: { visible } }) => ({ ...state, visible });

export default handleActions({
    [ACTION_TYPE.FETCH_STOPS]: handleGetAllStops,
    [ACTION_TYPE.UPDATE_VISIBLE_STOPS]: handleUpdateVisibleStops,
}, INIT_STATE);
