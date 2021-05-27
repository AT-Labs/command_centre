import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    all: {},
    visible: [],
};

const handleGetAllStops = (state, { payload: { all } }) => ({ ...state, all });

export default handleActions({
    [ACTION_TYPE.FETCH_STOPS]: handleGetAllStops,
}, INIT_STATE);
