import { keyBy } from 'lodash-es';
import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {};

const handleFleet = (state, { payload: { fleet } }) => ({ ...state, ...keyBy(fleet, 'id') });

export default handleActions({
    [ACTION_TYPE.FETCH_TRAINS_FROM_FLEET]: handleFleet,
    [ACTION_TYPE.FETCH_BUSES_FROM_FLEET]: handleFleet,
    [ACTION_TYPE.FETCH_FERRIES_FROM_FLEET]: handleFleet,
}, INIT_STATE);
