import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    all: [],
};

const handleAgenciesUpdate = (state, { payload: { agencies } }) => ({ ...state, all: agencies });

export default handleActions({
    [ACTION_TYPE.FETCH_CONTROL_AGENCIES]: handleAgenciesUpdate,
}, INIT_STATE);
